import { pool } from "../../config/database";

export class SubscriberRepository {
  async createSubscriber(pipelineId: string, url: string) {
    const query = `
      INSERT INTO pipeline_subscribers
      (pipeline_id, url)
      VALUES ($1,$2)
      RETURNING *
    `;

    const result = await pool.query(query, [pipelineId, url]);

    return result.rows[0];
  }
}
