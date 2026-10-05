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

const completeChat = vi.fn();
vi.mock("../../src/services/ai/groq.provider", () => ({ completeChat }));

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

async function createTrip(app: ReturnType<typeof createApp>, token = "token-user-1"): Promise<string> {
  const created = await request(app).post("/api/trips").set(authed(token)).send(chennaiToParis);
  return created.body.trip.id as string;
}

describe("GET /api/trips/:id/travel-essentials", () => {
  beforeEach(() => {
    fakeDb = createFakeFirestore();
    lookupCountryCode.mockReset().mockImplementation(async (place: string) => (place === "Chennai" ? "IN" : "FR"));
    completeChat.mockReset().mockResolvedValue("Grounded AI summary.");
  });

  it("returns visa and connectivity info for a trip the user owns", async () => {
    const app = createApp();
    const tripId = await createTrip(app);

    const res = await request(app).get(`/api/trips/${tripId}/travel-essentials`).set(authed("token-user-1"));

    expect(res.status).toBe(200);
    const essentials = res.body.travelEssentials;
    expect(essentials.visa.status).toBe("visa-required");
    expect(essentials.passport).toMatchObject({ countryCode: "IN", source: "origin" });
    expect(essentials.connectivity.esimOptions).toHaveLength(2);
    expect(essentials.passportOptions).toHaveLength(199);
    expect(essentials.disclaimer).toBeTruthy();
  });

  it("honours a ?passport= override (case-insensitive)", async () => {
    const app = createApp();
    const tripId = await createTrip(app);

    const res = await request(app)
      .get(`/api/trips/${tripId}/travel-essentials?passport=us`)
      .set(authed("token-user-1"));

    expect(res.status).toBe(200);
    expect(res.body.travelEssentials.passport).toMatchObject({ countryCode: "US", source: "selected" });
    expect(res.body.travelEssentials.visa.status).toBe("visa-free");
  });

  it.each(["USA", "1", "U", "u$"])("rejects a malformed passport value %j with a 400", async (bad) => {
    const app = createApp();
    const tripId = await createTrip(app);

    const res = await request(app)
      .get(`/api/trips/${tripId}/travel-essentials`)
      .query({ passport: bad })
      .set(authed("token-user-1"));

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("rejects a well-formed but unsupported passport country with a 400", async () => {
    const app = createApp();
    const tripId = await createTrip(app);

    const res = await request(app)
      .get(`/api/trips/${tripId}/travel-essentials?passport=ZZ`)
      .set(authed("token-user-1"));

    expect(res.status).toBe(400);
  });

  it("returns 404 for a trip that belongs to someone else", async () => {
    const app = createApp();
    const tripId = await createTrip(app, "token-user-1");

    const res = await request(app).get(`/api/trips/${tripId}/travel-essentials`).set(authed("token-user-2"));

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("returns 404 for a trip id that doesn't exist", async () => {
    const app = createApp();
    const res = await request(app).get("/api/trips/nope/travel-essentials").set(authed("token-user-1"));

    expect(res.status).toBe(404);
  });

  it("rejects requests with no Authorization header", async () => {
    const app = createApp();
    const res = await request(app).get("/api/trips/some-id/travel-essentials");

    expect(res.status).toBe(401);
  });

  it("still succeeds when the AI provider is down", async () => {
    completeChat.mockRejectedValue(new Error("groq down"));
    const app = createApp();
    const tripId = await createTrip(app);

    const res = await request(app).get(`/api/trips/${tripId}/travel-essentials`).set(authed("token-user-1"));

    expect(res.status).toBe(200);
    expect(res.body.travelEssentials.visa.summarySource).toBe("template");
  });
});
