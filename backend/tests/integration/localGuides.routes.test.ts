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

const marrakechTrip = {
  origin: "Chennai",
  destination: "Marrakech, Morocco",
  budget: 150000,
  days: 5,
  transportModePreference: "flight",
};

async function seedGuide(destination: string, name = "Amira"): Promise<void> {
  await fakeDb.collection("localGuides").add({
    name,
    destination,
    languages: ["Arabic", "French"],
    specialty: "Medina food tours",
    bio: null,
    photoUrl: null,
    profileUrl: "https://www.toursbylocals.com/guides/amira",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

describe("GET /api/trips/:id/local-guides", () => {
  beforeEach(() => {
    fakeDb = createFakeFirestore();
  });

  it("returns guides matching the trip's destination", async () => {
    await seedGuide("Marrakech");
    await seedGuide("Kyoto", "Kenji");

    const app = createApp();
    const created = await request(app).post("/api/trips").set(authed("token-user-1")).send(marrakechTrip);

    const res = await request(app)
      .get(`/api/trips/${created.body.trip.id}/local-guides`)
      .set(authed("token-user-1"));

    expect(res.status).toBe(200);
    expect(res.body.guides).toHaveLength(1);
    expect(res.body.guides[0]).toMatchObject({ name: "Amira", destination: "Marrakech" });
  });

  it("returns an empty list, not an error, when no guides exist for the destination", async () => {
    const app = createApp();
    const created = await request(app).post("/api/trips").set(authed("token-user-1")).send(marrakechTrip);

    const res = await request(app)
      .get(`/api/trips/${created.body.trip.id}/local-guides`)
      .set(authed("token-user-1"));

    expect(res.status).toBe(200);
    expect(res.body.guides).toEqual([]);
  });

  it("returns 404 for a trip that belongs to someone else", async () => {
    const app = createApp();
    const created = await request(app).post("/api/trips").set(authed("token-user-1")).send(marrakechTrip);

    const res = await request(app)
      .get(`/api/trips/${created.body.trip.id}/local-guides`)
      .set(authed("token-user-2"));

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("returns 404 for a trip id that doesn't exist", async () => {
    const app = createApp();
    const res = await request(app).get("/api/trips/nope/local-guides").set(authed("token-user-1"));

    expect(res.status).toBe(404);
  });

  it("rejects requests with no Authorization header", async () => {
    const app = createApp();
    const res = await request(app).get("/api/trips/some-id/local-guides");

    expect(res.status).toBe(401);
  });
});
