import request from "supertest";
import app from "../app";
import { pool } from "../config/database";

describe("Subscriber API", () => {
  const pipelineId = "99999999-9999-9999-9999-999999999999";
  const url = "http://subscriber.test";

  beforeAll(async () => {
    await pool.query(
      `
      INSERT INTO pipelines (id,name,source_path,actions,secret)
      VALUES ($1,'test','/webhook/test','{}','secret')
      ON CONFLICT (id) DO NOTHING
    `,
      [pipelineId]
    );
  });

  test("should create subscriber", async () => {
    const res = await request(app)
      .post(`/api/pipelines/${pipelineId}/subscribers`)
      .send({ url });

    expect(res.status).toBe(201);
    expect(res.body.url).toBe(url);
  });

  test("should fail if subscriber already exists", async () => {
    const res = await request(app)
      .post(`/api/pipelines/${pipelineId}/subscribers`)
      .send({ url });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Subscriber already exists");
  });

  test("should fail if pipeline not found", async () => {
    const res = await request(app)
      .post("/api/pipelines/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/subscribers")
      .send({ url: "http://new.test" });

    expect(res.status).toBe(400);
  });

  afterAll(async () => {
    await pool.query("DELETE FROM pipeline_subscribers");
    await pool.query("DELETE FROM pipelines");

    await pool.end();
  });
});
