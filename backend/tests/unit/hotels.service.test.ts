import { describe, expect, it } from "vitest";
import { getHotelsForTrip } from "../../src/services/hotels.service";
import type { Trip } from "../../src/types/trip";

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

describe("getHotelsForTrip", () => {
  it("computes a per-night budget hint from budget and days", () => {
    const summary = getHotelsForTrip(trip({ budget: 20000, days: 4 }));
    expect(summary.perNightBudgetHint).toBe(5000);
  });

  it("returns hotel deep links for the trip's destination", () => {
    const summary = getHotelsForTrip(trip({ destination: "Goa" }));
    expect(summary.options).toHaveLength(3);
    expect(summary.options.every((o) => o.deepLink.includes("Goa"))).toBe(true);
  });
});
