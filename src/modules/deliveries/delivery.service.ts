import axios from "axios";
import { DeliveryRepository } from "./delivery.repository";
import { pool } from "../../config/database";
import { calculateBackoffDelay } from "../../worker/retry.strategy";
import { config } from "../../config/env";

export class DeliveryService {
  private repo = new DeliveryRepository();

  async deliver(jobId: string, pipelineId: string, payload: any) {
    // Fetch subscribers
    const subscribersResult = await pool.query(
      `
      SELECT url
      FROM pipeline_subscribers
      WHERE pipeline_id = $1
      AND deleted_at IS NULL
      `,
      [pipelineId]
    );

    const subscribers = subscribersResult.rows.map((r) => r.url);

    // Send to each subscriber
    for (const url of subscribers) {
      try {
        const response = await axios.post(
          url,
          {
            jobId,
            data: payload,
          },
          { timeout: 5000 }
        );

        // Success
        await this.repo.createAttempt({
          jobId,
          subscriberUrl: url,
          retryCount: 0,
          status: "success",
          responseCode: response.status,
        });
      } catch (error: any) {
        // Failed first attempt
        const retryCount = 1;

        const delay = calculateBackoffDelay(retryCount);

        await this.repo.createAttempt({
          jobId,
          subscriberUrl: url,
          retryCount,
          status: "retrying",
          responseCode: null,
          nextRetryAt: new Date(Date.now() + delay),
        });
        return error;
      }
    }
  }

  // This will be called by retry worker
  async retry(attempt: any) {
    try {
      // Fetch job payload again
      const jobResult = await pool.query(
        `
      SELECT payload
      FROM jobs
      WHERE id = $1
      `,
        [attempt.job_id]
      );

      if (!jobResult.rows[0]) {
        throw new Error("Job not found");
      }

      const payload = jobResult.rows[0].payload;

      // Retry HTTP call
      const response = await axios.post(
        attempt.subscriber_url,
        {
          jobId: attempt.job_id,
          data: payload,
        },
        { timeout: 5000 }
      );

      // Mark success
      await this.repo.markSuccess(attempt.id, response.status);
    } catch (error) {
      const newRetryCount = attempt.retry_count + 1;

      if (newRetryCount > config.maxRetries) {
        await this.repo.markFailed(attempt.id);
        return;
      }

      const delay = calculateBackoffDelay(newRetryCount);

      await this.repo.rescheduleRetry(
        attempt.id,
        newRetryCount,
        new Date(Date.now() + delay)
      );
      return error;
    }
  }

  async getAllDeliveries() {
    return this.repo.findAll();
  }
}
