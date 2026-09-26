import "dotenv/config";

/**
 * Centralized, typed access to environment variables.
 * Fail fast at startup if a required variable is missing, rather than
 * surfacing a confusing error deep inside a request handler later.
 */
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 4000),
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
  mongodbUri: requireEnv("MONGODB_URI"),
} as const;

export const isProduction = env.nodeEnv === "production";
