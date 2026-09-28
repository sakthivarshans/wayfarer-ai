import type { Firestore } from "firebase-admin/firestore";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createFakeFirestore } from "../helpers/fakeFirestore";
import type { Trip } from "../../src/types/trip";

let fakeDb: Firestore;

const lookupCountryCode = vi.fn();

vi.mock("../../src/config/firebaseAdmin", () => ({
  getFirestoreDb: () => fakeDb,
}));

vi.mock("../../src/config/logger", () => ({
  logger: { warn: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn() },
}));

vi.mock("../../src/services/gettingAround/countryLookup.provider", () => ({ lookupCountryCode }));

const { getGettingAroundForTrip } = await import("../../src/services/gettingAround.service");

function trip(overrides: Partial<Trip> = {}): Trip {
  return {
    id: "trip-1",
    userId: "user-1",
    origin: "Chennai",
    destination: "Paris",
    budget: 100000,
    days: 5,
    transportModePreference: "flight",
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("gettingAround.service", () => {
  beforeEach(() => {
    fakeDb = createFakeFirestore();
    lookupCountryCode.mockReset().mockResolvedValue("FR");
  });

  it("returns cab and transit options scoped to the destination", async () => {
    const summary = await getGettingAroundForTrip(trip());

    expect(summary.destination).toBe("Paris");
    expect(summary.countryCode).toBe("FR");
    expect(summary.cabs.map((c) => c.provider)).toEqual(["Uber", "Bolt", "Google Maps"]);
    expect(summary.transit).toHaveLength(2);
  });

  it("regression: looks up the DESTINATION's country and never touches the origin", async () => {
    // Chennai -> Paris: showing India's Ola for a Paris trip would be the bug.
    const summary = await getGettingAroundForTrip(trip({ origin: "Chennai", destination: "Paris" }));

    expect(lookupCountryCode).toHaveBeenCalledTimes(1);
    expect(lookupCountryCode).toHaveBeenCalledWith("Paris");
    expect(lookupCountryCode).not.toHaveBeenCalledWith("Chennai");

    expect(summary.cabs.map((c) => c.provider)).not.toContain("Ola");
    expect(JSON.stringify(summary).toLowerCase()).not.toContain("chennai");
  });

  it("regression: swapping origin and destination swaps the results", async () => {
    lookupCountryCode.mockResolvedValue("IN");
    const summary = await getGettingAroundForTrip(trip({ origin: "Paris", destination: "Chennai" }));

    expect(lookupCountryCode).toHaveBeenCalledWith("Chennai");
    expect(summary.cabs.map((c) => c.provider)).toContain("Ola");
    expect(JSON.stringify(summary).toLowerCase()).not.toContain("paris");
  });

  it("still returns generic links when the country lookup fails, without caching them", async () => {
    lookupCountryCode.mockRejectedValue(new Error("nominatim down"));

    const first = await getGettingAroundForTrip(trip());
    expect(first.countryCode).toBeNull();
    expect(first.cabs.map((c) => c.provider)).toEqual(["Google Maps"]);

    // A later request retries the lookup instead of serving the degraded result.
    lookupCountryCode.mockResolvedValue("FR");
    const second = await getGettingAroundForTrip(trip());
    expect(lookupCountryCode).toHaveBeenCalledTimes(2);
    expect(second.countryCode).toBe("FR");
  });

  it("caches successful results and skips the lookup on the next call", async () => {
    const first = await getGettingAroundForTrip(trip());
    const second = await getGettingAroundForTrip(trip());

    expect(lookupCountryCode).toHaveBeenCalledTimes(1);
    expect(second).toEqual(first);
  });

  it("ignores a cached entry scoped to a different destination", async () => {
    await getGettingAroundForTrip(trip({ destination: "Paris" }));

    lookupCountryCode.mockResolvedValue("JP");
    const summary = await getGettingAroundForTrip(trip({ destination: "Kyoto" }));

    expect(lookupCountryCode).toHaveBeenCalledTimes(2);
    expect(summary.destination).toBe("Kyoto");
    expect(summary.countryCode).toBe("JP");
  });

  it("bypasses the cache when forceRefresh is set", async () => {
    await getGettingAroundForTrip(trip());
    await getGettingAroundForTrip(trip(), { forceRefresh: true });

    expect(lookupCountryCode).toHaveBeenCalledTimes(2);
  });
});
