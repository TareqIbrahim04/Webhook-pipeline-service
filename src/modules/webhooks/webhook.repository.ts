import { pool } from "../../config/database";

export class WebhookRepository {

  async findPipelineById(pipelineId: string) {
    const result = await pool.query(
      `SELECT id, deleted_at
       FROM pipelines
       WHERE id = $1
       AND deleted_at IS NULL`,
      [pipelineId]
    );

    return result.rows[0];
  }

  async createJob(job: {
    id: string;
    pipelineId: string;
    payload: any;
  }) {
    await pool.query(
      `
      INSERT INTO jobs
      (id, pipeline_id, payload, status)
      VALUES ($1,$2,$3,'pending')
      `,
      [job.id, job.pipelineId, job.payload]
    );
  }
}