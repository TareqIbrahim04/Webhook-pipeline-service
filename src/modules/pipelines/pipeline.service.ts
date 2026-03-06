import { randomUUID } from "crypto";
import { PipelineRepository } from "./pipeline.repository";
import { generateWebhookSecret } from "../../utils/crypto";

export class PipelineService {

  private repo = new PipelineRepository();
  
  async createPipeline(data: any) {
    const pipelineId = randomUUID();

    const sourcePath = `/webhooks/${pipelineId}`;
    const secret = generateWebhookSecret();
    
    const pipeline = {
      id: pipelineId,
      name: data.name,
      source_path: sourcePath,
      secret: secret,
      actions: {
        sequence: data.actions
      },
      subscribers: data.subscribers || []
    };

    return this.repo.createPipeline(pipeline);
  }

  
}