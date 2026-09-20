process.env.NODE_ENV = "test";
process.env.CORS_ORIGIN = process.env.CORS_ORIGIN ?? "http://localhost:3000";

// Tests run against a real backend/.env on a developer's machine too (not
// just CI, where no .env exists). config/env.ts does `import
// "dotenv/config"`, which only sets a var if it isn't already present in
// process.env — so blanking these here, before that import ever runs,
// stops a developer's real secrets from leaking into the test run and
// silently changing behavior (e.g. a real GEOAPIFY_API_KEY making a route
// test hit the live API instead of its mocked provider). Tests that need
// specific values already mock "../../src/config/env" directly and are
// unaffected by this.
for (const key of [
  "FIREBASE_PROJECT_ID",
  "FIREBASE_CLIENT_EMAIL",
  "FIREBASE_PRIVATE_KEY",
  "GEOAPIFY_API_KEY",
  "GROQ_API_KEY",
  "GROQ_MODEL",
  "TELEGRAM_WEBHOOK_BASE_URL",
  "TOKEN_ENCRYPTION_KEY",
]) {
  process.env[key] = "";
}
