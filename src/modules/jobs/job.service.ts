import { JobsRepository } from "./job.repository";

export class JobsService {
  private repo = new JobsRepository();

  async getJobById(jobId: string) {
    return this.repo.findById(jobId);
  }

  async getAllJobs() {
    return this.repo.findAll();
  }

  async getJobsByPipeline(pipelineId: string) {
    return this.repo.findByPipeline(pipelineId);
  }

  async getJobAttempts(jobId: string) {
    return this.repo.findAttempts(jobId);
  }

  async getJobHistory(jobId: string) {
    const result = await this.repo.findJobHistory(jobId);

    const rows = result.rows;

    if (rows.length === 0) return null;

    const job: {
      id: any;
      status: any;
      deliveries: {
        subscriber_url: any;
        attempt: {
          status: any;
          response_code: any;
          retry_count: any;
          next_retry_at: any;
          created_at: any;
        };
      }[];
    } = {
      id: rows[0].job_id,
      status: rows[0].job_status,
      deliveries: [],
    };

    for (const row of rows) {
      job.deliveries.push({
        subscriber_url: row.subscriber_url,
        attempt: {
          status: row.delivery_status,
          response_code: row.response_code,
          retry_count: row.retry_count,
          next_retry_at: row.next_retry_at,
          created_at: row.delivery_created_at,
        },
      });
    }

    return job;
  }
}
