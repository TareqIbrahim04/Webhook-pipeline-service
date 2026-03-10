import { SubscriberRepository } from "./subscriber.repository";
import { PipelineRepository } from "../pipelines/pipeline.repository";

export class SubscriberService {
  private repo = new SubscriberRepository();
  private pipeRepo = new PipelineRepository();
  async createSubscriber(pipelineId: string, url: string) {
    // Check pipeline exists
    const pipelineCheck = await this.pipeRepo.getPipeline(pipelineId);

    if (pipelineCheck.rows.length === 0) {
      throw new Error("Pipeline not found");
    }

    // Check duplicate subscriber URL inside pipeline
    const duplicateCheck = await this.repo.checkDuplicate(pipelineId, url);

    if (duplicateCheck.rows.length > 0) {
      throw new Error("Subscriber already exists");
    }

    // Insert subscriber
    return this.repo.createSubscriber(pipelineId, url);
  }
}
