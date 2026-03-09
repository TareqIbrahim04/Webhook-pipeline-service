import { pool } from "../../config/database";

export class MetricsRepository {
  async getJobsTotal() {
    const result = await pool.query(`
      SELECT COUNT(*) FROM jobs
      WHERE deleted_at IS NULL
    `);

    return Number(result.rows[0].count);
  }

  async getJobsCompleted() {
    const result = await pool.query(`
      SELECT COUNT(*) FROM jobs
      WHERE status = 'completed'
    `);

    return Number(result.rows[0].count);
  }

  async getJobsFailed() {
    const result = await pool.query(`
      SELECT COUNT(*) FROM jobs
      WHERE status = 'failed'
    `);

    return Number(result.rows[0].count);
  }

  async getDeliveryAttempts() {
    const result = await pool.query(`
      SELECT COUNT(*) FROM delivery_attempts
    `);

    return Number(result.rows[0].count);
  }

  async getRetryQueueSize() {
    const result = await pool.query(`
      SELECT COUNT(*)
      FROM delivery_attempts
      WHERE status = 'retrying'
    `);

    return Number(result.rows[0].count);
  }

  async getPipelinesTotal() {
    const result = await pool.query(`
      SELECT COUNT(*) FROM pipelines
      WHERE deleted_at IS NULL
    `);

    return Number(result.rows[0].count);
  }
}
