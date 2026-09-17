import { afterEach, describe, expect, it, vi } from "vitest";
import { geocodeDestination } from "../../src/services/places/geocode.provider";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("geocodeDestination", () => {
  it("returns coordinates for a resolvable destination", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ lat: "15.2993", lon: "74.1240" }],
    });
    vi.stubGlobal("fetch", fetchMock);

    const point = await geocodeDestination("Goa");

    expect(point).toEqual({ lat: 15.2993, lng: 74.124 });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("q=Goa"),
      expect.objectContaining({ headers: expect.objectContaining({ "User-Agent": expect.any(String) }) })
    );
  });

  it("throws a 400 ApiError when nothing matches", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => [] })
    );

    await expect(geocodeDestination("Nowhereville")).rejects.toMatchObject({ statusCode: 400 });
  });

  it("retries on a 503 and eventually succeeds", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 503 })
      .mockResolvedValueOnce({ ok: true, json: async () => [{ lat: "1", lon: "2" }] });
    vi.stubGlobal("fetch", fetchMock);

    const point = await geocodeDestination("Somewhere");

    expect(point).toEqual({ lat: 1, lng: 2 });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
