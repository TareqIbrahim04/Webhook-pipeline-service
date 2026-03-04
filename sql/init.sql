CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- for gen_random_uuid()

CREATE TYPE job_status AS ENUM (
    'pending',
    'processing',
    'completed',
    'failed'
);

CREATE TYPE delivery_status AS ENUM (
    'success',
    'failed'
);

CREATE TABLE pipelines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name TEXT,

    source_path TEXT UNIQUE NOT NULL,

    actions JSONB NOT NULL,

    secret TEXT,

    rate_limit_per_min INT DEFAULT 60,

    deleted_at TIMESTAMP NULL,

    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    pipeline_id UUID REFERENCES pipelines(id),

    payload JSONB NOT NULL,

    status job_status NOT NULL DEFAULT 'pending',

    locked_at TIMESTAMP NULL,

    processed_at TIMESTAMP NULL,

    deleted_at TIMESTAMP NULL,

    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE pipeline_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    pipeline_id UUID REFERENCES pipelines(id),

    url TEXT NOT NULL,

    deleted_at TIMESTAMP NULL,

    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE delivery_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    job_id UUID REFERENCES jobs(id),

    subscriber_url TEXT NOT NULL,

    attempt_number INT NOT NULL,

    status delivery_status NOT NULL,

    response_code INT,

    created_at TIMESTAMP DEFAULT NOW()
);