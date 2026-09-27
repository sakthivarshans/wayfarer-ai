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

vi.mock("../../src/services/places/geocode.provider", () => ({
  geocodeDestination: vi.fn().mockResolvedValue({ lat: 15.3, lng: 74.1 }),
}));

vi.mock("../../src/services/restaurants/overpassRestaurants.provider", () => ({
  fetchOverpassRestaurants: vi.fn().mockResolvedValue([
    {
      id: "osm-node-1",
      name: "Britto's",
      description: null,
      category: "restaurant",
      estimatedCost: 500,
      lat: 15.5,
      lng: 73.8,
    },
  ]),
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

describe("GET /api/trips/:id/restaurants", () => {
  beforeEach(() => {
    fakeDb = createFakeFirestore();
  });

  it("returns ranked restaurants for a trip the user owns", async () => {
    const app = createApp();
    const created = await request(app).post("/api/trips").set(authed("token-user-1")).send(validBody);

    const res = await request(app)
      .get(`/api/trips/${created.body.trip.id}/restaurants`)
      .set(authed("token-user-1"));

    expect(res.status).toBe(200);
    expect(res.body.restaurants).toHaveLength(1);
    expect(res.body.restaurants[0]).toMatchObject({ id: "osm-node-1", name: "Britto's" });
  });

  it("returns 404 for a trip that belongs to someone else", async () => {
    const app = createApp();
    const created = await request(app).post("/api/trips").set(authed("token-user-1")).send(validBody);

    const res = await request(app)
      .get(`/api/trips/${created.body.trip.id}/restaurants`)
      .set(authed("token-user-2"));

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("returns 404 for a trip id that doesn't exist", async () => {
    const app = createApp();
    const res = await request(app).get("/api/trips/nope/restaurants").set(authed("token-user-1"));

    expect(res.status).toBe(404);
  });

  it("rejects requests with no Authorization header", async () => {
    const app = createApp();
    const res = await request(app).get("/api/trips/some-id/restaurants");
    expect(res.status).toBe(401);
  });
});
