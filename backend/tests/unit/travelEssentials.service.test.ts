import type { Firestore } from "firebase-admin/firestore";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createFakeFirestore } from "../helpers/fakeFirestore";
import type { Trip } from "../../src/types/trip";

let fakeDb: Firestore;

const lookupCountryCode = vi.fn();
const completeChat = vi.fn();

vi.mock("../../src/config/firebaseAdmin", () => ({ getFirestoreDb: () => fakeDb }));
vi.mock("../../src/config/logger", () => ({
  logger: { warn: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn() },
}));
vi.mock("../../src/services/gettingAround/countryLookup.provider", () => ({ lookupCountryCode }));
vi.mock("../../src/services/ai/groq.provider", () => ({ completeChat }));

const { getTravelEssentialsForTrip } = await import("../../src/services/travelEssentials.service");
const { getDatasetMetadata } = await import("../../src/services/travelEssentials/visaDataset");

const CACHE = "travelEssentialsSummaries";

function trip(overrides: Partial<Trip> = {}): Trip {
  return {
    id: "trip-1",
    userId: "user-1",
    origin: "Chennai",
    destination: "Paris",
    budget: 150000,
    days: 5,
    transportModePreference: "flight",
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

/** Country codes by place name, so each test can describe a trip in plain terms. */
function stubCountries(byPlace: Record<string, string | null | Error>): void {
  lookupCountryCode.mockImplementation(async (place: string) => {
    const result = byPlace[place];
    if (result instanceof Error) {
      throw result;
    }
    return result ?? null;
  });
}

describe("travelEssentials.service", () => {
  beforeEach(() => {
    fakeDb = createFakeFirestore();
    lookupCountryCode.mockReset();
    completeChat.mockReset().mockResolvedValue("AI-written summary. Please verify with official sources.");
    stubCountries({ Chennai: "IN", Paris: "FR", Bangkok: "TH", Delhi: "IN", Mumbai: "IN" });
  });

  describe("visa section", () => {
    it("guesses the passport from the origin's country and looks up the destination's requirement", async () => {
      const result = await getTravelEssentialsForTrip(trip());

      expect(result.passport).toMatchObject({ countryCode: "IN", countryName: "India", source: "origin" });
      expect(result.destination).toMatchObject({ name: "Paris", countryCode: "FR", countryName: "France" });
      expect(result.visa).toMatchObject({ status: "visa-required", confidence: "high", sourcesDisagree: false });
      expect(result.visa.headline).toBe("Visa required — apply before you travel");
      expect(result.visa.officialLinks[0]?.url).toBe("https://www.iatatravelcentre.com/");
    });

    it("uses the selected passport instead of the origin, and never looks the origin up", async () => {
      const result = await getTravelEssentialsForTrip(trip(), { passport: "US" });

      expect(result.passport).toMatchObject({ countryCode: "US", source: "selected" });
      expect(lookupCountryCode).toHaveBeenCalledTimes(1);
      expect(lookupCountryCode).toHaveBeenCalledWith("Paris");
      expect(lookupCountryCode).not.toHaveBeenCalledWith("Chennai");
    });

    it("gives a different answer for a different passport on the same trip", async () => {
      const indian = await getTravelEssentialsForTrip(trip(), { passport: "IN" });
      const american = await getTravelEssentialsForTrip(trip({ id: "trip-2" }), { passport: "US" });

      expect(indian.visa.status).toBe("visa-required");
      expect(american.visa.status).toBe("visa-free");
    });

    it("says no visa is needed when the trip stays within the passport's country", async () => {
      const result = await getTravelEssentialsForTrip(trip({ origin: "Mumbai", destination: "Delhi" }));

      expect(result.visa.status).toBe("same-country");
      expect(completeChat).not.toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ content: expect.stringContaining("Requirement:") })])
      );
    });

    it("flags routes where the dataset's own sources disagree", async () => {
      // India -> Thailand is marked 'disputed' in the dataset.
      const result = await getTravelEssentialsForTrip(trip({ destination: "Bangkok" }));

      expect(result.visa.confidence).toBe("disputed");
      expect(result.visa.sourcesDisagree).toBe(true);
    });

    it("returns 'unknown' — not an error — when the country lookups fail", async () => {
      stubCountries({ Chennai: new Error("nominatim down"), Paris: new Error("nominatim down") });

      const result = await getTravelEssentialsForTrip(trip());

      expect(result.visa.status).toBe("unknown");
      expect(result.passport.source).toBe("unknown");
      expect(result.visa.summarySource).toBe("template");
      expect(result.visa.officialLinks.length).toBeGreaterThan(0);
    });

    it("returns 'unknown' for a destination the dataset doesn't cover", async () => {
      stubCountries({ Chennai: "IN", "San Juan": "PR" });

      const result = await getTravelEssentialsForTrip(trip({ destination: "San Juan" }));

      expect(result.visa.status).toBe("unknown");
      expect(result.destination.countryCode).toBe("PR");
    });

    it("rejects a passport country the dataset doesn't cover", async () => {
      await expect(getTravelEssentialsForTrip(trip(), { passport: "ZZ" })).rejects.toMatchObject({
        statusCode: 400,
      });
    });

    it("offers every supported country as a passport option", async () => {
      const result = await getTravelEssentialsForTrip(trip());

      expect(result.passportOptions).toHaveLength(199);
    });
  });

  describe("AI summaries", () => {
    it("uses the AI summary when available, and labels it as such", async () => {
      const result = await getTravelEssentialsForTrip(trip());

      expect(result.visa.summary).toContain("AI-written summary");
      expect(result.visa.summarySource).toBe("ai");
      expect(result.connectivity.summarySource).toBe("ai");
    });

    it("falls back to the deterministic template when the model fails, without caching the failure", async () => {
      completeChat.mockRejectedValue(new Error("groq down"));

      const first = await getTravelEssentialsForTrip(trip());
      expect(first.visa.summarySource).toBe("template");
      expect(first.visa.summary).toContain("generally need to apply for a visa");
      expect(first.connectivity.summarySource).toBe("template");

      completeChat.mockResolvedValue("Recovered AI summary.");
      const second = await getTravelEssentialsForTrip(trip());
      expect(second.visa.summarySource).toBe("ai");
    });

    it("caches summaries, so repeat requests don't call the model again", async () => {
      await getTravelEssentialsForTrip(trip());
      const callsAfterFirst = completeChat.mock.calls.length;

      await getTravelEssentialsForTrip(trip());

      expect(callsAfterFirst).toBe(2); // one visa + one connectivity
      expect(completeChat).toHaveBeenCalledTimes(callsAfterFirst);
    });

    it("shares the cached visa summary across different trips with the same passport and destination", async () => {
      await getTravelEssentialsForTrip(trip({ id: "trip-a" }));
      const before = completeChat.mock.calls.length;

      await getTravelEssentialsForTrip(trip({ id: "trip-b", origin: "Chennai", destination: "Paris" }));

      expect(completeChat).toHaveBeenCalledTimes(before);
    });

    it("regenerates a summary once it's older than the cache TTL", async () => {
      const old = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString();
      await fakeDb.collection(CACHE).doc("connectivity_FR").set({ text: "Stale text", generatedAt: old });

      const result = await getTravelEssentialsForTrip(trip());

      expect(result.connectivity.summary).not.toBe("Stale text");
    });

    it("regenerates a visa summary when the vendored dataset has been updated", async () => {
      await fakeDb.collection(CACHE).doc("visa_IN_FR").set({
        text: "Summary written from an older dataset",
        generatedAt: new Date().toISOString(),
        datasetCommit: "0000000000000000000000000000000000000000",
      });

      const result = await getTravelEssentialsForTrip(trip());

      expect(result.visa.summary).not.toContain("older dataset");
      expect(getDatasetMetadata().commit).not.toBe("0000000000000000000000000000000000000000");
    });

    it("serves a fresh cached summary written for the current dataset", async () => {
      await fakeDb.collection(CACHE).doc("visa_IN_FR").set({
        text: "Cached and current.",
        generatedAt: new Date().toISOString(),
        datasetCommit: getDatasetMetadata().commit,
      });

      const result = await getTravelEssentialsForTrip(trip());

      expect(result.visa.summary).toBe("Cached and current.");
    });

    it("only sends country names and the structured facts to the model — never the trip's cities or budget", async () => {
      await getTravelEssentialsForTrip(trip({ origin: "Chennai", destination: "Paris", budget: 987654 }));

      const sent = JSON.stringify(completeChat.mock.calls).toLowerCase();

      expect(sent).toContain("india");
      expect(sent).toContain("france");
      expect(sent).not.toContain("chennai");
      expect(sent).not.toContain("987654");
    });

    it("keeps working when the summary cache itself is unavailable", async () => {
      fakeDb = {
        collection: () => ({
          doc: () => ({
            get: async () => {
              throw new Error("firestore unavailable");
            },
            set: async () => {
              throw new Error("firestore unavailable");
            },
          }),
        }),
      } as unknown as Firestore;

      const result = await getTravelEssentialsForTrip(trip());

      expect(result.visa.status).toBe("visa-required");
      expect(result.visa.summarySource).toBe("ai");
    });
  });

  describe("connectivity section", () => {
    it("returns eSIM links for the destination's country", async () => {
      stubCountries({ Chennai: "IN", Tokyo: "JP" });

      const result = await getTravelEssentialsForTrip(trip({ destination: "Tokyo" }));

      const airalo = result.connectivity.esimOptions.find((o) => o.provider === "Airalo");
      expect(airalo?.deepLink).toBe("https://www.airalo.com/japan-esim");
    });

    it("still returns working store links when the destination's country is unknown", async () => {
      stubCountries({});

      const result = await getTravelEssentialsForTrip(trip());

      expect(result.connectivity.esimOptions).toHaveLength(2);
      expect(result.connectivity.esimOptions.every((o) => !o.countrySpecific)).toBe(true);
      expect(result.connectivity.summarySource).toBe("template");
    });
  });

  it("always includes the disclaimer and dataset attribution", async () => {
    const result = await getTravelEssentialsForTrip(trip());

    expect(result.disclaimer.toLowerCase()).toContain("general guidance");
    expect(result.dataset.license).toBe("CC-BY-SA-4.0");
    expect(result.dataset.source).toContain("xpressmike/visa-matrix");
  });
});
