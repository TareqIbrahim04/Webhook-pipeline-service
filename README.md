# Webhook Pipeline System

A backend service that receives webhooks, processes them through configurable pipelines, and delivers the transformed payload to subscribed endpoints with retry and backoff mechanisms.

This project demonstrates a production-style architecture including background workers, retry logic, database persistence, automated testing, and CI integration.

---

# Features

- Webhook ingestion endpoint
- Configurable pipeline processing
- Action-based payload transformation
- Subscriber delivery system
- Exponential retry strategy
- Background worker processing
- Delivery attempt tracking
- Metrics endpoint
- Automated tests
- CI pipeline

---

# Tech Stack

- Node.js
- TypeScript
- Express
- PostgreSQL
- Jest (testing)
- ESLint + Prettier
- GitHub Actions (CI)

---

# Project Architecture

The system follows a modular architecture.

```
src
 ├── config
 ├── middleware
 ├── types
 ├── modules
 │   ├── pipelines
 │   ├── webhooks
 │   ├── subscribers
 │   ├── deliveries
 │   ├── jobs
 │   └── metrics
 ├── worker
 ├── utils
 └── tests
```

## Core Components

### Webhook API

Receives incoming webhook events and creates a job.

```
POST /api/webhooks/:pipelineId
```

The payload is stored in the database and queued for background processing.

---

### Worker

The worker continuously polls the database for pending jobs.

Processing steps:

1. Fetch pending job
2. Lock the job
3. Load pipeline actions
4. Execute actions
5. Deliver payload to subscribers
6. Record delivery attempts
7. retry if failed
8. Update job status

---

### Pipeline Actions

Pipelines contain a sequence of actions applied to the payload.

Example:

```json
{
  "name": "PIPELINE_NAME",
  "sequence": [
    "uppercase",
    "add_timestamp",
    "multiply_value"
  ]
}
```

Supported actions:

| Action | Description |
|------|------|
| uppercase | Converts message to uppercase |
| add_timestamp | Adds processing timestamp |
| multiply_value | Multiplies numeric value |

Actions are executed sequentially by the worker.

---

### Subscriber Delivery

Each pipeline can have multiple subscriber endpoints.

Subscribers receive processed payloads via HTTP POST.

Example payload sent to subscriber:

```json
{
  "jobId": "job-uuid",
  "data": {
    "message": "HELLO",
    "processedAt": "timestamp"
  }
}
```

---

### Retry Strategy

Failed deliveries are retried using exponential backoff.

Delay formula:

```
delay = baseDelay * 2^(attemptNumber-1)
```

Example retry schedule:

| Attempt | Delay |
|------|------|
| 1 | 2 seconds |
| 2 | 4 seconds |
| 3 | 8 seconds |
| 4 | 16 seconds |

Retries stop after a configurable maximum attempt count.

---

# Database Schema

Main tables:

| Table | Purpose |
|------|------|
| pipelines | Webhook pipeline definitions |
| jobs | Webhook processing jobs |
| pipeline_subscribers | Subscriber endpoints |
| delivery_attempts | Delivery results and retries |

Jobs move through states:

```
pending → processing → completed
                     → failed
                     → cancelled
```

---

# API Endpoints

## Create Pipeline

```
POST /api/pipelines
```

Creates a new webhook pipeline.

---

## Register Subscriber

```
POST /api/pipelines/:pipelineId/subscribers
```

Registers a subscriber endpoint for a pipeline.

---

## Send Webhook

```
POST /api/webhooks/:pipelineId
```

Receives webhook payload and queues a job.

---

## List Jobs

```
GET /api/jobs
```

Returns job history.

---

## Delivery Attempts

```
GET /api/deliveries
```

Returns delivery attempt records.

---

## Metrics

```
GET /api/metrics
```

Returns system metrics.

Example response:

```json
{
  "jobs_total": 10,
  "jobs_completed": 8,
  "jobs_failed": 2,
  "delivery_attempts": 15,
  "retry_queue_size": 1,
  "pipelines_total": 2
}
```

---

# Running the Project

The recommended way to run this project is with Docker.  
Docker will start all required services including the API server, background worker, and PostgreSQL database.

---

# 1. Install Docker

If Docker is not installed on your system, install it first.

## Linux
Follow the official Docker installation guide:

https://docs.docker.com/engine/install/

After installing Docker, also install Docker Compose:

```bash
sudo apt install docker-compose-plugin
```

## macOS / Windows

Download and install **Docker Desktop**:

https://www.docker.com/products/docker-desktop/

Verify installation:

```bash
docker --version
docker compose version
```

---

# 2. Clone the Repository

```bash
git clone <repository-url>
cd webhook-pipeline
```

---

# 3. Configure Environment Variables

Create a `.env` file in the project root.

Example:

```
DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=webhook_pipeline
```

These values are used by the application to connect to the PostgreSQL container.

---

# 4. Build and Start the Application

Run the following command:

```bash
docker compose up --build
```

This command will:

1. Build the application Docker image
2. Start the PostgreSQL database
3. Start the API server
4. Start the background worker

During startup, Docker will also apply the database schema automatically.

---

# 5. Verify the Application

Once all containers are running, the API will be available at:

```
http://localhost:3000
```

Example request:

```bash
curl http://localhost:3000/api/metrics
```

You should receive a JSON response containing system metrics.

---

# 6. Stopping the Application

To stop the containers:

```bash
docker compose down
```

To stop and remove volumes (reset database):

```bash
docker compose down -v
```

---

# Running Tests

Tests can be executed locally with:

```bash
npm install
npm test
```

Tests cover:

- API endpoints
- worker logic
- retry strategy
- delivery system

---

# CI Pipeline

Continuous integration is configured using GitHub Actions.

On every push:

1. PostgreSQL container is started
2. Dependencies are installed
3. Project builds
4. Database schema is applied
5. Tests run automatically

This ensures the application works in a clean environment.

---

# Design Decisions

## Database Job Queue

Jobs are stored in PostgreSQL instead of using an external queue.

Advantages:

- Simpler architecture
- Strong consistency
- Transaction support
- Easy local development

---

## Row Locking for Workers

Workers fetch jobs using:

```
FOR UPDATE SKIP LOCKED
```

This prevents multiple workers from processing the same job.

---

## Background Processing

Webhook ingestion is separated from processing.

Benefits:

- Fast webhook response times
- Resilient processing
- Retry support

---

## Delivery Attempt Tracking

All delivery attempts are recorded.

Benefits:

- Observability
- Retry management
- Debugging failed deliveries

---

# Future Improvements

Possible enhancements:

- Dead letter queue
- Rate limiting
- Webhook signature verification
- Horizontal worker scaling
- Observability dashboards
- Message queue integration (Redis / Kafka)

---

# License

MIT