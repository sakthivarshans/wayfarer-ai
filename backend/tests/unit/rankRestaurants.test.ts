import { describe, expect, it } from "vitest";
import { rankAndTrimRestaurants } from "../../src/services/restaurants/rankRestaurants";
import type { Restaurant } from "../../src/types/restaurant";

function restaurant(overrides: Partial<Restaurant>): Restaurant {
  return {
    id: "id",
    name: "Restaurant",
    description: null,
    category: "other",
    estimatedCost: null,
    lat: 0,
    lng: 0,
    ...overrides,
  };
}

describe("rankAndTrimRestaurants", () => {
  it("trims to roughly 2 restaurants per day, capped at 12", () => {
    const restaurants = Array.from({ length: 30 }, (_, i) => restaurant({ id: `r${i}`, estimatedCost: 0 }));

    expect(rankAndTrimRestaurants(restaurants, 50000, 4)).toHaveLength(8);
    expect(rankAndTrimRestaurants(restaurants, 200000, 10)).toHaveLength(12);
  });

  it("never returns fewer than the per-day target even for a 1-day trip", () => {
    const restaurants = Array.from({ length: 5 }, (_, i) => restaurant({ id: `r${i}` }));
    expect(rankAndTrimRestaurants(restaurants, 5000, 1)).toHaveLength(2);
  });

  it("prioritizes cheaper restaurants first when the per-day budget is tight", () => {
    const restaurants = [
      restaurant({ id: "expensive", estimatedCost: 800 }),
      restaurant({ id: "free", estimatedCost: 0 }),
      restaurant({ id: "unknown", estimatedCost: null }),
      restaurant({ id: "mid", estimatedCost: 300 }),
    ];

    // budget 3000 / 4 days = 750/day -> tight
    const ranked = rankAndTrimRestaurants(restaurants, 3000, 4);
    const order = ranked.map((r) => r.id);

    expect(order.indexOf("free")).toBeLessThan(order.indexOf("mid"));
    expect(order.indexOf("mid")).toBeLessThan(order.indexOf("expensive"));
  });

  it("treats an unknown (null) cost as free rather than expensive", () => {
    const restaurants = [
      restaurant({ id: "expensive", estimatedCost: 800 }),
      restaurant({ id: "unknown", estimatedCost: null }),
    ];

    const ranked = rankAndTrimRestaurants(restaurants, 1000, 4);
    expect(ranked[0]?.id).toBe("unknown");
  });

  it("does not mutate the input array", () => {
    const restaurants = [
      restaurant({ id: "a", estimatedCost: 500 }),
      restaurant({ id: "b", estimatedCost: 100 }),
    ];
    const copy = [...restaurants];

    rankAndTrimRestaurants(restaurants, 10000, 2);

    expect(restaurants).toEqual(copy);
  });
});
