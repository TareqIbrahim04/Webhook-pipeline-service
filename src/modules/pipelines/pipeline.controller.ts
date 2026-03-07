import { Request, Response } from "express";
import { PipelineService } from "./pipeline.service";



const service = new PipelineService();
export async function createPipeline(req: Request, res: Response) {
  try {
    const pipeline = await service.createPipeline(req.body);

    res.status(201).json(pipeline);

  } catch (error) {
    console.error("Create pipeline error:", error);
    res.status(500).json({ error: "controller error" });
  }
}

export async function getPipelines(req: Request, res: Response) {
  try {
    const pipelines = await service.getPipelines();

    res.json(pipelines);
  } catch {
    res.status(500).json({ error: "failed to fetch pipelines" });
  }
}

export async function getPipeline(req: Request, res: Response) {
  try {
    const pipelineId = Array.isArray(req.params.pipelineId)
        ? req.params.pipelineId[0]
        : req.params.pipelineId; 

    const pipeline = await service.getPipeline(pipelineId);

    if (!pipeline) {
      return res.status(404).json({ error: "pipeline not found" });
    }

    res.json(pipeline);

  } catch {
    res.status(500).json({ error: "failed to fetch pipeline" });
  }
}

export async function updatePipeline(req: Request, res: Response) {
  try {
    const pipelineId = Array.isArray(req.params.pipelineId)
        ? req.params.pipelineId[0]
        : req.params.pipelineId; 
    const { subscribers } = req.body;

    const pipeline = await service.updatePipeline(pipelineId, { subscribers });

    res.json(pipeline);

  } catch {
    res.status(404).json({ error: "pipeline not found" });
  }
}

export async function deletePipeline(req: Request, res: Response) {
  try {
    const pipelineId = Array.isArray(req.params.pipelineId)
        ? req.params.pipelineId[0]
        : req.params.pipelineId; 

    await service.deletePipeline(pipelineId);

    res.json({ message: "pipeline deleted" });

  } catch {
    res.status(404).json({ error: "pipeline not found" });
  }
}