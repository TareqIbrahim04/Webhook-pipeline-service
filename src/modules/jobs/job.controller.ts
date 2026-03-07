import { Request, Response } from "express";
import { JobsService } from "./job.service";
import { error } from "console";

const jobsService = new JobsService();

export async function getJob(req: Request, res: Response) {
  try {
    const jobId = Array.isArray(req.params.jobId)
        ? req.params.jobId[0]
        : req.params.jobId; 
  const job = await jobsService.getJobById(jobId);

  res.json(job);
  } catch {
    res.status(500).json({ error: "failed to fetch job" });
  }
}

export async function getJobs(req: Request, res: Response) {
  try {
    const jobs = await jobsService.getAllJobs();

    res.json(jobs);
  } catch {
    res.status(500).json({ error: "failed to fetch jobs" });
  }
}

export async function getJobsByPipeline(req: Request, res: Response) {
  try {
    const pipelineId = Array.isArray(req.params.pipelineId)
          ? req.params.pipelineId[0]
          : req.params.pipelineId; 

  const jobs = await jobsService.getJobsByPipeline(pipelineId);

  res.json(jobs);
    } catch {
    res.status(500).json({ error: "failed to fetch jobs for pipeline" });
    }
}

export async function getJobAttempts(req: Request, res: Response) {
  try {
    const jobId = Array.isArray(req.params.jobId)
          ? req.params.jobId[0]
          : req.params.jobId;
    
  const attempts = await jobsService.getJobAttempts(jobId);

  res.json(attempts);
  } catch {
    res.status(500).json({ error: "failed to fetch job attempts" });
  }
}

export async function getJobHistory(req: Request, res: Response) {
  try {
    const jobId = Array.isArray(req.params.jobId)
          ? req.params.jobId[0]
          : req.params.jobId; 

  const history = await jobsService.getJobHistory(jobId);

  res.json(history);
  } catch (error) {
    console.error("Error fetching job history:", error);
    res.status(500).json({ error: "failed to fetch job history" });
  }
}