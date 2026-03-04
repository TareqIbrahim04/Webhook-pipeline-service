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
      null,
      60
    ];

    const result = await pool.query(query, values);

    return result.rows[0];
  }
}