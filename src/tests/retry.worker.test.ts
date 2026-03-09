import axios from "axios";
import { pool } from "../config/database";
import { DeliveryService } from "../modules/deliveries/delivery.service";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("Retry Worker", () => {
  const jobId = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";

  const service = new DeliveryService();

  let attemptId: string;

  beforeAll(async () => {
    await pool.query(`
      INSERT INTO pipelines (id,name,source_path,actions,secret)
      VALUES ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','test','/webhook','{}','secret')
    `);

    await pool.query(
      `
      INSERT INTO jobs (id,pipeline_id,payload,status)
      VALUES ($1,'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','{}','pending')
    `,
      [jobId]
    );

    const result = await pool.query(
      `
      INSERT INTO delivery_attempts
      (job_id,subscriber_url,status,retry_count,next_retry_at)
      VALUES ($1,'http://test.com','retrying',1,NOW())
      RETURNING id
    `,
      [jobId]
    );

    attemptId = result.rows[0].id;
  });

  test("should mark retry as success", async () => {
    mockedAxios.post.mockResolvedValue({ status: 200 } as any);

    const attempt = {
      id: attemptId,
      job_id: jobId,
      subscriber_url: "http://test.com",
      retry_count: 1,
    };

    await service.retry(attempt);

    const result = await pool.query(
      `
    SELECT status
    FROM delivery_attempts
    WHERE id = $1
  `,
      [attemptId]
    );

    expect(result.rows[0].status).toBe("success");
  });
  test("should reschedule retry when request fails", async () => {
    mockedAxios.post.mockRejectedValue(new Error("network error"));

    const attempt = {
      id: attemptId,
      job_id: jobId,
      subscriber_url: "http://test.com",
      retry_count: 1,
    };

    await service.retry(attempt);

    const result = await pool.query(
      `
    SELECT status,retry_count
    FROM delivery_attempts
    WHERE id = $1
  `,
      [attemptId]
    );

    expect(result.rows[0].status).toBe("retrying");
    expect(result.rows[0].retry_count).toBe(2);
  });
  afterAll(async () => {
    await pool.query("DELETE FROM delivery_attempts");
    await pool.query("DELETE FROM jobs");
    await pool.query("DELETE FROM pipelines");

    await pool.end();
  });
});
