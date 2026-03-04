import { pool } from "../../config/database";

export class DeliveryRepository {

  async createAttempt(data: {
    jobId: string;
    subscriberUrl: string;
    attemptNumber: number;
    status: string;
    responseCode: number | null;
  }) {

    await pool.query(
      `
      INSERT INTO delivery_attempts
      (job_id, subscriber_url, attempt_number, status, response_code)
      VALUES ($1,$2,$3,$4,$5)
      `,
      [
        data.jobId,
        data.subscriberUrl,
        data.attemptNumber,
        data.status,
        data.responseCode
      ]
    );
  }
}