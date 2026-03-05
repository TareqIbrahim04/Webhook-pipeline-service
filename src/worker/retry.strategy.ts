import { pool } from "../config/database";
import { DeliveryService } from "../modules/deliveries/delivery.service";

export async function retryLoop() {

  const deliveryService = new DeliveryService();

  while (true) {

    try {

      await pool.query("BEGIN");

      const result = await pool.query(`
        SELECT *
        FROM delivery_attempts
        WHERE status = 'retrying'
        AND next_retry_at <= NOW()
        ORDER BY next_retry_at
        LIMIT 10
        FOR UPDATE SKIP LOCKED
      `);

      await pool.query("COMMIT");

      for (const attempt of result.rows) {
        await deliveryService.retry(attempt);
      }

    } catch (error) {

      await pool.query("ROLLBACK");
      console.error("Retry loop error:", error);
    }

    // wait 5 seconds before next check
    await new Promise(res => setTimeout(res, 5000));
  }
}
export function calculateBackoffDelay(
  attemptNumber: number,
  baseDelayMs = 2000
): number {

  // Exponential backoff
  return baseDelayMs * Math.pow(2, attemptNumber - 1);
}
