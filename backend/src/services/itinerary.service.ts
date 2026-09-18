import type { Firestore } from "firebase-admin/firestore";
import { getFirestoreDb } from "../config/firebaseAdmin";
import type { Itinerary } from "../types/itinerary";
import type { Trip } from "../types/trip";
import { buildItinerary } from "./itinerary/build";
import { getHotelsForTrip } from "./hotels.service";
import { getPlacesForTrip } from "./places.service";
import { getTransportForTrip } from "./transport.service";

const CACHE_COLLECTION = "itineraries";

function docToItinerary(data: Record<string, unknown> | undefined): Itinerary | null {
  if (!data || !Array.isArray(data.days) || typeof data.tripId !== "string") {
    return null;
  }
  return data as unknown as Itinerary;
}

async function getCachedItinerary(db: Firestore, tripId: string): Promise<Itinerary | null> {
  const doc = await db.collection(CACHE_COLLECTION).doc(tripId).get();
  if (!doc.exists) {
    return null;
  }
  return docToItinerary(doc.data());
}

async function cacheItinerary(db: Firestore, tripId: string, itinerary: Itinerary): Promise<void> {
  await db.collection(CACHE_COLLECTION).doc(tripId).set(itinerary);
}

/**
 * (Re)generates the itinerary for a trip: fetches (or reuses the cached)
 * places/transport/hotels data for the trip, combines it into a
 * day-by-day plan, and persists it as the trip's saved itinerary,
 * overwriting whatever was there before. This is the only way an
 * itinerary is created — `getItineraryForTrip` never generates one on its
 * own — so calling this again is exactly what "regenerate" means.
 */
export async function generateItineraryForTrip(trip: Trip): Promise<Itinerary> {
  const db = getFirestoreDb();

  const [places, transport, hotel] = await Promise.all([
    getPlacesForTrip(trip),
    getTransportForTrip(trip),
    getHotelsForTrip(trip),
  ]);

  const itinerary = buildItinerary(trip, places, transport, hotel);

  await cacheItinerary(db, trip.id, itinerary);
  return itinerary;
}

/**
 * Returns the trip's saved itinerary, or `null` if one hasn't been
 * generated yet. Never generates one implicitly — the controller turns a
 * `null` here into a 404 telling the frontend to call generate.
 */
export async function getItineraryForTrip(trip: Trip): Promise<Itinerary | null> {
  const db = getFirestoreDb();
  return getCachedItinerary(db, trip.id);
}
