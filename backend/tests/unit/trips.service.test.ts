import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Firestore } from "firebase-admin/firestore";
import { createFakeFirestore } from "../helpers/fakeFirestore";

let fakeDb: Firestore;

vi.mock("../../src/config/firebaseAdmin", () => ({
  getFirestoreDb: () => fakeDb,
}));

const { createTrip, getTripById, listTripsForUser } = await import("../../src/services/trips.service");

const baseInput = {
  origin: "Mumbai",
  destination: "Goa",
  budget: 15000,
  days: 4,
  transportModePreference: "flight" as const,
};

describe("trips.service", () => {
  beforeEach(() => {
    fakeDb = createFakeFirestore();
  });

  it("creates a trip and returns it with an id, userId, and createdAt", async () => {
    const trip = await createTrip("user-1", baseInput);

    expect(trip.id).toBeTruthy();
    expect(trip.userId).toBe("user-1");
    expect(trip.origin).toBe("Mumbai");
    expect(trip.destination).toBe("Goa");
    expect(trip.budget).toBe(15000);
    expect(trip.days).toBe(4);
    expect(trip.transportModePreference).toBe("flight");
    expect(typeof trip.createdAt).toBe("string");
  });

  it("lists only the requesting user's trips, newest first", async () => {
    const older = await createTrip("user-1", { ...baseInput, destination: "Goa" });
    await new Promise((r) => setTimeout(r, 2));
    const newer = await createTrip("user-1", { ...baseInput, destination: "Manali" });
    await createTrip("user-2", { ...baseInput, destination: "someone else's trip" });

    const trips = await listTripsForUser("user-1");

    expect(trips.map((t) => t.id)).toEqual([newer.id, older.id]);
    expect(trips.every((t) => t.userId === "user-1")).toBe(true);
  });

  it("returns an empty list for a user with no trips", async () => {
    const trips = await listTripsForUser("nobody");
    expect(trips).toEqual([]);
  });

  it("fetches a trip by id for its owner", async () => {
    const created = await createTrip("user-1", baseInput);

    const found = await getTripById("user-1", created.id);

    expect(found).toEqual(created);
  });

  it("returns null for a non-existent trip id", async () => {
    const found = await getTripById("user-1", "does-not-exist");
    expect(found).toBeNull();
  });

  it("returns null when the trip belongs to a different user", async () => {
    const created = await createTrip("user-1", baseInput);

    const found = await getTripById("user-2", created.id);

    expect(found).toBeNull();
  });
});
