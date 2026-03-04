import express from "express";

import pipelineRoutes from "./modules/pipelines/pipeline.routes";
import subscriberRoutes from "./modules/subscribers/subscriber.routes";

const app = express();

/*
|--------------------------------------------------------------------------
| Middleware
|--------------------------------------------------------------------------
*/

app.use(express.json());

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
*/

app.use("/api", pipelineRoutes);
app.use("/api", subscriberRoutes);

/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/

app.get("/health", (_, res) => {
  res.json({ status: "ok" });
});

export default app;