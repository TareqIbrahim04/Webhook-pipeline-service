import { pool } from "../../config/database";

export class JobsRepository {

  async findById(jobId: string) {
    const result = await pool.query(
      `SELECT id, pipeline_id, status, created_at
      FROM jobs
      WHERE id = $1`,
      [jobId]
    );

    return result.rows[0];
  }

  async findAll() {
    const result = await pool.query(
      `SELECT * FROM jobs ORDER BY created_at DESC`
    );

    return result.rows;
  }

  async findByPipeline(pipelineId: string) {
    const result = await pool.query(
      `SELECT * FROM jobs WHERE pipeline_id = $1`,
      [pipelineId]
    );

    return result.rows;
  }

  async findAttempts(jobId: string) {
    const result = await pool.query(
      `SELECT *
       FROM delivery_attempts
       WHERE job_id = $1`,
      [jobId]
    );

    return result.rows;
  }

  async findJobHistory(jobId: string) {
    const result = await pool.query(
      `
    SELECT
    j.id AS job_id,
    j.status AS job_status,

    da.subscriber_url,
    da.status AS delivery_status,
    da.response_code,
    da.retry_count,
    da.next_retry_at,
    da.created_at AS delivery_created_at

    FROM jobs j
    LEFT JOIN delivery_attempts da
    ON da.job_id = j.id

    WHERE j.id = $1;`,
      [jobId]
    );
    return result;
  }
}