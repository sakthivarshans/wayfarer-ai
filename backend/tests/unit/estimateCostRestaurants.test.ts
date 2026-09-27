import { describe, expect, it } from "vitest";
import { estimateCostForCategory } from "../../src/services/restaurants/estimateCost";

describe("estimateCostForCategory (restaurants)", () => {
  it("returns a positive estimate for categories with a known price basis", () => {
    expect(estimateCostForCategory("bakery")).toBeGreaterThan(0);
    expect(estimateCostForCategory("fastFood")).toBeGreaterThan(0);
    expect(estimateCostForCategory("cafe")).toBeGreaterThan(0);
    expect(estimateCostForCategory("restaurant")).toBeGreaterThan(0);
    expect(estimateCostForCategory("bar")).toBeGreaterThan(0);
  });

  it("returns null for 'other', signaling no basis to estimate", () => {
    expect(estimateCostForCategory("other")).toBeNull();
  });

  it("estimates a sit-down restaurant as more expensive than a bakery", () => {
    const restaurantCost = estimateCostForCategory("restaurant");
    const bakeryCost = estimateCostForCategory("bakery");
    expect(restaurantCost).not.toBeNull();
    expect(bakeryCost).not.toBeNull();
    expect(restaurantCost as number).toBeGreaterThan(bakeryCost as number);
  });
});
