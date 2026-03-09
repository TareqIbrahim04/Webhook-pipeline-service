import axios from "axios";
import { pool } from "../config/database";
import { DeliveryService } from "../modules/deliveries/delivery.service";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("Delivery Service", () => {
  const pipelineId = "55555555-5555-5555-5555-555555555555";
  const jobId = "66666666-6666-6666-6666-666666666666";

  const service = new DeliveryService();

  beforeAll(async () => {
    await pool.query(
      `
      INSERT INTO pipelines (id,name,source_path,actions,secret)
      VALUES ($1,'test','/webhook/test','{}','secret')
      ON CONFLICT (id) DO NOTHING
    `,
      [pipelineId]
    );

    await pool.query(
      `
      INSERT INTO jobs (id,pipeline_id,payload,status)
      VALUES ($1,$2,'{}','pending')
      ON CONFLICT (id) DO NOTHING
    `,
      [jobId, pipelineId]
    );

    await pool.query(
      `
      INSERT INTO pipeline_subscribers (pipeline_id,url)
      VALUES ($1,'http://subscriber.test')
    `,
      [pipelineId]
    );
  });

  test("should deliver successfully", async () => {
    mockedAxios.post.mockResolvedValue({
      status: 200,
    } as any);

    await service.deliver(jobId, pipelineId, { event: "test" });

    const result = await pool.query(
      `
    SELECT status
    FROM delivery_attempts
    WHERE job_id = $1
  `,
      [jobId]
    );

    expect(result.rows[0].status).toBe("success");
  });

  test("should schedule retry when delivery fails", async () => {
    mockedAxios.post.mockRejectedValue(new Error("network error"));

    await service.deliver(jobId, pipelineId, { event: "test" });

    const result = await pool.query(
      `
    SELECT status,retry_count
    FROM delivery_attempts
    WHERE job_id = $1
    ORDER BY created_at DESC
  `,
      [jobId]
    );

    expect(result.rows[0].status).toBe("retrying");
    expect(result.rows[0].retry_count).toBe(1);
  });

  afterAll(async () => {
    await pool.query("DELETE FROM delivery_attempts");
    await pool.query("DELETE FROM pipeline_subscribers");
    await pool.query("DELETE FROM jobs");
    await pool.query("DELETE FROM pipelines");

    await pool.end();
  });
});
