import express from "express";
import pipelineRoutes from "./modules/pipelines/pipeline.routes";

const app = express();

app.use(express.json());

app.get("/health", (_, res) => {
  res.json({ status: "ok" });
});

app.use("/pipelines", pipelineRoutes);

export default app;

