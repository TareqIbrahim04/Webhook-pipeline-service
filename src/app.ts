import express from "express";

import pipelineRoutes from "./modules/pipelines/pipeline.routes";
import subscriberRoutes from "./modules/subscribers/subscriber.routes";
import webhookRoutes from "./modules/webhooks/webhook.routes";
import metricsRoutes from "./modules/metrics/metrics.routes";
import deliveriesRoutes from "./modules/deliveries/delivery.routes";
import jobRoutes from "./modules/jobs/job.routes";
import shortenerRoutes from "./worker/shortener.routes";

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
    },
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
app.use("/api", deliveriesRoutes);
app.use("/api", jobRoutes);
app.use("/", shortenerRoutes);

/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/

app.get("/health", (_, res) => {
  res.json({ status: "ok" });
});

export default app;
