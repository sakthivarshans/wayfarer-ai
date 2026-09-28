import { describe, expect, it } from "vitest";
import { buildCabOptions, buildTransitOptions } from "../../src/services/gettingAround/deepLinks";
import { providersForCountry } from "../../src/services/gettingAround/rideProviders";

// Decodes the URL first so "+" / "%20" spellings of a multi-word place name
// can't hide a mention (or a leak) from the assertion.
function mentions(link: string, place: string): boolean {
  let decoded = link.replace(/\+/g, " ");
  try {
    decoded = decodeURIComponent(decoded);
  } catch {
    // Malformed escapes: fall back to the raw string.
  }
  return decoded.toLowerCase().includes(place.toLowerCase());
}

describe("providersForCountry", () => {
  it("returns Ola and Uber for India, but not Bolt or Grab", () => {
    const names = providersForCountry("IN").map((p) => p.name);
    expect(names).toContain("Ola");
    expect(names).toContain("Uber");
    expect(names).not.toContain("Bolt");
    expect(names).not.toContain("Grab");
  });

  it("returns Grab for Singapore and Bolt for Estonia", () => {
    expect(providersForCountry("SG").map((p) => p.name)).toContain("Grab");
    expect(providersForCountry("EE").map((p) => p.name)).toContain("Bolt");
  });

  it("is case-insensitive on the country code", () => {
    expect(providersForCountry("fr").map((p) => p.name)).toContain("Uber");
  });

  it("returns nothing for an unknown or missing country", () => {
    expect(providersForCountry(null)).toEqual([]);
    expect(providersForCountry("ZZ")).toEqual([]);
  });
});

describe("buildCabOptions", () => {
  it("always includes a Google Maps taxi fallback, even with no known country", () => {
    const options = buildCabOptions("Paris", null);

    expect(options).toHaveLength(1);
    expect(options[0]).toMatchObject({ kind: "cab", provider: "Google Maps" });
    expect(mentions(options[0]?.deepLink ?? "", "Paris")).toBe(true);
  });

  it("lists country ride apps first and keeps the fallback last", () => {
    const options = buildCabOptions("Mumbai", "IN");
    const providers = options.map((o) => o.provider);

    expect(providers).toEqual(["Uber", "Ola", "Google Maps"]);
  });

  it("builds an Uber link that dropoffs at the destination", () => {
    const uber = buildCabOptions("São Paulo", "BR").find((o) => o.provider === "Uber");

    expect(uber?.deepLink.startsWith("https://m.uber.com/ul/")).toBe(true);
    expect(new URL(uber?.deepLink ?? "").searchParams.get("dropoff[formatted_address]")).toBe("São Paulo");
  });
});

describe("buildTransitOptions", () => {
  it("scopes transit directions to the destination in transit mode with no fixed origin", () => {
    const [directions] = buildTransitOptions("Kyoto");
    const url = new URL(directions?.deepLink ?? "");

    expect(url.searchParams.get("destination")).toBe("Kyoto");
    expect(url.searchParams.get("travelmode")).toBe("transit");
    expect(url.searchParams.has("origin")).toBe(false);
  });
});

describe("regression: local transport is scoped to the destination, never the origin", () => {
  // Trip is Chennai -> Paris. Cabs/buses shown after arrival must be Paris's.
  const ORIGIN = "Chennai";
  const DESTINATION = "Paris";

  // Only the destination is ever passed in (by design), so these tests
  // simulate the call site: any future change that threaded the origin
  // into these builders would have to show up in the links below.
  it.each([
    ["FR", "France"],
    ["IN", "India — the origin's country, which must NOT leak in"],
    [null, "unknown country"],
  ])("never references the origin in cab links (country %s: %s)", (countryCode) => {
    const links = buildCabOptions(DESTINATION, countryCode).map((o) => o.deepLink);

    for (const link of links) {
      expect(mentions(link, ORIGIN)).toBe(false);
    }
  });

  it("never references the origin in transit links, and every transit link is about the destination", () => {
    const links = buildTransitOptions(DESTINATION).map((o) => o.deepLink);

    for (const link of links) {
      expect(mentions(link, ORIGIN)).toBe(false);
      expect(mentions(link, DESTINATION)).toBe(true);
    }
  });

  it("labels also name only the destination", () => {
    const labels = [...buildCabOptions(DESTINATION, "FR"), ...buildTransitOptions(DESTINATION)].map((o) => o.label);

    for (const label of labels) {
      expect(label.toLowerCase()).not.toContain(ORIGIN.toLowerCase());
    }
  });
});
