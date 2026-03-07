// jobs.routes.ts
import { Router } from "express";
import { getJob, getJobs, getJobsByPipeline, getJobAttempts, getJobHistory } from "./job.controller";

const router = Router();

router.get("/jobs", getJobs);
router.get("/jobs/:jobId", getJob);
router.get("/pipelines/:pipelineId/jobs", getJobsByPipeline);
router.get("/jobs/:jobId/attempts", getJobAttempts);
router.get("/jobs/:jobId/history", getJobHistory);

export default router;