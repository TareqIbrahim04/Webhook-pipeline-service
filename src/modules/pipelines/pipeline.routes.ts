import { Router } from "express";
import { createPipeline } from "./pipeline.controller";

const router = Router();

/*
|--------------------------------------------------------------------------
| Pipeline Routes
|--------------------------------------------------------------------------
| POST /pipelines → Create pipeline
| GET /pipelines/:id → Get pipeline
| DELETE /pipelines/:id → Soft delete pipeline
*/

router.post("/pipelines", createPipeline);

export default router;