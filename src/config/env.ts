import dotenv from "dotenv";

dotenv.config();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export const config = {
  port: Number(process.env.PORT || 3000),

  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(requireEnv("DB_PORT")),
    user: requireEnv("DB_USER"),
    password: requireEnv("DB_PASSWORD"),
    database: requireEnv("DB_NAME"),
  },

  maxRetries: Number(process.env.MAX_RETRIES || 3),
  jobTimeoutSeconds: Number(process.env.JOB_TIMEOUT_SECONDS || 60),
  memoryUsage: process.memoryUsage(),
  uptimeSeconds: process.uptime(),
};
