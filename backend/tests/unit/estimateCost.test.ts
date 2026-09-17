import { describe, expect, it } from "vitest";
import { estimateCostForCategory } from "../../src/services/places/estimateCost";

describe("estimateCostForCategory", () => {
  it("treats sights, nature, and religion as free", () => {
    expect(estimateCostForCategory("sights")).toBe(0);
    expect(estimateCostForCategory("nature")).toBe(0);
    expect(estimateCostForCategory("religion")).toBe(0);
  });

  it("gives museums and entertainment a positive estimate", () => {
    expect(estimateCostForCategory("museum")).toBeGreaterThan(0);
    expect(estimateCostForCategory("entertainment")).toBeGreaterThan(0);
  });

  it("returns null for 'other', signaling no basis to estimate", () => {
    expect(estimateCostForCategory("other")).toBeNull();
  });
});
