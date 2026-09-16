import { z } from "zod";
import "dotenv/config";

const envSchema = z
  .object({
    PORT: z.coerce.number().int().positive().default(4000),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    CORS_ORIGIN: z.string().default("http://localhost:3000"),

    // Required from this phase on (Firebase Admin is initialized in this phase),
    // except in tests, which mock Firebase Admin and never hit real credentials.
    FIREBASE_PROJECT_ID: z.string().optional(),
    FIREBASE_CLIENT_EMAIL: z.string().optional(),
    FIREBASE_PRIVATE_KEY: z.string().optional(),

    // Still optional at this phase: required once Geoapify, Groq, and Telegram
    // integrations land in later phases.
    GEOAPIFY_API_KEY: z.string().optional(),
    GROQ_API_KEY: z.string().optional(),
    TELEGRAM_WEBHOOK_BASE_URL: z.string().optional(),
    TOKEN_ENCRYPTION_KEY: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.NODE_ENV === "test") {
      return;
    }

    const requiredForFirebaseAdmin: Array<keyof typeof value> = [
      "FIREBASE_PROJECT_ID",
      "FIREBASE_CLIENT_EMAIL",
      "FIREBASE_PRIVATE_KEY",
    ];

    for (const key of requiredForFirebaseAdmin) {
      if (!value[key]) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [key],
          message: `${key} is required outside of NODE_ENV=test (Firebase Admin needs it)`,
        });
      }
    }
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
