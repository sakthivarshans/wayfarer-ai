import { describe, expect, it } from "vitest";
import { rankAndTrimPlaces } from "../../src/services/places/rankPlaces";
import type { Place } from "../../src/types/place";

function place(overrides: Partial<Place>): Place {
  return {
    id: "id",
    name: "Place",
    description: null,
    category: "other",
    estimatedCost: null,
    lat: 0,
    lng: 0,
    ...overrides,
  };
}

describe("rankAndTrimPlaces", () => {
  it("trims to roughly 3 places per day, capped at 15", () => {
    const places = Array.from({ length: 30 }, (_, i) => place({ id: `p${i}`, estimatedCost: 0 }));

    expect(rankAndTrimPlaces(places, 50000, 4)).toHaveLength(12);
    expect(rankAndTrimPlaces(places, 200000, 10)).toHaveLength(15);
  });

  it("never returns fewer than the per-day target even for a 1-day trip", () => {
    const places = Array.from({ length: 5 }, (_, i) => place({ id: `p${i}` }));
    expect(rankAndTrimPlaces(places, 5000, 1)).toHaveLength(3);
  });

  it("prioritizes cheaper places first when the per-day budget is tight", () => {
    const places = [
      place({ id: "expensive", estimatedCost: 800 }),
      place({ id: "free", estimatedCost: 0 }),
      place({ id: "unknown", estimatedCost: null }),
      place({ id: "mid", estimatedCost: 300 }),
    ];

    // budget 3000 / 4 days = 750/day -> tight
    const ranked = rankAndTrimPlaces(places, 3000, 4);
    const order = ranked.map((p) => p.id);

    expect(order.indexOf("free")).toBeLessThan(order.indexOf("mid"));
    expect(order.indexOf("mid")).toBeLessThan(order.indexOf("expensive"));
  });

  it("treats an unknown (null) cost as free rather than expensive", () => {
    const places = [place({ id: "expensive", estimatedCost: 800 }), place({ id: "unknown", estimatedCost: null })];

    const ranked = rankAndTrimPlaces(places, 1000, 4);
    expect(ranked[0]?.id).toBe("unknown");
  });

  it("does not mutate the input array", () => {
    const places = [place({ id: "a", estimatedCost: 500 }), place({ id: "b", estimatedCost: 100 })];
    const copy = [...places];

    rankAndTrimPlaces(places, 10000, 2);

    expect(places).toEqual(copy);
  });
});
