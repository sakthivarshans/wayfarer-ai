import type { Firestore } from "firebase-admin/firestore";
import { getFirestoreDb } from "../config/firebaseAdmin";
import { env } from "../config/env";
import { logger } from "../config/logger";
import { ApiError } from "../utils/apiError";
import type { Place } from "../types/place";
import type { Trip } from "../types/trip";
import { geocodeDestination } from "./places/geocode.provider";
import { fetchGeoapifyPlaces } from "./places/geoapifyPlaces.provider";
import { fetchOverpassPlaces } from "./places/overpassPlaces.provider";
import { rankAndTrimPlaces } from "./places/rankPlaces";

const CACHE_COLLECTION = "placeResults";

function docToPlaces(data: Record<string, unknown> | undefined): Place[] | null {
  if (!data || !Array.isArray(data.places)) {
    return null;
  }
  return data.places as Place[];
}

async function getCachedPlaces(db: Firestore, tripId: string): Promise<Place[] | null> {
  const doc = await db.collection(CACHE_COLLECTION).doc(tripId).get();
  if (!doc.exists) {
    return null;
  }
  return docToPlaces(doc.data());
}

async function cachePlaces(db: Firestore, tripId: string, places: Place[]): Promise<void> {
  await db.collection(CACHE_COLLECTION).doc(tripId).set({
    places,
    fetchedAt: new Date().toISOString(),
  });
}

/**
 * Fetches raw places for a trip's destination, preferring Geoapify (richer
 * data) and falling back to OSM Overpass (always available, no key) if
 * Geoapify isn't configured or its request fails. Only throws if *both*
 * providers fail — a single provider outage should never surface to the
 * user as an error.
 */
async function fetchRawPlaces(trip: Trip): Promise<Place[]> {
  const center = await geocodeDestination(trip.destination);

  if (env.GEOAPIFY_API_KEY) {
    try {
      return await fetchGeoapifyPlaces(center, env.GEOAPIFY_API_KEY);
    } catch (err) {
      logger.warn({ err, tripId: trip.id }, "Geoapify places lookup failed, falling back to Overpass");
    }
  }

  try {
    return await fetchOverpassPlaces(center);
  } catch (err) {
    logger.error({ err, tripId: trip.id }, "Overpass places lookup failed after Geoapify fallback");
    throw ApiError.upstream("Couldn't fetch nearby places right now. Please try again shortly.");
  }
}

/**
 * Returns the ranked place list for a trip, using a per-trip Firestore
 * cache so repeat page loads don't re-hit Geoapify/Overpass. Pass
 * `forceRefresh` to bypass the cache (e.g. a future "refresh" action).
 */
export async function getPlacesForTrip(trip: Trip, options: { forceRefresh?: boolean } = {}): Promise<Place[]> {
  const db = getFirestoreDb();

  if (!options.forceRefresh) {
    const cached = await getCachedPlaces(db, trip.id);
    if (cached) {
      return cached;
    }
  }

  const raw = await fetchRawPlaces(trip);
  const ranked = rankAndTrimPlaces(raw, trip.budget, trip.days);

  await cachePlaces(db, trip.id, ranked);
  return ranked;
}
