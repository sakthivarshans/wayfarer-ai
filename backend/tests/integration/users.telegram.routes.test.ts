import { randomBytes } from "crypto";
import type { Firestore } from "firebase-admin/firestore";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createFakeFirestore } from "../helpers/fakeFirestore";

let fakeDb: Firestore;
const tokenEncryptionKey = randomBytes(32).toString("hex");

const TOKENS: Record<string, { uid: string; email: string }> = {
  "token-user-1": { uid: "user-1", email: "one@example.com" },
};

vi.mock("../../src/config/firebaseAdmin", () => ({
  getFirestoreDb: () => fakeDb,
  getFirebaseAuth: () => ({
    verifyIdToken: async (token: string) => {
      const decoded = TOKENS[token];
      if (!decoded) {
        throw new Error("invalid token");
      }
      return decoded;
    },
  }),
}));

vi.mock("../../src/config/env", () => ({
  env: new Proxy(
    {},
    {
      get: (_t, prop) => {
        if (prop === "TELEGRAM_WEBHOOK_BASE_URL") return "https://wayfarer-api.example.com";
        if (prop === "TOKEN_ENCRYPTION_KEY") return tokenEncryptionKey;
        return undefined;
      },
    }
  ),
}));

vi.mock("../../src/services/telegram/api.provider", () => ({
  getMe: vi.fn().mockResolvedValue({ id: 1, username: "MyTripBot", first_name: "Trip" }),
  setWebhook: vi.fn().mockResolvedValue(undefined),
  sendMessage: vi.fn().mockResolvedValue(undefined),
}));

const { createApp } = await import("../../src/app");

function authed(token: string) {
  return { Authorization: `Bearer ${token}` };
}

describe("users/telegram routes", () => {
  beforeEach(() => {
    fakeDb = createFakeFirestore();
  });

  describe("GET /api/users/me/telegram", () => {
    it("returns not connected before any connect call", async () => {
      const app = createApp();
      const res = await request(app).get("/api/users/me/telegram").set(authed("token-user-1"));

      expect(res.status).toBe(200);
      expect(res.body.telegram).toEqual({ connected: false });
    });

    it("rejects requests with no Authorization header", async () => {
      const app = createApp();
      const res = await request(app).get("/api/users/me/telegram");
      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/users/me/telegram", () => {
    it("connects a bot and reflects it in the status afterwards", async () => {
      const app = createApp();

      const connectRes = await request(app)
        .post("/api/users/me/telegram")
        .set(authed("token-user-1"))
        .send({ botToken: "123:abc" });

      expect(connectRes.status).toBe(200);
      expect(connectRes.body.telegram).toMatchObject({ connected: true, botUsername: "MyTripBot" });

      const statusRes = await request(app).get("/api/users/me/telegram").set(authed("token-user-1"));
      expect(statusRes.body.telegram).toMatchObject({ connected: true, botUsername: "MyTripBot" });
    });

    it("never returns the raw bot token in the response", async () => {
      const app = createApp();
      const res = await request(app)
        .post("/api/users/me/telegram")
        .set(authed("token-user-1"))
        .send({ botToken: "123:abc" });

      expect(JSON.stringify(res.body)).not.toContain("123:abc");
    });

    it("rejects an empty bot token with a 400 validation error", async () => {
      const app = createApp();
      const res = await request(app).post("/api/users/me/telegram").set(authed("token-user-1")).send({ botToken: "" });

      expect(res.status).toBe(400);
    });

    it("rejects requests with no Authorization header", async () => {
      const app = createApp();
      const res = await request(app).post("/api/users/me/telegram").send({ botToken: "123:abc" });
      expect(res.status).toBe(401);
    });
  });
});
