import request from "supertest";
import app from "../app";
import { pool } from "../config/database";

afterAll(async () => {
  await pool.end();
});

describe("Pipeline API", () => {
  let pipelineId: string;

  const pipelinePayload = {
    name: "test-pipeline",
    actions: [
      {
        type: "log",
        config: { message: "hello" },
      },
    ],
  };

  it("should create pipeline", async () => {
    const res = await request(app).post("/api/pipelines").send(pipelinePayload);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");

    pipelineId = res.body.id;
  });

  it("should return pipelines", async () => {
    const res = await request(app).get("/api/pipelines");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("should return pipeline by id", async () => {
    const res = await request(app).get(`/api/pipelines/${pipelineId}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(pipelineId);
  });

  it("should update pipeline subscribers", async () => {
    const res = await request(app).put(`/api/pipelines/${pipelineId}`).send({
      subscribers: [],
    });

    expect(res.status).toBe(404); // will be edited
  });

  it("should delete pipeline", async () => {
    const res = await request(app).delete(`/api/pipelines/${pipelineId}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("pipeline deleted");
  });
});
