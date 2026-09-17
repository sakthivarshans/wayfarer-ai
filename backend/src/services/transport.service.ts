import type { Firestore } from "firebase-admin/firestore";
import { getFirestoreDb } from "../config/firebaseAdmin";
import { logger } from "../config/logger";
import type { Trip } from "../types/trip";
import type { TransportSummary } from "../types/transport";
import { geocodeDestination } from "./places/geocode.provider";
import { fetchRoadRoute } from "./transport/osrmRoute.provider";
import { buildTransportOptions } from "./transport/deepLinks";

const CACHE_COLLECTION = "transportResults";

function docToSummary(data: Record<string, unknown> | undefined): TransportSummary | null {
  if (!data || !Array.isArray(data.options)) {
    return null;
  }
  return {
    distanceKm: typeof data.distanceKm === "number" ? data.distanceKm : null,
    drivingDurationMinutes: typeof data.drivingDurationMinutes === "number" ? data.drivingDurationMinutes : null,
    options: data.options as TransportSummary["options"],
  };
}

async function getCachedSummary(db: Firestore, tripId: string): Promise<TransportSummary | null> {
  const doc = await db.collection(CACHE_COLLECTION).doc(tripId).get();
  if (!doc.exists) {
    return null;
  }
  return docToSummary(doc.data());
}

async function cacheSummary(db: Firestore, tripId: string, summary: TransportSummary): Promise<void> {
  await db.collection(CACHE_COLLECTION).doc(tripId).set(summary);
}

/**
 * Best-effort road distance/duration between the trip's origin and
 * destination. Returns nulls (never throws) on any failure — OSRM is
 * purely supplementary context here, and the deep links below are the
 * actual point of this feature.
 */
async function estimateRoadRoute(
  trip: Trip
): Promise<{ distanceKm: number | null; drivingDurationMinutes: number | null }> {
  try {
    const [origin, destination] = await Promise.all([
      geocodeDestination(trip.origin),
      geocodeDestination(trip.destination),
    ]);
    const route = await fetchRoadRoute(origin, destination);
    return { distanceKm: route.distanceKm, drivingDurationMinutes: route.durationMinutes };
  } catch (err) {
    logger.warn({ err, tripId: trip.id }, "Road route estimate failed; continuing without it");
    return { distanceKm: null, drivingDurationMinutes: null };
  }
}

/**
 * Returns the transport summary for a trip (road distance/duration
 * estimate + one deep link per mode), using a per-trip Firestore cache.
 * Pass `forceRefresh` to bypass it.
 */
export async function getTransportForTrip(
  trip: Trip,
  options: { forceRefresh?: boolean } = {}
): Promise<TransportSummary> {
  const db = getFirestoreDb();

  if (!options.forceRefresh) {
    const cached = await getCachedSummary(db, trip.id);
    if (cached) {
      return cached;
    }
  }

  const { distanceKm, drivingDurationMinutes } = await estimateRoadRoute(trip);
  const transportOptions = buildTransportOptions(trip.origin, trip.destination, trip.transportModePreference);

  const summary: TransportSummary = { distanceKm, drivingDurationMinutes, options: transportOptions };

  await cacheSummary(db, trip.id, summary);
  return summary;
}
