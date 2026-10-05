import { describe, expect, it } from "vitest";
import {
  countryNameFor,
  getDatasetMetadata,
  isSupportedCountry,
  listPassportOptions,
  lookupVisa,
  parseCountryNames,
  parseVisaCsv,
} from "../../src/services/travelEssentials/visaDataset";
import { VISA_STATUSES } from "../../src/types/travelEssentials";

describe("parseVisaCsv", () => {
  const csv = [
    "passport,destination,type,days,confidence",
    "AD,AE,visa-free,30,high",
    "AD,AF,e-visa,,disputed",
    "AD,AG,visa-on-arrival,90,medium",
    "AD,AL,teleport,10,high",
    "AD,AM,visa-free,10,certain",
    "",
    "broken-line",
  ].join("\r\n");

  it("parses valid rows, turning blank days into null", () => {
    const entries = parseVisaCsv(csv);

    expect(entries.get("AD>AE")).toEqual({ status: "visa-free", days: 30, confidence: "high" });
    expect(entries.get("AD>AF")).toEqual({ status: "e-visa", days: null, confidence: "disputed" });
    expect(entries.get("AD>AG")).toEqual({ status: "visa-on-arrival", days: 90, confidence: "medium" });
  });

  it("skips rows with an unrecognised status or confidence instead of guessing", () => {
    const entries = parseVisaCsv(csv);

    expect(entries.has("AD>AL")).toBe(false);
    expect(entries.has("AD>AM")).toBe(false);
    expect(entries.size).toBe(3);
  });

  it("tolerates blank lines and malformed rows", () => {
    expect(() => parseVisaCsv(csv)).not.toThrow();
  });
});

describe("parseCountryNames", () => {
  it("keeps the first name listed for each code, upper-casing the code", () => {
    const names = parseCountryNames(JSON.stringify({ Turkey: "TR", "Türkiye": "TR", Japan: "jp" }));

    expect(names.get("TR")).toBe("Turkey");
    expect(names.get("JP")).toBe("Japan");
  });
});

describe("vendored dataset", () => {
  it("covers 199 countries as both passports and destinations", () => {
    expect(listPassportOptions()).toHaveLength(199);
  });

  it("lists passport options sorted by name", () => {
    const names = listPassportOptions().map((o) => o.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });

  it("returns known corridors", () => {
    expect(lookupVisa("IN", "FR")).toMatchObject({ status: "visa-required" });
    expect(lookupVisa("US", "JP")).toEqual({ status: "visa-free", days: 90, confidence: "high" });
    expect(lookupVisa("FR", "DE")).toMatchObject({ status: "freedom-of-movement" });
  });

  it("is case-insensitive on country codes", () => {
    expect(lookupVisa("us", "jp")).toEqual(lookupVisa("US", "JP"));
  });

  it("surfaces the dataset's own 'disputed' confidence", () => {
    expect(lookupVisa("IN", "TH")?.confidence).toBe("disputed");
  });

  it("returns null for a pair the dataset doesn't cover", () => {
    expect(lookupVisa("ZZ", "FR")).toBeNull();
    expect(lookupVisa("IN", "ZZ")).toBeNull();
  });

  it("only ever contains statuses the app knows how to describe", () => {
    const seen = new Set<string>();
    for (const { code: passport } of listPassportOptions()) {
      for (const { code: destination } of listPassportOptions()) {
        const entry = lookupVisa(passport, destination);
        if (entry) {
          seen.add(entry.status);
        }
      }
    }
    for (const status of seen) {
      expect(VISA_STATUSES).toContain(status);
    }
    expect(seen.size).toBeGreaterThanOrEqual(5);
  });

  it("resolves names and support checks", () => {
    expect(countryNameFor("TR")).toBe("Turkey");
    expect(countryNameFor(null)).toBeNull();
    expect(countryNameFor("XX")).toBeNull();
    expect(isSupportedCountry("in")).toBe(true);
    expect(isSupportedCountry("ZZ")).toBe(false);
  });

  it("records provenance for attribution", () => {
    expect(getDatasetMetadata()).toMatchObject({
      license: "CC-BY-SA-4.0",
      source: "https://github.com/xpressmike/visa-matrix",
    });
    expect(getDatasetMetadata().commit).toMatch(/^[0-9a-f]{40}$/);
  });
});
