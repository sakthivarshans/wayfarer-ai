import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchOverpassPlaces } from "../../src/services/places/overpassPlaces.provider";

afterEach(() => {
  vi.unstubAllGlobals();
});

const CENTER = { lat: 15.3, lng: 74.1 };

describe("fetchOverpassPlaces", () => {
  it("maps Overpass elements to typed Places, using center for ways and skipping unnamed nodes", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          elements: [
            { type: "node", id: 1, lat: 15.4, lon: 73.9, tags: { name: "Beach", natural: "beach" } },
            { type: "way", id: 2, center: { lat: 15.5, lon: 74.0 }, tags: { name: "City Park", leisure: "park" } },
            { type: "node", id: 3, lat: 15.6, lon: 74.2, tags: { tourism: "attraction" } },
          ],
        }),
      })
    );

    const places = await fetchOverpassPlaces(CENTER);

    expect(places).toHaveLength(2);
    expect(places[0]).toMatchObject({ id: "osm-node-1", name: "Beach", category: "nature", lat: 15.4, lng: 73.9 });
    expect(places[1]).toMatchObject({ id: "osm-way-2", name: "City Park", category: "nature", lat: 15.5, lng: 74.0 });
  });

  it("throws after exhausting retries on a persistent failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

    await expect(fetchOverpassPlaces(CENTER)).rejects.toThrow("network down");
  });
});
