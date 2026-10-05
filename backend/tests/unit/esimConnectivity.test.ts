import { describe, expect, it } from "vitest";
import {
  buildEsimOptions,
  buildTemplateConnectivitySummary,
} from "../../src/services/travelEssentials/connectivity";
import { listPassportOptions } from "../../src/services/travelEssentials/visaDataset";

function airalo(code: string | null, name: string | null) {
  return buildEsimOptions(code, name).find((o) => o.provider === "Airalo");
}
function holafly(code: string | null, name: string | null) {
  return buildEsimOptions(code, name).find((o) => o.provider === "Holafly");
}

describe("buildEsimOptions", () => {
  it("builds the verified country page patterns for Japan", () => {
    expect(airalo("JP", "Japan")).toMatchObject({
      deepLink: "https://www.airalo.com/japan-esim",
      countrySpecific: true,
    });
    expect(holafly("JP", "Japan")).toMatchObject({
      deepLink: "https://esim.holafly.com/esim-japan/",
      countrySpecific: true,
    });
  });

  it("slugs multi-word names for Airalo (verified: united-states)", () => {
    expect(airalo("US", "United States")?.deepLink).toBe("https://www.airalo.com/united-states-esim");
    expect(airalo("GB", "United Kingdom")?.deepLink).toBe("https://www.airalo.com/united-kingdom-esim");
  });

  it("uses Airalo's own name where the dataset's differs", () => {
    expect(airalo("CZ", "Czech Republic")?.deepLink).toBe("https://www.airalo.com/czechia-esim");
    expect(airalo("CI", "Côte d'Ivoire")?.deepLink).toBe("https://www.airalo.com/ivory-coast-esim");
  });

  it("falls back to the store page instead of guessing for names it can't map confidently", () => {
    const option = airalo("TT", "Trinidad and Tobago");

    expect(option?.deepLink).toBe("https://www.airalo.com/esim");
    expect(option?.countrySpecific).toBe(false);
  });

  it("only links Holafly country pages for single-word names, else the home page", () => {
    expect(holafly("US", "United States")).toMatchObject({
      deepLink: "https://esim.holafly.com/",
      countrySpecific: false,
    });
  });

  it("falls back to both store pages when the country is unknown", () => {
    const options = buildEsimOptions(null, null);

    expect(options.map((o) => o.deepLink)).toEqual(["https://www.airalo.com/esim", "https://esim.holafly.com/"]);
    expect(options.every((o) => !o.countrySpecific)).toBe(true);
  });

  it("produces a well-formed https URL for every country the dataset covers", () => {
    for (const { code, name } of listPassportOptions()) {
      for (const option of buildEsimOptions(code, name)) {
        const url = new URL(option.deepLink);

        expect(url.protocol).toBe("https:");
        expect(option.deepLink).not.toMatch(/\s/);
        expect(url.pathname).toBe(url.pathname.toLowerCase());
      }
    }
  });
});

describe("buildTemplateConnectivitySummary", () => {
  it("names the destination and stays general (no prices)", () => {
    const text = buildTemplateConnectivitySummary("Japan");

    expect(text).toContain("Japan");
    expect(text).not.toMatch(/[$€£]|\d+\s?(usd|eur)/i);
  });
});
