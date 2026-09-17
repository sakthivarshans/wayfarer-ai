import type { Firestore } from "firebase-admin/firestore";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createFakeFirestore } from "../helpers/fakeFirestore";

let fakeDb: Firestore;

const TOKENS: Record<string, { uid: string; email: string }> = {
  "token-user-1": { uid: "user-1", email: "one@example.com" },
  "token-user-2": { uid: "user-2", email: "two@example.com" },
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

const { createApp } = await import("../../src/app");

function authed(token: string) {
  return { Authorization: `Bearer ${token}` };
}

const validBody = {
  origin: "Mumbai",
  destination: "Goa",
  budget: 20000,
  days: 4,
  transportModePreference: "flight",
};

describe("GET /api/trips/:id/hotels", () => {
  beforeEach(() => {
    fakeDb = createFakeFirestore();
  });

  it("returns hotel deep links and a per-night budget hint for a trip the user owns", async () => {
    const app = createApp();
    const created = await request(app).post("/api/trips").set(authed("token-user-1")).send(validBody);

    const res = await request(app).get(`/api/trips/${created.body.trip.id}/hotels`).set(authed("token-user-1"));

    expect(res.status).toBe(200);
    expect(res.body.hotels.perNightBudgetHint).toBe(5000);
    expect(res.body.hotels.options).toHaveLength(3);
  });

  it("returns 404 for a trip that belongs to someone else", async () => {
    const app = createApp();
    const created = await request(app).post("/api/trips").set(authed("token-user-1")).send(validBody);

    const res = await request(app).get(`/api/trips/${created.body.trip.id}/hotels`).set(authed("token-user-2"));

    expect(res.status).toBe(404);
  });

  it("rejects requests with no Authorization header", async () => {
    const app = createApp();
    const res = await request(app).get("/api/trips/some-id/hotels");
    expect(res.status).toBe(401);
  });
});
