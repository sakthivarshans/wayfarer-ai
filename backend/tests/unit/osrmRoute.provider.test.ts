import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchRoadRoute } from "../../src/services/transport/osrmRoute.provider";

afterEach(() => {
  vi.unstubAllGlobals();
});

const ORIGIN = { lat: 19.076, lng: 72.8777 };
const DESTINATION = { lat: 15.2993, lng: 74.124 };

describe("fetchRoadRoute", () => {
  it("converts OSRM's meters/seconds into km/minutes", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ code: "Ok", routes: [{ distance: 582340, duration: 33120 }] }),
      })
    );

    const route = await fetchRoadRoute(ORIGIN, DESTINATION);

    expect(route).toEqual({ distanceKm: 582.3, durationMinutes: 552 });
  });

  it("throws when OSRM returns a non-Ok code with no route", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ code: "NoRoute", routes: [] }) })
    );

    await expect(fetchRoadRoute(ORIGIN, DESTINATION)).rejects.toThrow("NoRoute");
  });

  it("retries on a 503 and eventually succeeds", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 503 })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ code: "Ok", routes: [{ distance: 1000, duration: 60 }] }) });
    vi.stubGlobal("fetch", fetchMock);

    const route = await fetchRoadRoute(ORIGIN, DESTINATION);

    expect(route).toEqual({ distanceKm: 1, durationMinutes: 1 });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
