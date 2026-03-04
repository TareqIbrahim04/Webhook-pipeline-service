import { randomUUID } from "crypto";
import { PipelineRepository } from "./pipeline.repository";

export class PipelineService {

  private repo = new PipelineRepository();
  
  async createPipeline(data: any) {
    const pipelineId = randomUUID();

    const sourcePath = `/webhooks/${pipelineId}`;

    const pipeline = {
      id: pipelineId,
      name: data.name,
      source_path: sourcePath,
      actions: {
        sequence: data.actions
      },
      subscribers: data.subscribers || []
    };

    return this.repo.createPipeline(pipeline);
  }

  
}