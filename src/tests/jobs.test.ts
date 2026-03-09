import request from "supertest";
import app from "../app";
import { pool } from "../config/database";

describe("Jobs API", () => {
  const pipelineId = "33333333-3333-3333-3333-333333333333";
  const jobId = "44444444-4444-4444-4444-444444444444";

  beforeAll(async () => {
    await pool.query(
      `
      INSERT INTO pipelines (id, name, source_path, actions, secret)
      VALUES ($1,'test','/webhooks/test','{}','secret')
      ON CONFLICT (id) DO NOTHING
    `,
      [pipelineId]
    );

    await pool.query(
      `
      INSERT INTO jobs (id, pipeline_id, payload, status)
      VALUES ($1,$2,'{}','pending')
      ON CONFLICT (id) DO NOTHING
    `,
      [jobId, pipelineId]
    );

    await pool.query(
      `
      INSERT INTO delivery_attempts
      (job_id, subscriber_url, status, response_code, retry_count)
      VALUES ($1,'http://test.com','failed',500,1)
    `,
      [jobId]
    );
  });

  test("should return all jobs", async () => {
    const res = await request(app).get("/api/jobs");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("should return job by id", async () => {
    const res = await request(app).get(`/api/jobs/${jobId}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(jobId);
  });

  test("should return jobs for a pipeline", async () => {
    const res = await request(app).get(`/api/pipelines/${pipelineId}/jobs`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  test("should return job attempts", async () => {
    const res = await request(app).get(`/api/jobs/${jobId}/attempts`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("should return job history", async () => {
    const res = await request(app).get(`/api/jobs/${jobId}/history`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(jobId);
    expect(res.body.deliveries).toBeDefined();
  });

  afterAll(async () => {
    await pool.query("DELETE FROM delivery_attempts");
    await pool.query("DELETE FROM jobs");
    await pool.query("DELETE FROM pipelines");

    await pool.end();
  });
});
