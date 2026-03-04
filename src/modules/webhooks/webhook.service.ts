import { randomUUID } from "crypto";
import { WebhookRepository } from "./webhook.repository";

export class WebhookService {

  private repo = new WebhookRepository();

  async receiveWebhook(pipelineId: string, payload: any) {

    const pipeline = await this.repo.findPipelineById(pipelineId);

    if (!pipeline) {
      throw new Error("Pipeline not found");
    }

    const jobId = randomUUID();

    await this.repo.createJob({
      id: jobId,
      pipelineId,
      payload
    });

    return {
      jobId,
      status: "queued"
    };
  }
}