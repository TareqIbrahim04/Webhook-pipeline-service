import { Router } from "express";
import { getMetrics } from "./metrics.controller";

const router = Router();

router.get("/metrics", getMetrics);

export default router;