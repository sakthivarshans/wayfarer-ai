import { describe, expect, it } from "vitest";
import {
  DISCLAIMER,
  buildHeadline,
  buildOfficialLinks,
  buildTemplateSummary,
} from "../../src/services/travelEssentials/visaSummary";
import { VISA_STATUSES } from "../../src/types/travelEssentials";

describe("buildHeadline", () => {
  it("includes the permitted stay when known", () => {
    expect(buildHeadline("visa-free", 90)).toBe("Visa-free for up to 90 days");
    expect(buildHeadline("visa-on-arrival", 60)).toBe("Visa on arrival for up to 60 days");
  });

  it("omits the stay when unknown", () => {
    expect(buildHeadline("visa-free", null)).toBe("Visa-free");
  });

  it("has a distinct, non-empty headline for every status", () => {
    const statuses = [...VISA_STATUSES, "same-country", "unknown"] as const;
    const headlines = statuses.map((s) => buildHeadline(s, null));

    expect(headlines.every((h) => h.length > 0)).toBe(true);
    expect(new Set(headlines).size).toBe(statuses.length);
  });
});

describe("buildTemplateSummary", () => {
  const entry = { status: "visa-required", days: null, confidence: "high" } as const;

  it("names the passport country and destination", () => {
    const text = buildTemplateSummary({
      passportName: "India",
      destinationName: "France",
      status: "visa-required",
      entry,
    });

    expect(text).toContain("India passport holders");
    expect(text).toContain("France");
  });

  it("flags disputed routes as uncertain", () => {
    const text = buildTemplateSummary({
      passportName: "India",
      destinationName: "Thailand",
      status: "visa-on-arrival",
      entry: { status: "visa-on-arrival", days: 60, confidence: "disputed" },
    });

    expect(text).toContain("sources disagree");
    expect(text).toContain("60 days");
  });

  it("doesn't mention the disagreement warning for high-confidence routes", () => {
    const text = buildTemplateSummary({
      passportName: "India",
      destinationName: "France",
      status: "visa-required",
      entry,
    });
    expect(text).not.toContain("disagree");
  });

  it("never invents details the dataset doesn't contain (fees, processing times, documents)", () => {
    for (const status of [...VISA_STATUSES, "same-country", "unknown"] as const) {
      const text = buildTemplateSummary({
        passportName: "India",
        destinationName: "France",
        status,
        entry: null,
      }).toLowerCase();

      for (const forbidden of ["fee", "$", "processing", "business days", "document"]) {
        expect(text).not.toContain(forbidden);
      }
    }
  });

  it("handles unknown passport countries gracefully", () => {
    const text = buildTemplateSummary({
      passportName: null,
      destinationName: "France",
      status: "unknown",
      entry: null,
    });
    expect(text).toContain("Pick your passport country");
  });
});

describe("buildOfficialLinks", () => {
  it("always includes the IATA Travel Centre", () => {
    const links = buildOfficialLinks("France", "India");
    expect(links[0]?.url).toBe("https://www.iatatravelcentre.com/");
  });

  it("builds a search scoped to the destination and passport country", () => {
    const search = buildOfficialLinks("France", "India")[1];
    const url = new URL(search?.url ?? "");

    expect(url.searchParams.get("q")).toContain("France");
    expect(url.searchParams.get("q")).toContain("India");
  });

  it("still works without a passport country", () => {
    const search = buildOfficialLinks("France", null)[1];
    expect(new URL(search?.url ?? "").searchParams.get("q")).toContain("France");
  });
});

describe("DISCLAIMER", () => {
  it("frames the content as general guidance and points to official sources", () => {
    expect(DISCLAIMER.toLowerCase()).toContain("general guidance");
    expect(DISCLAIMER.toLowerCase()).toContain("official");
  });
});
