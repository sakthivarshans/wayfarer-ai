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
  geocodeDestination: vi.fn().mockResolvedValue({ lat: 19.076, lng: 72.8777 }),
}));

vi.mock("../../src/services/places/overpassPlaces.provider", () => ({
  fetchOverpassPlaces: vi.fn().mockResolvedValue([
    { id: "p1", name: "Fort Aguada", description: null, category: "sights", estimatedCost: 0, lat: 15.5, lng: 73.8 },
  ]),
}));

vi.mock("../../src/services/transport/osrmRoute.provider", () => ({
  fetchRoadRoute: vi.fn().mockResolvedValue({ distanceKm: 582.3, durationMinutes: 552 }),
}));

const { createApp } = await import("../../src/app");

function authed(token: string) {
  return { Authorization: `Bearer ${token}` };
}

const validBody = {
  origin: "Mumbai",
  destination: "Goa",
  budget: 15000,
  days: 3,
  transportModePreference: "flight",
};

describe("itinerary routes", () => {
  beforeEach(() => {
    fakeDb = createFakeFirestore();
  });

  describe("GET /api/trips/:id/itinerary", () => {
    it("returns 404 when no itinerary has been generated yet", async () => {
      const app = createApp();
      const created = await request(app).post("/api/trips").set(authed("token-user-1")).send(validBody);

      const res = await request(app)
        .get(`/api/trips/${created.body.trip.id}/itinerary`)
        .set(authed("token-user-1"));

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe("NOT_FOUND");
    });

    it("rejects requests with no Authorization header", async () => {
      const app = createApp();
      const res = await request(app).get("/api/trips/some-id/itinerary");
      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/trips/:id/itinerary/generate", () => {
    it("generates and persists an itinerary for a trip the user owns", async () => {
      const app = createApp();
      const created = await request(app).post("/api/trips").set(authed("token-user-1")).send(validBody);
      const tripId = created.body.trip.id;

      const generateRes = await request(app)
        .post(`/api/trips/${tripId}/itinerary/generate`)
        .set(authed("token-user-1"));

      expect(generateRes.status).toBe(201);
      expect(generateRes.body.itinerary.tripId).toBe(tripId);
      expect(generateRes.body.itinerary.days).toHaveLength(3);
      expect(generateRes.body.itinerary.transport).toMatchObject({ mode: "flight" });
      expect(generateRes.body.itinerary.hotel).toMatchObject({ provider: "Booking.com" });

      const getRes = await request(app).get(`/api/trips/${tripId}/itinerary`).set(authed("token-user-1"));
      expect(getRes.status).toBe(200);
      expect(getRes.body.itinerary).toEqual(generateRes.body.itinerary);
    });

    it("returns 404 for a trip that belongs to someone else", async () => {
      const app = createApp();
      const created = await request(app).post("/api/trips").set(authed("token-user-1")).send(validBody);

      const res = await request(app)
        .post(`/api/trips/${created.body.trip.id}/itinerary/generate`)
        .set(authed("token-user-2"));

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe("NOT_FOUND");
    });

    it("returns 404 for a trip id that doesn't exist", async () => {
      const app = createApp();
      const res = await request(app)
        .post("/api/trips/does-not-exist/itinerary/generate")
        .set(authed("token-user-1"));

      expect(res.status).toBe(404);
    });

    it("rejects requests with no Authorization header", async () => {
      const app = createApp();
      const res = await request(app).post("/api/trips/some-id/itinerary/generate");
      expect(res.status).toBe(401);
    });
  });
});
