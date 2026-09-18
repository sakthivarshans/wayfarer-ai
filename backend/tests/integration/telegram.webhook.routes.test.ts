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

const getMe = vi.fn().mockResolvedValue({ id: 1, username: "MyTripBot", first_name: "Trip" });
const setWebhook = vi.fn().mockResolvedValue(undefined);
const sendMessage = vi.fn().mockResolvedValue(undefined);

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

vi.mock("../../src/services/telegram/api.provider", () => ({ getMe, setWebhook, sendMessage }));

const { createApp } = await import("../../src/app");

function authed(token: string) {
  return { Authorization: `Bearer ${token}` };
}

async function connectAndGetWebhookPath(app: import("express").Application): Promise<string> {
  await request(app).post("/api/users/me/telegram").set(authed("token-user-1")).send({ botToken: "123:abc" });
  const [, url] = setWebhook.mock.calls.at(-1) as [string, string];
  return new URL(url).pathname;
}

describe("telegram webhook route", () => {
  beforeEach(() => {
    fakeDb = createFakeFirestore();
    getMe.mockClear();
    setWebhook.mockClear();
    sendMessage.mockClear();
  });

  it("returns 404 for an unregistered userId/webhookSecret pair", async () => {
    const app = createApp();
    const res = await request(app)
      .post("/api/telegram/webhook/no-such-user/some-secret")
      .send({ message: { chat: { id: 555 }, text: "hi" } });

    expect(res.status).toBe(404);
  });

  it("returns 404 when the webhook secret doesn't match the registered one", async () => {
    const app = createApp();
    const webhookPath = await connectAndGetWebhookPath(app);
    const wrongPath = webhookPath.replace(/[^/]+$/, "wrong-secret");

    const res = await request(app).post(wrongPath).send({ message: { chat: { id: 555 }, text: "hi" } });
    expect(res.status).toBe(404);
  });

  it("accepts a valid update with no message (e.g. an edited_message) and returns 200", async () => {
    const app = createApp();
    const webhookPath = await connectAndGetWebhookPath(app);

    const res = await request(app).post(webhookPath).send({ update_id: 1 });

    expect(res.status).toBe(200);
    expect(sendMessage).not.toHaveBeenCalled();
  });

  it("processes a text message end-to-end and replies via Telegram (no trips yet)", async () => {
    const app = createApp();
    const webhookPath = await connectAndGetWebhookPath(app);

    const res = await request(app).post(webhookPath).send({ message: { chat: { id: 555 }, text: "hi" } });

    expect(res.status).toBe(200);
    expect(sendMessage).toHaveBeenCalledWith("123:abc", "555", expect.stringContaining("don't have any trips"));
  });

  it("is not behind requireAuth — no Authorization header needed", async () => {
    const app = createApp();
    const webhookPath = await connectAndGetWebhookPath(app);

    const res = await request(app).post(webhookPath).send({ message: { chat: { id: 555 }, text: "hi" } });
    expect(res.status).not.toBe(401);
  });
});
