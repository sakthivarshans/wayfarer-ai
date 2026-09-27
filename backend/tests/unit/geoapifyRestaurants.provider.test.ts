import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchGeoapifyRestaurants } from "../../src/services/restaurants/geoapifyRestaurants.provider";

afterEach(() => {
  vi.unstubAllGlobals();
});

const CENTER = { lat: 15.3, lng: 74.1 };

describe("fetchGeoapifyRestaurants", () => {
  it("maps Geoapify features to typed Restaurants, skipping unnamed ones", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          features: [
            {
              properties: {
                place_id: "abc",
                name: "Britto's",
                formatted: "Britto's, Goa, India",
                categories: ["catering", "catering.restaurant"],
                lat: 15.49,
                lon: 73.77,
              },
            },
            {
              properties: {
                place_id: "no-name",
                categories: ["catering.cafe"],
                lat: 1,
                lon: 2,
              },
            },
            {
              properties: {
                place_id: "def",
                name: "Cafe Bodega",
                categories: ["catering.cafe"],
                lat: 15.5,
                lon: 73.8,
              },
            },
          ],
        }),
      })
    );

    const restaurants = await fetchGeoapifyRestaurants(CENTER, "test-key");

    expect(restaurants).toHaveLength(2);
    expect(restaurants[0]).toMatchObject({
      id: "geoapify-abc",
      name: "Britto's",
      category: "restaurant",
    });
    expect(restaurants[1]).toMatchObject({ id: "geoapify-def", name: "Cafe Bodega", category: "cafe" });
    expect(restaurants[1]?.estimatedCost).toBeGreaterThan(0);
  });

  it("throws after exhausting retries on a persistent server error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500 }));

    await expect(fetchGeoapifyRestaurants(CENTER, "test-key")).rejects.toThrow();
  });
});
