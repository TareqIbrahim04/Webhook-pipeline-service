import { Request, Response } from "express";
import { PipelineService } from "./pipeline.service";

export async function createPipeline(req: Request, res: Response) {
  try {
    const service = new PipelineService();

    const pipeline = await service.createPipeline(req.body);

    res.status(201).json(pipeline);

  } catch (error) {
    console.error("Create pipeline error:", error);
    res.status(500).json({ error: "controller error" });
  }
}