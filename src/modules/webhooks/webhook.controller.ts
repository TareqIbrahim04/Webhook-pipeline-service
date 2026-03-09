import { Request, Response } from "express";
import { WebhookService } from "./webhook.service";

export async function receiveWebhook(req: Request, res: Response) {
  try {
    const service = new WebhookService();

    // Handle case where pipelineId is an array
    // (err message: "string[] is not assignable to string")
    const pipelineId = Array.isArray(req.params.pipelineId)
      ? req.params.pipelineId[0]
      : req.params.pipelineId;

    const result = await service.receiveWebhook(pipelineId, req.body);

    res.status(202).json(result);
  } catch (error: any) {
    res.status(400).json({
      error: error.message || "Server error",
    });
  }
}
