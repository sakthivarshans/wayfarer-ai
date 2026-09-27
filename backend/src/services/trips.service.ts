import type { Firestore } from "firebase-admin/firestore";
import { getFirestoreDb } from "../config/firebaseAdmin";
import type { CreateTripInput, Trip } from "../types/trip";

const COLLECTION = "trips";

function docToTrip(id: string, data: Record<string, unknown>): Trip {
  return {
    id,
    userId: String(data.userId),
    origin: String(data.origin),
    destination: String(data.destination),
    budget: Number(data.budget),
    days: Number(data.days),
    transportModePreference: data.transportModePreference as Trip["transportModePreference"],
    createdAt: String(data.createdAt),
  };
}

export async function createTrip(userId: string, input: CreateTripInput): Promise<Trip> {
  const db: Firestore = getFirestoreDb();
  const createdAt = new Date().toISOString();
  const record = { userId, ...input, createdAt };

  const ref = await db.collection(COLLECTION).add(record);
  return docToTrip(ref.id, record);
}

/**
 * Sorted in memory (newest first) rather than via Firestore `orderBy`, so
 * this query never requires a composite index to be created in the Firebase
 * console — keeps the free-tier setup to "enable Firestore" and nothing
 * more, which matters at this app's scale (a handful of trips per user).
 */
export async function listTripsForUser(userId: string): Promise<Trip[]> {
  const db: Firestore = getFirestoreDb();
  const snapshot = await db.collection(COLLECTION).where("userId", "==", userId).get();

  const trips = snapshot.docs.map((doc) => docToTrip(doc.id, doc.data()));
  return trips.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/**
 * Returns null both when the trip doesn't exist and when it belongs to a
 * different user — callers should turn either case into an identical 404,
 * never revealing that a trip ID exists but isn't theirs.
 */
export async function getTripById(userId: string, id: string): Promise<Trip | null> {
  const db: Firestore = getFirestoreDb();
  const doc = await db.collection(COLLECTION).doc(id).get();

  if (!doc.exists) {
    return null;
  }

  const trip = docToTrip(doc.id, doc.data() ?? {});
  return trip.userId === userId ? trip : null;
}
