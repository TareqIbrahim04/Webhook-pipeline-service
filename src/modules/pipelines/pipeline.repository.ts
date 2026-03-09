import { pool } from "../../config/database";

export class PipelineRepository {
  async createPipeline(pipeline: any) {
    const query = `
      INSERT INTO pipelines
      (id, name, source_path, actions, secret, rate_limit_per_min)
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING *
    `;

    const values = [
      pipeline.id,
      pipeline.name,
      pipeline.source_path,
      JSON.stringify(pipeline.actions),
      pipeline.secret,
      60,
    ];

    const result = await pool.query(query, values);

    return result.rows[0];
  }

  async getPipelines() {
    const result = await pool.query(
      `
      SELECT *
      FROM pipelines
      Where deleted_at IS NULL
      ORDER BY created_at DESC
      `
    );

    return result.rows;
  }

  async getPipeline(id: string) {
    const result = await pool.query(
      `
      SELECT *
      FROM pipelines
      WHERE deleted_at IS NULL
      AND id = $1
      `,
      [id]
    );

    return result.rows[0];
  }

  async updatePipeline(id: string, data: any) {
    const { subscribers } = data;

    const result = await pool.query(
      `
      UPDATE pipeline_subscribers
      SET subscribers = $1
      WHERE id = $2 AND deleted_at IS NULL
      RETURNING *
      `,
      [subscribers, id]
    );

    return result.rows[0];
  }

  async deletePipeline(id: string) {
    try {
      await pool.query("BEGIN");
      // Lock the pipeline row and verify it exists/isn't already deleted
      const lockResult = await pool.query(
        `SELECT id FROM pipelines WHERE id = $1 AND deleted_at IS NULL FOR UPDATE`,
        [id]
      );

      if (lockResult.rowCount === 0) {
        await pool.query("ROLLBACK");
        throw new Error("Pipeline not found or already deleted");
      }

      await pool.query(
        `UPDATE pipelines SET deleted_at = NOW() WHERE id = $1`,
        [id]
      );

      await pool.query(
        `UPDATE pipeline_subscribers SET deleted_at = NOW() 
       WHERE pipeline_id = $1 AND deleted_at IS NULL`,
        [id]
      );

      await pool.query(
        `UPDATE jobs SET status = 'cancelled' 
      WHERE pipeline_id = $1 AND status = 'pending'`,
        [id]
      );

      await pool.query("COMMIT");
    } catch (error) {
      await pool.query("ROLLBACK");
      throw error;
    }
  }
}
