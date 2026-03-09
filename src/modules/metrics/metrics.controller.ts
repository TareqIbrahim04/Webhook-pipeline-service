import { Request, Response } from "express";
import { MetricsService } from "./metrics.service";

const service = new MetricsService();

export async function getMetrics(req: Request, res: Response) {
  try {
    const metrics = await service.getMetrics();

    res.json(metrics);
  } catch (error) {
    console.error("Metrics error:", error);
    res.status(500).json({ error: "Failed to fetch metrics" });
  }
}
