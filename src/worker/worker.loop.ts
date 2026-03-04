import { pool } from "../config/database";
import { config } from "../config/env";
import { sleep } from "../utils/sleep";
import { executeAction } from "./actions.processor";

export async function startWorker() {
  console.log("Worker started...");

  while (true) {
    try {
      await processNextJob();
    } catch (err) {
      console.error("Worker error:", err);
    }

    // small delay to avoid tight loop
    await sleep(1000);
  }
}

async function processNextJob() {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query(
      `
      SELECT *
      FROM jobs
      WHERE status = 'pending'
         OR (
              status = 'processing'
              AND locked_at < NOW() - INTERVAL '${config.jobTimeoutSeconds} seconds'
            )
      FOR UPDATE SKIP LOCKED
      LIMIT 1
      `
    );

    if (result.rows.length === 0) {
      await client.query("COMMIT");
      return;
    }

    const job = result.rows[0];

    await client.query(
      `
      UPDATE jobs
      SET status = 'processing',
          locked_at = NOW()
      WHERE id = $1
      `,
      [job.id]
    );

    await client.query("COMMIT");

    // Process outside transaction
    await executeJob(job);

  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

async function executeJob(job: any) {

  try {

    const pipelineResult = await pool.query(
      `
      SELECT actions
      FROM pipelines
      WHERE id = $1
      AND deleted_at IS NULL
      `,
      [job.pipeline_id]
    );

    if (!pipelineResult.rows[0]) {
      throw new Error("Pipeline not found");
    }

    let payload = job.payload;

    const actions = pipelineResult.rows[0].actions.sequence;

    for (const action of actions) {
      payload = executeAction(action, payload);
    }

    // Deliver to subscribers (next step)

    await pool.query(
      `
      UPDATE jobs
      SET status = 'completed',
          processed_at = NOW()
      WHERE id = $1
      `,
      [job.id]
    );

  } catch (error) {

    await pool.query(
      `
      UPDATE jobs
      SET status = 'failed'
      WHERE id = $1
      `,
      [job.id]
    );

  }
}