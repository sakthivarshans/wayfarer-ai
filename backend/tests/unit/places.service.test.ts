import type { Firestore } from "firebase-admin/firestore";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createFakeFirestore } from "../helpers/fakeFirestore";
import type { Trip } from "../../src/types/trip";
import type { Place } from "../../src/types/place";

let fakeDb: Firestore;
let geoapifyKey: string | undefined;

const geocodeDestination = vi.fn();
const fetchGeoapifyPlaces = vi.fn();
const fetchOverpassPlaces = vi.fn();

vi.mock("../../src/config/firebaseAdmin", () => ({
  getFirestoreDb: () => fakeDb,
}));

vi.mock("../../src/config/env", () => ({
  env: new Proxy({}, { get: (_t, prop) => (prop === "GEOAPIFY_API_KEY" ? geoapifyKey : undefined) }),
}));

vi.mock("../../src/config/logger", () => ({
  logger: { warn: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn() },
}));

vi.mock("../../src/services/places/geocode.provider", () => ({ geocodeDestination }));
vi.mock("../../src/services/places/geoapifyPlaces.provider", () => ({ fetchGeoapifyPlaces }));
vi.mock("../../src/services/places/overpassPlaces.provider", () => ({ fetchOverpassPlaces }));

const { getPlacesForTrip } = await import("../../src/services/places.service");

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

function rawPlace(overrides: Partial<Place> = {}): Place {
  return {
    id: "p1",
    name: "Fort Aguada",
    description: null,
    category: "sights",
    estimatedCost: 0,
    lat: 15.5,
    lng: 73.8,
    ...overrides,
  };
}

describe("places.service", () => {
  beforeEach(() => {
    fakeDb = createFakeFirestore();
    geoapifyKey = undefined;
    geocodeDestination.mockReset().mockResolvedValue({ lat: 15.3, lng: 74.1 });
    fetchGeoapifyPlaces.mockReset();
    fetchOverpassPlaces.mockReset();
  });

  it("uses Overpass when GEOAPIFY_API_KEY is unset", async () => {
    fetchOverpassPlaces.mockResolvedValue([rawPlace()]);

    const places = await getPlacesForTrip(trip());

    expect(fetchGeoapifyPlaces).not.toHaveBeenCalled();
    expect(fetchOverpassPlaces).toHaveBeenCalledWith({ lat: 15.3, lng: 74.1 });
    expect(places).toHaveLength(1);
  });

  it("prefers Geoapify when a key is configured and it succeeds", async () => {
    geoapifyKey = "test-key";
    fetchGeoapifyPlaces.mockResolvedValue([rawPlace({ id: "geo-1" })]);

    const places = await getPlacesForTrip(trip());

    expect(fetchOverpassPlaces).not.toHaveBeenCalled();
    expect(places[0]?.id).toBe("geo-1");
  });

  it("falls back to Overpass when Geoapify fails", async () => {
    geoapifyKey = "test-key";
    fetchGeoapifyPlaces.mockRejectedValue(new Error("geoapify down"));
    fetchOverpassPlaces.mockResolvedValue([rawPlace({ id: "osm-1" })]);

    const places = await getPlacesForTrip(trip());

    expect(places[0]?.id).toBe("osm-1");
  });

  it("throws a 502 ApiError when both providers fail", async () => {
    geoapifyKey = "test-key";
    fetchGeoapifyPlaces.mockRejectedValue(new Error("geoapify down"));
    fetchOverpassPlaces.mockRejectedValue(new Error("overpass down too"));

    await expect(getPlacesForTrip(trip())).rejects.toMatchObject({ statusCode: 502 });
  });

  it("caches results and does not re-fetch on a second call for the same trip", async () => {
    fetchOverpassPlaces.mockResolvedValue([rawPlace()]);

    const first = await getPlacesForTrip(trip());
    const second = await getPlacesForTrip(trip());

    expect(fetchOverpassPlaces).toHaveBeenCalledTimes(1);
    expect(second).toEqual(first);
  });

  it("bypasses the cache when forceRefresh is set", async () => {
    fetchOverpassPlaces.mockResolvedValue([rawPlace()]);
    await getPlacesForTrip(trip());

    fetchOverpassPlaces.mockResolvedValue([rawPlace({ id: "fresh" })]);
    const refreshed = await getPlacesForTrip(trip(), { forceRefresh: true });

    expect(fetchOverpassPlaces).toHaveBeenCalledTimes(2);
    expect(refreshed[0]?.id).toBe("fresh");
  });
});
