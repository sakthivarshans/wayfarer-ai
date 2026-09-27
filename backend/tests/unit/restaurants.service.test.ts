import type { Firestore } from "firebase-admin/firestore";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createFakeFirestore } from "../helpers/fakeFirestore";
import type { Trip } from "../../src/types/trip";
import type { Restaurant } from "../../src/types/restaurant";

let fakeDb: Firestore;
let geoapifyKey: string | undefined;

const geocodeDestination = vi.fn();
const fetchGeoapifyRestaurants = vi.fn();
const fetchOverpassRestaurants = vi.fn();

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
vi.mock("../../src/services/restaurants/geoapifyRestaurants.provider", () => ({ fetchGeoapifyRestaurants }));
vi.mock("../../src/services/restaurants/overpassRestaurants.provider", () => ({ fetchOverpassRestaurants }));

const { getRestaurantsForTrip } = await import("../../src/services/restaurants.service");

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

function rawRestaurant(overrides: Partial<Restaurant> = {}): Restaurant {
  return {
    id: "r1",
    name: "Britto's",
    description: null,
    category: "restaurant",
    estimatedCost: 500,
    lat: 15.5,
    lng: 73.8,
    ...overrides,
  };
}

describe("restaurants.service", () => {
  beforeEach(() => {
    fakeDb = createFakeFirestore();
    geoapifyKey = undefined;
    geocodeDestination.mockReset().mockResolvedValue({ lat: 15.3, lng: 74.1 });
    fetchGeoapifyRestaurants.mockReset();
    fetchOverpassRestaurants.mockReset();
  });

  it("uses Overpass when GEOAPIFY_API_KEY is unset", async () => {
    fetchOverpassRestaurants.mockResolvedValue([rawRestaurant()]);

    const restaurants = await getRestaurantsForTrip(trip());

    expect(fetchGeoapifyRestaurants).not.toHaveBeenCalled();
    expect(fetchOverpassRestaurants).toHaveBeenCalledWith({ lat: 15.3, lng: 74.1 });
    expect(restaurants).toHaveLength(1);
  });

  it("prefers Geoapify when a key is configured and it succeeds", async () => {
    geoapifyKey = "test-key";
    fetchGeoapifyRestaurants.mockResolvedValue([rawRestaurant({ id: "geo-1" })]);

    const restaurants = await getRestaurantsForTrip(trip());

    expect(fetchOverpassRestaurants).not.toHaveBeenCalled();
    expect(restaurants[0]?.id).toBe("geo-1");
  });

  it("falls back to Overpass when Geoapify fails", async () => {
    geoapifyKey = "test-key";
    fetchGeoapifyRestaurants.mockRejectedValue(new Error("geoapify down"));
    fetchOverpassRestaurants.mockResolvedValue([rawRestaurant({ id: "osm-1" })]);

    const restaurants = await getRestaurantsForTrip(trip());

    expect(restaurants[0]?.id).toBe("osm-1");
  });

  it("throws a 502 ApiError when both providers fail", async () => {
    geoapifyKey = "test-key";
    fetchGeoapifyRestaurants.mockRejectedValue(new Error("geoapify down"));
    fetchOverpassRestaurants.mockRejectedValue(new Error("overpass down too"));

    await expect(getRestaurantsForTrip(trip())).rejects.toMatchObject({ statusCode: 502 });
  });

  it("caches results and does not re-fetch on a second call for the same trip", async () => {
    fetchOverpassRestaurants.mockResolvedValue([rawRestaurant()]);

    const first = await getRestaurantsForTrip(trip());
    const second = await getRestaurantsForTrip(trip());

    expect(fetchOverpassRestaurants).toHaveBeenCalledTimes(1);
    expect(second).toEqual(first);
  });

  it("bypasses the cache when forceRefresh is set", async () => {
    fetchOverpassRestaurants.mockResolvedValue([rawRestaurant()]);
    await getRestaurantsForTrip(trip());

    fetchOverpassRestaurants.mockResolvedValue([rawRestaurant({ id: "fresh" })]);
    const refreshed = await getRestaurantsForTrip(trip(), { forceRefresh: true });

    expect(fetchOverpassRestaurants).toHaveBeenCalledTimes(2);
    expect(refreshed[0]?.id).toBe("fresh");
  });
});
