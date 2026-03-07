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
      60
    ];

    const result = await pool.query(query, values);

    return result.rows[0];
  }

  async getPipelines() {
    const result = await pool.query(
      `
      SELECT *
      FROM pipelines
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
      WHERE id = $1
      `,
      [id]
    );

    return result.rows[0];
  }

   async updatePipeline(id: string, data: any) {
    const { subscribers } = data;

    const result = await pool.query(
      `
      UPDATE pipelines
      SET subscribers = $1
      WHERE id = $2
      RETURNING *
      `,
      [subscribers, id]
    );

    return result.rows[0];
  }

  async deletePipeline(id: string) {
    const result = await pool.query(
      `
      DELETE FROM pipelines
      WHERE id = $1
      RETURNING id
      `,
      [id]
    );

    if (result.rowCount === 0) {
      throw new Error("pipeline not found");
    }
  }
}