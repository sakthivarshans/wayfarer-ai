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

const lookupCountryCode = vi.fn();
vi.mock("../../src/services/gettingAround/countryLookup.provider", () => ({ lookupCountryCode }));

const { createApp } = await import("../../src/app");

function authed(token: string) {
  return { Authorization: `Bearer ${token}` };
}

const chennaiToParis = {
  origin: "Chennai",
  destination: "Paris",
  budget: 150000,
  days: 5,
  transportModePreference: "flight",
};

describe("GET /api/trips/:id/getting-around", () => {
  beforeEach(() => {
    fakeDb = createFakeFirestore();
    lookupCountryCode.mockReset().mockResolvedValue("FR");
  });

  it("regression: a Chennai -> Paris trip returns Paris options and nothing about Chennai", async () => {
    const app = createApp();
    const created = await request(app).post("/api/trips").set(authed("token-user-1")).send(chennaiToParis);

    const res = await request(app)
      .get(`/api/trips/${created.body.trip.id}/getting-around`)
      .set(authed("token-user-1"));

    expect(res.status).toBe(200);
    expect(res.body.gettingAround.destination).toBe("Paris");
    expect(res.body.gettingAround.countryCode).toBe("FR");
    expect(res.body.gettingAround.cabs.length).toBeGreaterThan(0);
    expect(res.body.gettingAround.transit.length).toBeGreaterThan(0);
    expect(lookupCountryCode).toHaveBeenCalledWith("Paris");
    expect(JSON.stringify(res.body).toLowerCase()).not.toContain("chennai");
  });

  it("returns 404 for a trip that belongs to someone else", async () => {
    const app = createApp();
    const created = await request(app).post("/api/trips").set(authed("token-user-1")).send(chennaiToParis);

    const res = await request(app)
      .get(`/api/trips/${created.body.trip.id}/getting-around`)
      .set(authed("token-user-2"));

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("returns 404 for a trip id that doesn't exist", async () => {
    const app = createApp();
    const res = await request(app).get("/api/trips/nope/getting-around").set(authed("token-user-1"));

    expect(res.status).toBe(404);
  });

  it("rejects requests with no Authorization header", async () => {
    const app = createApp();
    const res = await request(app).get("/api/trips/some-id/getting-around");

    expect(res.status).toBe(401);
  });
});
