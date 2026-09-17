import type { Firestore } from "firebase-admin/firestore";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createFakeFirestore } from "../helpers/fakeFirestore";
import type { Trip } from "../../src/types/trip";

let fakeDb: Firestore;

const geocodeDestination = vi.fn();
const fetchRoadRoute = vi.fn();

vi.mock("../../src/config/firebaseAdmin", () => ({
  getFirestoreDb: () => fakeDb,
}));

vi.mock("../../src/config/logger", () => ({
  logger: { warn: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn() },
}));

vi.mock("../../src/services/places/geocode.provider", () => ({ geocodeDestination }));
vi.mock("../../src/services/transport/osrmRoute.provider", () => ({ fetchRoadRoute }));

const { getTransportForTrip } = await import("../../src/services/transport.service");

function trip(overrides: Partial<Trip> = {}): Trip {
  return {
    id: "trip-1",
    userId: "user-1",
    origin: "Mumbai",
    destination: "Goa",
    budget: 20000,
    days: 4,
    transportModePreference: "flight",
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("transport.service", () => {
  beforeEach(() => {
    fakeDb = createFakeFirestore();
    geocodeDestination.mockReset().mockImplementation(async (place: string) =>
      place === "Mumbai" ? { lat: 19.076, lng: 72.8777 } : { lat: 15.3, lng: 74.1 }
    );
    fetchRoadRoute.mockReset().mockResolvedValue({ distanceKm: 582.3, durationMinutes: 552 });
  });

  it("returns the road estimate and deep-link options, preferred mode first", async () => {
    const summary = await getTransportForTrip(trip({ transportModePreference: "bus" }));

    expect(summary.distanceKm).toBe(582.3);
    expect(summary.drivingDurationMinutes).toBe(552);
    expect(summary.options).toHaveLength(3);
    expect(summary.options[0]).toMatchObject({ mode: "bus", recommended: true });
  });

  it("degrades to null distance/duration if geocoding or OSRM fails, without throwing", async () => {
    fetchRoadRoute.mockRejectedValue(new Error("OSRM down"));

    const summary = await getTransportForTrip(trip());

    expect(summary.distanceKm).toBeNull();
    expect(summary.drivingDurationMinutes).toBeNull();
    expect(summary.options).toHaveLength(3);
  });

  it("caches the summary and does not re-fetch on a second call", async () => {
    await getTransportForTrip(trip());
    await getTransportForTrip(trip());

    expect(fetchRoadRoute).toHaveBeenCalledTimes(1);
  });

  it("bypasses the cache when forceRefresh is set", async () => {
    await getTransportForTrip(trip());
    await getTransportForTrip(trip(), { forceRefresh: true });

    expect(fetchRoadRoute).toHaveBeenCalledTimes(2);
  });
});
