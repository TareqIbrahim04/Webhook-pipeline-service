import { pool } from "../../config/database";

export class DeliveryRepository {

  async createAttempt(data: {
    jobId: string;
    subscriberUrl: string;
    status: string;
    responseCode: number | null;
    nextRetryAt?: Date;
    retryCount: number;
  }) {

    await pool.query(
      `
      INSERT INTO delivery_attempts
      (job_id, subscriber_url, status, response_code, next_retry_at, retry_count)
      VALUES ($1,$2,$3,$4,$5,$6)
      `,
      [
        data.jobId,
        data.subscriberUrl,
        data.status,
        data.responseCode,
        data.nextRetryAt,
        data.retryCount
      ]
    );
  }

  async markSuccess(
    attemptId: string,
    responseCode: number
  ) {
    await pool.query(
      `
    UPDATE delivery_attempts
    SET status = 'success',
        response_code = $1,
        next_retry_at = NULL,
        updated_at = NOW()
    WHERE id = $2
    `,
      [responseCode, attemptId]
    );
  }

  async markFailed(attemptId: string) {
    await pool.query(
      `
    UPDATE delivery_attempts
    SET status = 'failed',
        next_retry_at = NULL,
        updated_at = NOW()
    WHERE id = $1
    `,
      [attemptId]
    );
  }

  async rescheduleRetry(
    attemptId: string,
    newRetryCount: number,
    nextRetryAt: Date
  ) {
    await pool.query(
      `
    UPDATE delivery_attempts
    SET retry_count = $1,
        next_retry_at = $2,
        status = 'retrying',
        updated_at = NOW()
    WHERE id = $3
    `,
      [newRetryCount, nextRetryAt, attemptId]
    );
  }

  async findAll() {
    const result = await pool.query(`
      SELECT id, job_id, subscriber_url, status, created_at
      FROM deliveries
      ORDER BY created_at DESC
    `);

    return result.rows;
  }
}

