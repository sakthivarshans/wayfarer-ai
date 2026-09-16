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
  budget: 15000,
  days: 4,
  transportModePreference: "flight",
};

describe("/api/trips", () => {
  beforeEach(() => {
    fakeDb = createFakeFirestore();
  });

  describe("auth", () => {
    it("rejects requests with no Authorization header", async () => {
      const app = createApp();
      const res = await request(app).get("/api/trips");
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe("UNAUTHORIZED");
    });

    it("rejects requests with an invalid token", async () => {
      const app = createApp();
      const res = await request(app).get("/api/trips").set(authed("garbage"));
      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/trips", () => {
    it("creates a trip for the authenticated user", async () => {
      const app = createApp();
      const res = await request(app)
        .post("/api/trips")
        .set(authed("token-user-1"))
        .send(validBody);

      expect(res.status).toBe(201);
      expect(res.body.trip).toMatchObject({ ...validBody, userId: "user-1" });
      expect(res.body.trip.id).toBeTruthy();
    });

    it("rejects an invalid body with 400 VALIDATION_ERROR", async () => {
      const app = createApp();
      const res = await request(app)
        .post("/api/trips")
        .set(authed("token-user-1"))
        .send({ ...validBody, budget: -5 });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("rejects an unknown transportModePreference", async () => {
      const app = createApp();
      const res = await request(app)
        .post("/api/trips")
        .set(authed("token-user-1"))
        .send({ ...validBody, transportModePreference: "hyperloop" });

      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/trips", () => {
    it("only returns the authenticated user's own trips", async () => {
      const app = createApp();
      await request(app).post("/api/trips").set(authed("token-user-1")).send(validBody);
      await request(app)
        .post("/api/trips")
        .set(authed("token-user-2"))
        .send({ ...validBody, destination: "Manali" });

      const res = await request(app).get("/api/trips").set(authed("token-user-1"));

      expect(res.status).toBe(200);
      expect(res.body.trips).toHaveLength(1);
      expect(res.body.trips[0].userId).toBe("user-1");
    });
  });

  describe("GET /api/trips/:id", () => {
    it("fetches a trip the user owns", async () => {
      const app = createApp();
      const created = await request(app)
        .post("/api/trips")
        .set(authed("token-user-1"))
        .send(validBody);

      const res = await request(app)
        .get(`/api/trips/${created.body.trip.id}`)
        .set(authed("token-user-1"));

      expect(res.status).toBe(200);
      expect(res.body.trip.id).toBe(created.body.trip.id);
    });

    it("returns 404 for a trip that belongs to someone else", async () => {
      const app = createApp();
      const created = await request(app)
        .post("/api/trips")
        .set(authed("token-user-1"))
        .send(validBody);

      const res = await request(app)
        .get(`/api/trips/${created.body.trip.id}`)
        .set(authed("token-user-2"));

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe("NOT_FOUND");
    });

    it("returns 404 for a trip id that doesn't exist", async () => {
      const app = createApp();
      const res = await request(app).get("/api/trips/nope").set(authed("token-user-1"));

      expect(res.status).toBe(404);
    });
  });
});
