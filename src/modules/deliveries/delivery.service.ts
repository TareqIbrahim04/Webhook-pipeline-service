import axios from "axios";
import { DeliveryRepository } from "./delivery.repository";
import { pool } from "../../config/database";

export class DeliveryService {

  private repo = new DeliveryRepository();

  async deliver(
    jobId: string,
    pipelineId: string,
    payload: any
  ) {

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

    const subscribers = subscribersResult.rows.map(r => r.url);

    // Send to each subscriber
    let attemptNumber = 1;

    for (const url of subscribers) {
      try {
        const response = await axios.post(
          url,
          {
            jobId,
            data: payload
          },
          { timeout: 5000 }
        );

        await this.repo.createAttempt({
          jobId,
          subscriberUrl: url,
          attemptNumber,
          status: "success",
          responseCode: response.status
        });

      } catch (error: any) {

        await this.repo.createAttempt({
          jobId,
          subscriberUrl: url,
          attemptNumber,
          status: "failed",
          responseCode: null
        });
      }

      attemptNumber++;
    }
  }
}