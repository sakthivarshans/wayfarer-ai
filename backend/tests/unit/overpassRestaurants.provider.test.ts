import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchOverpassRestaurants } from "../../src/services/restaurants/overpassRestaurants.provider";

afterEach(() => {
  vi.unstubAllGlobals();
});

const CENTER = { lat: 15.3, lng: 74.1 };

describe("fetchOverpassRestaurants", () => {
  it("maps Overpass elements to typed Restaurants, using center for ways and skipping unnamed nodes", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          elements: [
            { type: "node", id: 1, lat: 15.4, lon: 73.9, tags: { name: "Ritz Classic", amenity: "restaurant" } },
            { type: "way", id: 2, center: { lat: 15.5, lon: 74.0 }, tags: { name: "Cafe Prime", amenity: "cafe" } },
            { type: "node", id: 3, lat: 15.6, lon: 74.2, tags: { amenity: "restaurant" } },
          ],
        }),
      })
    );

    const restaurants = await fetchOverpassRestaurants(CENTER);

    expect(restaurants).toHaveLength(2);
    expect(restaurants[0]).toMatchObject({
      id: "osm-node-1",
      name: "Ritz Classic",
      category: "restaurant",
      lat: 15.4,
      lng: 73.9,
    });
    expect(restaurants[1]).toMatchObject({
      id: "osm-way-2",
      name: "Cafe Prime",
      category: "cafe",
      lat: 15.5,
      lng: 74.0,
    });
  });

  it("throws after exhausting retries on a persistent failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

    await expect(fetchOverpassRestaurants(CENTER)).rejects.toThrow("network down");
  });
});
