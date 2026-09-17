import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchGeoapifyPlaces } from "../../src/services/places/geoapifyPlaces.provider";

afterEach(() => {
  vi.unstubAllGlobals();
});

const CENTER = { lat: 15.3, lng: 74.1 };

describe("fetchGeoapifyPlaces", () => {
  it("maps Geoapify features to typed Places, skipping unnamed ones", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          features: [
            {
              properties: {
                place_id: "abc",
                name: "Fort Aguada",
                formatted: "Fort Aguada, Goa, India",
                categories: ["tourism", "tourism.sights"],
                lat: 15.49,
                lon: 73.77,
              },
            },
            {
              properties: {
                place_id: "no-name",
                categories: ["tourism"],
                lat: 1,
                lon: 2,
              },
            },
            {
              properties: {
                place_id: "def",
                name: "State Museum",
                categories: ["entertainment.museum"],
                lat: 15.5,
                lon: 73.8,
              },
            },
          ],
        }),
      })
    );

    const places = await fetchGeoapifyPlaces(CENTER, "test-key");

    expect(places).toHaveLength(2);
    expect(places[0]).toMatchObject({ id: "geoapify-abc", name: "Fort Aguada", category: "sights", estimatedCost: 0 });
    expect(places[1]).toMatchObject({ id: "geoapify-def", name: "State Museum", category: "museum" });
    expect(places[1]?.estimatedCost).toBeGreaterThan(0);
  });

  it("throws after exhausting retries on a persistent server error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500 }));

    await expect(fetchGeoapifyPlaces(CENTER, "test-key")).rejects.toThrow();
  });
});
