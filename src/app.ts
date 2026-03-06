import express from "express";

import pipelineRoutes from "./modules/pipelines/pipeline.routes";
import subscriberRoutes from "./modules/subscribers/subscriber.routes";
import webhookRoutes from "./modules/webhooks/webhook.routes";
import metricsRoutes from "./modules/metrics/metrics.routes";

const app = express();

/*
|--------------------------------------------------------------------------
| Middleware
|--------------------------------------------------------------------------
*/

app.use(
  express.json({
    verify: (req: any, res, buf) => {
      req.rawBody = buf.toString(); // to save the raw body for generating and verify signiture
    }
  })
);

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
*/

app.use("/api", pipelineRoutes);
app.use("/api", subscriberRoutes);
app.use("/api", webhookRoutes);
app.use("/api", metricsRoutes);

/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/

app.get("/health", (_, res) => {
  res.json({ status: "ok" });
});

export default app;