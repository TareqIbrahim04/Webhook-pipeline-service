import { pool } from "../config/database";
import { config } from "../config/env";
import { sleep } from "../utils/sleep";
import { executeAction } from "./actions.processor";
import { DeliveryService } from "../modules/deliveries/delivery.service";
import { retryLoop } from "./retry.loop";

const deliveryService = new DeliveryService();

export async function startWorker() {
  console.log("Worker started...");

  while (true) {
    try {
      await processNextJob();
    } catch (err) {
      console.error("Worker error:", err);
    }

    // small delay to avoid tight loop
    await sleep(5000);
  }
}

async function processNextJob() {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Fetch the next available job
    const jobResult = await client.query(
      `
      SELECT * FROM jobs
      WHERE status = 'pending'
         OR (status = 'processing' AND locked_at < NOW() - INTERVAL '${config.jobTimeoutSeconds} seconds')
      FOR UPDATE SKIP LOCKED
      LIMIT 1
      `
    );

    if (jobResult.rows.length === 0) {
      await client.query("ROLLBACK");
      console.log("No jobs available for processing. Waiting...");
      return;
    }

    const job = jobResult.rows[0];

    const pipelineResult = await client.query(
      `
      SELECT id FROM pipelines 
      WHERE id = $1 AND deleted_at IS NULL 
      FOR SHARE
      `,
      [job.pipeline_id]
    );

    if (pipelineResult.rowCount === 0) {
      await client.query(
        `
        UPDATE jobs 
        SET status = 'cancelled' 
        WHERE id = $1
        `,
        [job.id]
      );
      await client.query("COMMIT");
      console.log(
        `Job ${job.id} cancelled because parent pipeline was deleted.`
      );
      return;
    }

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

    await executeJob(job);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Worker error:", err);
  } finally {
    client.release();
  }
}

async function executeJob(job: any) {
  try {
    console.log("Processing job:", job.id);
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

    await deliveryService.deliver(job.id, job.pipeline_id, payload);

    retryLoop();

    await pool.query(
      `
      UPDATE jobs
      SET status = 'completed',
          processed_at = NOW()
      WHERE id = $1
      `,
      [job.id]
    );

    console.log("Job completed:", job.id);
  } catch (error) {
    console.error("Error processing job:", job.id, error);
    // Only fail if ACTION PROCESSING crashes
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
