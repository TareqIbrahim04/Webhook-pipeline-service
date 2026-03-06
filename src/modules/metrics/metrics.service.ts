import { config } from "../../config/env";
import { MetricsRepository } from "./metrics.repository";

export class MetricsService {

  private repo = new MetricsRepository();

  async getMetrics() {

    const [
      jobsTotal,
      jobsCompleted,
      jobsFailed,
      deliveryAttempts,
      retryQueueSize,
      pipelinesTotal
    ] = await Promise.all([
      this.repo.getJobsTotal(),
      this.repo.getJobsCompleted(),
      this.repo.getJobsFailed(),
      this.repo.getDeliveryAttempts(),
      this.repo.getRetryQueueSize(),
      this.repo.getPipelinesTotal()
    ]);

    return {
      jobs_total: jobsTotal,
      jobs_completed: jobsCompleted,
      jobs_failed: jobsFailed,
      delivery_attempts: deliveryAttempts,
      retry_queue_size: retryQueueSize,
      pipelines_total: pipelinesTotal,
      memory_usage: config.memoryUsage,
      uptime_seconds: config.uptimeSeconds
    };
  }
}