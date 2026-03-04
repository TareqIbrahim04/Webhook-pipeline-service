import { SubscriberRepository } from "./subscriber.repository";
import { pool } from "../../config/database";

export class SubscriberService {
  private repo = new SubscriberRepository();

  async createSubscriber(pipelineId: string, url: string) {

    // Check pipeline exists
    const pipelineCheck = await pool.query(
      "SELECT id FROM pipelines WHERE id = $1 AND deleted_at IS NULL",
      [pipelineId]
    );

    if (pipelineCheck.rows.length === 0) {
      throw new Error("Pipeline not found");
    }

    // Check duplicate subscriber URL inside pipeline
    const duplicateCheck = await pool.query(
      `SELECT id FROM pipeline_subscribers
       WHERE pipeline_id = $1 AND url = $2 AND deleted_at IS NULL`,
      [pipelineId, url]
    );

    if (duplicateCheck.rows.length > 0) {
      throw new Error("Subscriber already exists");
    }

    // Insert subscriber
    return this.repo.createSubscriber(pipelineId, url);
  }
}