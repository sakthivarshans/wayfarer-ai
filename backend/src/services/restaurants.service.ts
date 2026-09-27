import type { Firestore } from "firebase-admin/firestore";
import { getFirestoreDb } from "../config/firebaseAdmin";
import { env } from "../config/env";
import { logger } from "../config/logger";
import { ApiError } from "../utils/apiError";
import type { Restaurant } from "../types/restaurant";
import type { Trip } from "../types/trip";
import { geocodeDestination } from "./places/geocode.provider";
import { fetchGeoapifyRestaurants } from "./restaurants/geoapifyRestaurants.provider";
import { fetchOverpassRestaurants } from "./restaurants/overpassRestaurants.provider";
import { rankAndTrimRestaurants } from "./restaurants/rankRestaurants";

const CACHE_COLLECTION = "restaurantResults";

function docToRestaurants(data: Record<string, unknown> | undefined): Restaurant[] | null {
  if (!data || !Array.isArray(data.restaurants)) {
    return null;
  }
  return data.restaurants as Restaurant[];
}

async function getCachedRestaurants(db: Firestore, tripId: string): Promise<Restaurant[] | null> {
  const doc = await db.collection(CACHE_COLLECTION).doc(tripId).get();
  if (!doc.exists) {
    return null;
  }
  return docToRestaurants(doc.data());
}

async function cacheRestaurants(db: Firestore, tripId: string, restaurants: Restaurant[]): Promise<void> {
  await db.collection(CACHE_COLLECTION).doc(tripId).set({
    restaurants,
    fetchedAt: new Date().toISOString(),
  });
}

/**
 * Fetches raw restaurants for a trip's destination, preferring Geoapify
 * (richer data) and falling back to OSM Overpass (always available, no
 * key) if Geoapify isn't configured or its request fails. Only throws if
 * *both* providers fail — a single provider outage should never surface to
 * the user as an error. Mirrors `places.service.ts`'s fallback strategy,
 * reusing the same geocode provider so a trip's destination is only
 * resolved to coordinates once conceptually (each service still calls it
 * once per request; a future optimization could share the result across
 * places/restaurants/hotels within one request).
 */
async function fetchRawRestaurants(trip: Trip): Promise<Restaurant[]> {
  const center = await geocodeDestination(trip.destination);

  if (env.GEOAPIFY_API_KEY) {
    try {
      return await fetchGeoapifyRestaurants(center, env.GEOAPIFY_API_KEY);
    } catch (err) {
      logger.warn(
        { err, tripId: trip.id },
        "Geoapify restaurants lookup failed, falling back to Overpass"
      );
    }
  }

  try {
    return await fetchOverpassRestaurants(center);
  } catch (err) {
    logger.error({ err, tripId: trip.id }, "Overpass restaurants lookup failed after Geoapify fallback");
    throw ApiError.upstream("Couldn't fetch nearby restaurants right now. Please try again shortly.");
  }
}

/**
 * Returns the ranked restaurant list for a trip, using a per-trip Firestore
 * cache so repeat page loads don't re-hit Geoapify/Overpass. Pass
 * `forceRefresh` to bypass the cache (e.g. a future "refresh" action).
 */
export async function getRestaurantsForTrip(
  trip: Trip,
  options: { forceRefresh?: boolean } = {}
): Promise<Restaurant[]> {
  const db = getFirestoreDb();

  if (!options.forceRefresh) {
    const cached = await getCachedRestaurants(db, trip.id);
    if (cached) {
      return cached;
    }
  }

  const raw = await fetchRawRestaurants(trip);
  const ranked = rankAndTrimRestaurants(raw, trip.budget, trip.days);

  await cacheRestaurants(db, trip.id, ranked);
  return ranked;
}
