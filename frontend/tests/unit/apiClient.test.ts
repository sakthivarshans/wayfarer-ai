import { afterEach, describe, expect, it, vi } from "vitest";
import { apiFetch } from "@/lib/apiClient";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("apiFetch", () => {
  it("returns the parsed JSON body on success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ trip: { id: "trip-1" } }),
      })
    );

    const result = await apiFetch<{ trip: { id: string } }>("/trips/trip-1");
    expect(result).toEqual({ trip: { id: "trip-1" } });
  });

  it("attaches the Authorization header when a token is given", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({}) });
    vi.stubGlobal("fetch", fetchMock);

    await apiFetch("/trips", { token: "abc123" });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/trips"),
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: "Bearer abc123" }) })
    );
  });

  it("omits the Authorization header when no token is given", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({}) });
    vi.stubGlobal("fetch", fetchMock);

    await apiFetch("/health");

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect((init.headers as Record<string, string>).Authorization).toBeUndefined();
  });

  it("sends the JSON body and method for a POST", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({}) });
    vi.stubGlobal("fetch", fetchMock);

    await apiFetch("/trips", { method: "POST", body: { origin: "Mumbai" } });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/trips"),
      expect.objectContaining({ method: "POST", body: JSON.stringify({ origin: "Mumbai" }) })
    );
  });

  it("returns undefined for a 204 No Content response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, status: 204 }));
    const result = await apiFetch("/trips/trip-1");
    expect(result).toBeUndefined();
  });

  it("throws an ApiClientError built from the backend's { error } shape", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({ error: { code: "NOT_FOUND", message: "Trip not found" } }),
      })
    );

    await expect(apiFetch("/trips/missing")).rejects.toMatchObject({
      status: 404,
      code: "NOT_FOUND",
      message: "Trip not found",
    });
  });

  it("falls back to a generic message when the error body isn't JSON", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error("not json");
        },
      })
    );

    await expect(apiFetch("/trips")).rejects.toMatchObject({ status: 500, code: "UNKNOWN_ERROR" });
  });

  it("throws a NETWORK_ERROR when fetch itself rejects", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("Failed to fetch"))
    );

    await expect(apiFetch("/trips")).rejects.toMatchObject({ status: 0, code: "NETWORK_ERROR" });
  });
});
