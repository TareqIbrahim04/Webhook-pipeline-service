import { Router } from "express";
import {
  createPipeline,
  getPipelines,
  getPipeline,
  updatePipeline,
  deletePipeline,
} from "./pipeline.controller";

const router = Router();

/*
|--------------------------------------------------------------------------
| Pipeline Routes
|--------------------------------------------------------------------------
| POST /pipelines → Create pipeline
| GET /pipelines/:pipelineId → Get pipeline
| DELETE /pipelines/:pipelineId → Soft delete pipeline
*/

router.post("/pipelines", createPipeline);
router.get("/pipelines/", getPipelines);
router.get("/pipelines/:pipelineId", getPipeline);
router.put("/pipelines/:pipelineId/subscribers", updatePipeline);
router.delete("/pipelines/:pipelineId", deletePipeline);

export default router;
