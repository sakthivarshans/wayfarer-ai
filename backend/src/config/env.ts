import { z } from "zod";
import "dotenv/config";

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),

  // Optional at this phase: not yet required for the health-check-only server.
  // These become required (via .refine in a later phase) once Firebase Admin,
  // Geoapify, Groq, and Telegram integrations land.
  FIREBASE_PROJECT_ID: z.string().optional(),
  FIREBASE_CLIENT_EMAIL: z.string().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),
  GEOAPIFY_API_KEY: z.string().optional(),
  GROQ_API_KEY: z.string().optional(),
  TELEGRAM_WEBHOOK_BASE_URL: z.string().optional(),
  TOKEN_ENCRYPTION_KEY: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error("Invalid environment configuration:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = {
  ...parsed.data,
  corsOrigins: parsed.data.CORS_ORIGIN.split(",").map((origin) => origin.trim()),
  isProduction: parsed.data.NODE_ENV === "production",
};
