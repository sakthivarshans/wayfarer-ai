import type { HotelOption } from "./hotel";
import type { Place } from "./place";
import type { TransportOption } from "./transport";

export const ITINERARY_ACTIVITY_TYPES = ["arrival", "checkin", "place", "free", "departure"] as const;
export type ItineraryActivityType = (typeof ITINERARY_ACTIVITY_TYPES)[number];

export interface ItineraryActivity {
  type: ItineraryActivityType;
  /** Human-readable line for the timeline, e.g. "Visit Fort Aguada". */
  label: string;
  /** Present only when type === "place" — the full place being visited. */
  place?: Place;
}

export interface ItineraryDay {
  day: number;
  activities: ItineraryActivity[];
}

export interface Itinerary {
  tripId: string;
  /**
   * The transport/hotel options tabs (Phase 6) only ever built
   * provider-level deep links, never priced individual flights or hotels —
   * there's nothing to "select" beyond that. These fields are simply the
   * first option from each summary's existing order (see
   * `services/itinerary/build.ts`), shown here as a trip-level summary.
   */
  transport: TransportOption;
  hotel: HotelOption;
  days: ItineraryDay[];
  /** ISO 8601 string, set whenever the itinerary is (re)generated. */
  generatedAt: string;
}
