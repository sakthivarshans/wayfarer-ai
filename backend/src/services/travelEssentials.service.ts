import type { Firestore } from "firebase-admin/firestore";
import { getFirestoreDb } from "../config/firebaseAdmin";
import { logger } from "../config/logger";
import { ApiError } from "../utils/apiError";
import type { Trip } from "../types/trip";
import type {
  ConnectivitySection,
  SummarySource,
  TravelEssentials,
  VisaSection,
  VisaSectionStatus,
} from "../types/travelEssentials";
import { lookupCountryCode } from "./gettingAround/countryLookup.provider";
import { buildEsimOptions, buildTemplateConnectivitySummary } from "./travelEssentials/connectivity";
import {
  countryNameFor,
  getDatasetMetadata,
  isSupportedCountry,
  listPassportOptions,
  lookupVisa,
} from "./travelEssentials/visaDataset";
import {
  buildConnectivityMessages,
  buildVisaMessages,
  generateSummary,
} from "./travelEssentials/travelSummaryAi";
import {
  DISCLAIMER,
  buildHeadline,
  buildOfficialLinks,
  buildTemplateSummary,
} from "./travelEssentials/visaSummary";

const SUMMARY_CACHE_COLLECTION = "travelEssentialsSummaries";
const SUMMARY_TTL_MS = 30 * 24 * 60 * 60 * 1000;

interface CachedSummary {
  text: string;
  generatedAt: string;
  /** Visa summaries are invalidated when the vendored dataset is updated. */
  datasetCommit?: string;
}

function isFresh(cached: CachedSummary, datasetCommit?: string): boolean {
  if (datasetCommit && cached.datasetCommit !== datasetCommit) {
    return false;
  }
  return Date.now() - new Date(cached.generatedAt).getTime() < SUMMARY_TTL_MS;
}

/**
 * Returns a cached AI summary or generates (and caches) a new one. Cache
 * problems are logged, never thrown: a Firestore hiccup shouldn't take down
 * a page whose core content doesn't depend on it.
 */
async function getOrCreateAiSummary(
  db: Firestore,
  docId: string,
  generate: () => Promise<string | null>,
  datasetCommit?: string
): Promise<string | null> {
  const ref = db.collection(SUMMARY_CACHE_COLLECTION).doc(docId);

  try {
    const doc = await ref.get();
    const cached = doc.exists ? (doc.data() as CachedSummary | undefined) : undefined;
    if (cached?.text && isFresh(cached, datasetCommit)) {
      return cached.text;
    }
  } catch (err) {
    logger.warn({ err, docId }, "Reading the travel summary cache failed; regenerating");
  }

  const text = await generate();
  if (text) {
    try {
      const entry: CachedSummary = { text, generatedAt: new Date().toISOString() };
      if (datasetCommit) {
        entry.datasetCommit = datasetCommit;
      }
      await ref.set(entry);
    } catch (err) {
      logger.warn({ err, docId }, "Writing the travel summary cache failed");
    }
  }
  return text;
}

/** Country lookups are best-effort: a failed lookup means "unknown", not an error. */
async function safeCountryLookup(place: string, tripId: string): Promise<string | null> {
  try {
    return await lookupCountryCode(place);
  } catch (err) {
    logger.warn({ err, tripId, place }, "Country lookup failed for travel essentials");
    return null;
  }
}

async function buildVisaSection(
  db: Firestore,
  input: { passportCode: string | null; destinationCode: string | null; destinationName: string }
): Promise<VisaSection> {
  const { passportCode, destinationCode, destinationName } = input;
  const passportName = countryNameFor(passportCode);

  let status: VisaSectionStatus = "unknown";
  let entry = null;

  if (passportCode && destinationCode) {
    if (passportCode === destinationCode) {
      status = "same-country";
    } else {
      entry = lookupVisa(passportCode, destinationCode);
      status = entry?.status ?? "unknown";
    }
  }

  const headline = buildHeadline(status, entry?.days ?? null);
  const template = buildTemplateSummary({ passportName, destinationName, status, entry });

  let summary = template;
  let summarySource: SummarySource = "template";

  // Only ask the model about routes we actually have facts for.
  if (entry && passportName && passportCode && destinationCode) {
    const commit = getDatasetMetadata().commit;
    const ai = await getOrCreateAiSummary(
      db,
      `visa_${passportCode}_${destinationCode}`,
      () => generateSummary(buildVisaMessages({ passportName, destinationName, status, entry }), "visa"),
      commit
    );
    if (ai) {
      summary = ai;
      summarySource = "ai";
    }
  }

  return {
    status,
    days: entry?.days ?? null,
    confidence: entry?.confidence ?? null,
    sourcesDisagree: entry?.confidence === "disputed",
    headline,
    summary,
    summarySource,
    officialLinks: buildOfficialLinks(destinationName, passportName),
  };
}

async function buildConnectivitySection(
  db: Firestore,
  input: { destinationCode: string | null; destinationName: string }
): Promise<ConnectivitySection> {
  const { destinationCode, destinationName } = input;
  const countryName = countryNameFor(destinationCode);
  const displayName = countryName ?? destinationName;

  let summary = buildTemplateConnectivitySummary(displayName);
  let summarySource: SummarySource = "template";

  if (destinationCode) {
    const ai = await getOrCreateAiSummary(db, `connectivity_${destinationCode}`, () =>
      generateSummary(buildConnectivityMessages(displayName), "connectivity")
    );
    if (ai) {
      summary = ai;
      summarySource = "ai";
    }
  }

  return { summary, summarySource, esimOptions: buildEsimOptions(destinationCode, countryName) };
}

/**
 * Travel essentials for a trip's destination: visa requirements for a
 * passport (guessed from the trip's origin country unless the caller
 * supplies one) plus SIM/eSIM options. The passport guess is deliberately
 * labelled as a guess in the response — where someone lives and which
 * passport they hold aren't always the same.
 */
export async function getTravelEssentialsForTrip(
  trip: Trip,
  options: { passport?: string } = {}
): Promise<TravelEssentials> {
  if (options.passport && !isSupportedCountry(options.passport)) {
    throw ApiError.badRequest(`Unsupported passport country "${options.passport}"`);
  }

  const db = getFirestoreDb();

  // Sequential on purpose: Nominatim's usage policy asks for no more than
  // one request per second.
  const destinationCode = await safeCountryLookup(trip.destination, trip.id);
  const originCode = options.passport ? null : await safeCountryLookup(trip.origin, trip.id);

  const passportCode = options.passport ?? originCode;
  const passportSource = options.passport ? "selected" : originCode ? "origin" : "unknown";
  const destinationName = countryNameFor(destinationCode) ?? trip.destination;

  const [visa, connectivity] = await Promise.all([
    buildVisaSection(db, { passportCode, destinationCode, destinationName }),
    buildConnectivitySection(db, { destinationCode, destinationName: trip.destination }),
  ]);

  const metadata = getDatasetMetadata();

  return {
    destination: { name: trip.destination, countryCode: destinationCode, countryName: countryNameFor(destinationCode) },
    passport: { countryCode: passportCode, countryName: countryNameFor(passportCode), source: passportSource },
    visa,
    connectivity,
    passportOptions: listPassportOptions(),
    dataset: { source: metadata.source, license: metadata.license, retrievedAt: metadata.retrievedAt },
    disclaimer: DISCLAIMER,
  };
}
