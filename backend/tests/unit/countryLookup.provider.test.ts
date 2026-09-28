import { afterEach, describe, expect, it, vi } from "vitest";
import { lookupCountryCode } from "../../src/services/gettingAround/countryLookup.provider";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("lookupCountryCode", () => {
  it("returns the uppercase country code from Nominatim's address details", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ address: { country_code: "fr" } }],
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(lookupCountryCode("Paris")).resolves.toBe("FR");
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain("addressdetails=1");
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain("q=Paris");
  });

  it("returns null when the lookup succeeds but has no country", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => [] }));

    await expect(lookupCountryCode("Nowhereville")).resolves.toBeNull();
  });

  it("throws after exhausting retries on a persistent server error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500 }));

    await expect(lookupCountryCode("Paris")).rejects.toThrow();
  });
});
