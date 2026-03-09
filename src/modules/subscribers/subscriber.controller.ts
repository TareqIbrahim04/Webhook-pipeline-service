import { Request, Response } from "express";
import { SubscriberService } from "./subscriber.service";

export async function createSubscriber(req: Request, res: Response) {
  try {
    // Handle case where pipelineId is an array
    // (err message: "string[] is not assignable to string")
    const pipelineId = Array.isArray(req.params.pipelineId)
      ? req.params.pipelineId[0]
      : req.params.pipelineId;
    const { url } = req.body;

    const service = new SubscriberService();

    const subscriber = await service.createSubscriber(pipelineId, url);

    res.status(201).json(subscriber);
  } catch (error: any) {
    res.status(400).json({
      error: error.message || "Server error",
    });
  }
}
