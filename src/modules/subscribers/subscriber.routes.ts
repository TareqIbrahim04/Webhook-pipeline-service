import { Router } from "express";
import { createSubscriber } from "./subscriber.controller";

const router = Router();

/*
|--------------------------------------------------------------------------
| Subscriber Routes
|--------------------------------------------------------------------------
| POST /api/pipelines/:pipelineId/subscribers
*/

router.post(
  "/pipelines/:pipelineId/subscribers",
  createSubscriber
);

export default router;