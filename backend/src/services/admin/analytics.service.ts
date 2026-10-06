import { getFirebaseAuth, getFirestoreDb } from "../../config/firebaseAdmin";
import type { AnalyticsSummary, DestinationCount } from "../../types/admin";

const TOP_DESTINATIONS_LIMIT = 10;
const LIST_USERS_PAGE_SIZE = 1000;

/**
 * Total registered users, counted via Firebase Auth's own user list rather
 * than a Firestore "users" doc per person — there isn't one; this app has
 * no user-profile collection, only Firebase Auth accounts (plus a Firestore
 * "users" doc for the subset who've connected Telegram, which would
 * undercount). Paginates in case this ever needs to, though at this app's
 * scale a single page covers everyone.
 */
async function countAllUsers(): Promise<number> {
  const auth = getFirebaseAuth();
  let total = 0;
  let pageToken: string | undefined;

  do {
    const page = await auth.listUsers(LIST_USERS_PAGE_SIZE, pageToken);
    total += page.users.length;
    pageToken = page.pageToken;
  } while (pageToken);

  return total;
}

/**
 * Groups trips by destination case-insensitively (so "Paris" and "paris"
 * count as one), keeping the first-seen casing for display, and returns the
 * top N by trip count.
 */
function topDestinationsFrom(destinations: string[]): DestinationCount[] {
  const counts = new Map<string, DestinationCount>();

  for (const raw of destinations) {
    const destination = raw.trim();
    if (!destination) {
      continue;
    }
    const key = destination.toLowerCase();
    const existing = counts.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      counts.set(key, { destination, count: 1 });
    }
  }

  return [...counts.values()].sort((a, b) => b.count - a.count).slice(0, TOP_DESTINATIONS_LIMIT);
}

/**
 * Basic aggregate counts for the admin dashboard. A full collection scan
 * for trips, same trade-off `trips.service.ts` already makes — fine at this
 * app's scale, and avoids needing a composite index or a maintained counter
 * document.
 */
export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const db = getFirestoreDb();

  const [totalUsers, tripsSnapshot] = await Promise.all([countAllUsers(), db.collection("trips").get()]);

  const destinations = tripsSnapshot.docs.map((doc) => String(doc.data().destination ?? ""));

  return {
    totalUsers,
    totalTrips: tripsSnapshot.docs.length,
    topDestinations: topDestinationsFrom(destinations),
  };
}
