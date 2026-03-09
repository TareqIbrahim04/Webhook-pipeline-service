import request from "supertest";
import crypto from "crypto";
import app from "../app";
import { pool } from "../config/database";

describe("Webhook API", () => {
  let pipelineId: string;
  let secret: string;

  beforeAll(async () => {
    pipelineId = "11111111-1111-1111-1111-111111111111";
    secret = "test-secret";

    await pool.query(
      `
    INSERT INTO pipelines (id, name, source_path, actions, secret)
    VALUES ($1,'test','/webhooks/test','{}',$2)
    ON CONFLICT (id) DO NOTHING
  `,
      [pipelineId, secret]
    );
  });

  afterAll(async () => {
    await pool.query("DELETE FROM delivery_attempts");
    await pool.query("DELETE FROM jobs");
    await pool.query("DELETE FROM pipeline_subscribers");
    await pool.query("DELETE FROM pipelines");

    await pool.end();
  });

  test("should accept webhook and create job", async () => {
    const payload = { event: "user.created" };

    const rawBody = JSON.stringify(payload);

    const signature = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    const res = await request(app)
      .post(`/api/webhooks/${pipelineId}`)
      .set("X-Webhook-Signature", signature)
      .send(payload);

    expect(res.status).toBe(202);
    expect(res.body.status).toBe("queued");
  });

  test("should fail if signature missing", async () => {
    const res = await request(app)
      .post(`/api/webhooks/${pipelineId}`)
      .send({ event: "test" });

    expect(res.status).toBe(401);
  });

  test("should fail with invalid signature", async () => {
    const res = await request(app)
      .post(`/api/webhooks/${pipelineId}`)
      .set("X-Webhook-Signature", "invalid")
      .send({ event: "test" });

    expect(res.status).toBe(401);
  });

  test("should fail if pipeline not found", async () => {
    const payload = { event: "test" };

    const signature = crypto
      .createHmac("sha256", "wrong-secret")
      .update(JSON.stringify(payload))
      .digest("hex");

    const res = await request(app)
      .post(`/api/webhooks/${pipelineId}`)
      .set("X-Webhook-Signature", signature)
      .send(payload);

    expect(res.status).toBe(401);
  });
});
