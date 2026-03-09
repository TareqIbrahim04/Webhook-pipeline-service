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
        sequence: data.actions,
      },
      subscribers: data.subscribers || [],
    };

    return this.repo.createPipeline(pipeline);
  }

  async getPipelines() {
    const result = await this.repo.getPipelines();

    if (result.length === 0) {
      throw new Error("No pipelines found");
    }

    return result;
  }

  async getPipeline(id: string) {
    const result = await this.repo.getPipeline(id);

    if (result.length === 0) {
      throw new Error("Pipeline not found");
    }

    return result;
  }

  async updatePipeline(id: string, data: any) {
    const existingPipeline = await this.repo.getPipeline(id);

    if (existingPipeline.length === 0) {
      throw new Error("Pipeline not found");
    }

    const result = await this.repo.updatePipeline(id, data);

    if (result.length === 0) {
      throw new Error("Failed to update pipeline");
    }

    return result;
  }

  async deletePipeline(id: string) {
    return this.repo.deletePipeline(id);
  }
}
