import type { Firestore } from "firebase-admin/firestore";
import { getFirestoreDb } from "../config/firebaseAdmin";
import { logger } from "../config/logger";
import type { GettingAroundSummary } from "../types/gettingAround";
import type { Trip } from "../types/trip";
import { lookupCountryCode } from "./gettingAround/countryLookup.provider";
import { buildCabOptions, buildTransitOptions } from "./gettingAround/deepLinks";

const CACHE_COLLECTION = "gettingAroundResults";

function docToSummary(data: Record<string, unknown> | undefined): GettingAroundSummary | null {
  if (!data || typeof data.destination !== "string" || !Array.isArray(data.cabs) || !Array.isArray(data.transit)) {
    return null;
  }
  return {
    destination: data.destination,
    countryCode: typeof data.countryCode === "string" ? data.countryCode : null,
    cabs: data.cabs as GettingAroundSummary["cabs"],
    transit: data.transit as GettingAroundSummary["transit"],
  };
}

async function getCachedSummary(db: Firestore, trip: Trip): Promise<GettingAroundSummary | null> {
  const doc = await db.collection(CACHE_COLLECTION).doc(trip.id).get();
  if (!doc.exists) {
    return null;
  }
  const summary = docToSummary(doc.data());
  // Guard against a stale entry scoped to a different destination.
  return summary && summary.destination === trip.destination ? summary : null;
}

/**
 * Returns local transport options for the trip's *destination* (never its
 * origin): ride-hailing apps known to operate in the destination's country
 * plus Google Maps taxi/transit deep links. The country lookup is
 * best-effort — if it fails we still return the generic links, but skip
 * caching so a transient failure isn't remembered.
 */
export async function getGettingAroundForTrip(
  trip: Trip,
  options: { forceRefresh?: boolean } = {}
): Promise<GettingAroundSummary> {
  const db = getFirestoreDb();

  if (!options.forceRefresh) {
    const cached = await getCachedSummary(db, trip);
    if (cached) {
      return cached;
    }
  }

  let countryCode: string | null = null;
  let lookupSucceeded = true;
  try {
    countryCode = await lookupCountryCode(trip.destination);
  } catch (err) {
    lookupSucceeded = false;
    logger.warn({ err, tripId: trip.id }, "Country lookup failed; returning generic getting-around links");
  }

  const summary: GettingAroundSummary = {
    destination: trip.destination,
    countryCode,
    cabs: buildCabOptions(trip.destination, countryCode),
    transit: buildTransitOptions(trip.destination),
  };

  if (lookupSucceeded) {
    await db.collection(CACHE_COLLECTION).doc(trip.id).set(summary);
  }
  return summary;
}
