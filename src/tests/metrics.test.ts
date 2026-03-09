import request from "supertest";
import app from "../app";
import { pool } from "../config/database";

describe("Metrics API", () => {

  const pipelineId = "77777777-7777-7777-7777-777777777777";
  const jobId = "88888888-8888-8888-8888-888888888888";

  beforeAll(async () => {

    await pool.query(`
      INSERT INTO pipelines (id,name,source_path,actions,secret)
      VALUES ($1,'test','/webhook/test','{}','secret')
      ON CONFLICT (id) DO NOTHING
    `,[pipelineId]);

    await pool.query(`
      INSERT INTO jobs (id,pipeline_id,payload,status)
      VALUES ($1,$2,'{}','completed')
      ON CONFLICT (id) DO NOTHING
    `,[jobId,pipelineId]);

    await pool.query(`
      INSERT INTO delivery_attempts
      (job_id,subscriber_url,status,response_code,retry_count)
      VALUES ($1,'http://test.com','success',200,0)
    `,[jobId]);

  });

  test("should return system metrics", async () => {

  const res = await request(app)
    .get("/api/metrics");

  expect(res.status).toBe(200);

  expect(res.body).toHaveProperty("jobs_total");
  expect(res.body).toHaveProperty("jobs_completed");
  expect(res.body).toHaveProperty("jobs_failed");
  expect(res.body).toHaveProperty("delivery_attempts");
  expect(res.body).toHaveProperty("retry_queue_size");
  expect(res.body).toHaveProperty("pipelines_total");

});

afterAll(async () => {

  await pool.query("DELETE FROM delivery_attempts");
  await pool.query("DELETE FROM jobs");
  await pool.query("DELETE FROM pipelines");

  await pool.end();

});

});