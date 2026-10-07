import type { Firestore } from "firebase-admin/firestore";
import { getFirestoreDb } from "../config/firebaseAdmin";
import type { LocalGuide } from "../types/admin";

const COLLECTION = "localGuides";

function docToGuide(id: string, data: Record<string, unknown>): LocalGuide {
  return {
    id,
    name: String(data.name),
    destination: String(data.destination),
    languages: Array.isArray(data.languages) ? data.languages.map(String) : [],
    specialty: String(data.specialty),
    bio: typeof data.bio === "string" ? data.bio : null,
    photoUrl: typeof data.photoUrl === "string" ? data.photoUrl : null,
    profileUrl: String(data.profileUrl),
    createdAt: String(data.createdAt),
    updatedAt: String(data.updatedAt),
  };
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

/**
 * Loosely matches a trip's free-text destination against a guide's
 * free-text destination (both admin- and user-entered, so never
 * guaranteed to agree on punctuation or specificity — "Marrakech" should
 * still match a trip to "Marrakech, Morocco", and vice versa). Mutual
 * substring containment after trimming/lowercasing, same spirit as the
 * rest of this app's free-text destination handling (no geocoding
 * involved — this is admin-curated data, not an external API).
 */
export function matchesDestination(tripDestination: string, guideDestination: string): boolean {
  const trip = normalize(tripDestination);
  const guide = normalize(guideDestination);
  if (!trip || !guide) {
    return false;
  }
  return trip.includes(guide) || guide.includes(trip);
}

/**
 * Public, read-only lookup of admin-curated Local Guide cards for a trip's
 * destination. Unlike Places/Restaurants/Hotels, this has no external API
 * call and nothing to cache — it's a direct read of a small, admin-managed
 * Firestore collection, filtered in memory the same way
 * `admin/analytics.service.ts` scans a whole (small, student-project-scale)
 * collection rather than needing a composite index for a prefix/contains
 * query Firestore can't do natively anyway.
 */
export async function getLocalGuidesForDestination(destination: string): Promise<LocalGuide[]> {
  const db: Firestore = getFirestoreDb();
  const snapshot = await db.collection(COLLECTION).get();

  return snapshot.docs
    .map((doc) => docToGuide(doc.id, doc.data()))
    .filter((guide) => matchesDestination(destination, guide.destination));
}
