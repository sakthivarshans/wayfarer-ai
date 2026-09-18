import type { HotelOption } from "@/features/hotels/types";
import type { Place } from "@/features/places/types";
import type { TransportOption } from "@/features/transport/types";

export const ITINERARY_ACTIVITY_TYPES = ["arrival", "checkin", "place", "free", "departure"] as const;
export type ItineraryActivityType = (typeof ITINERARY_ACTIVITY_TYPES)[number];

export interface ItineraryActivity {
  type: ItineraryActivityType;
  label: string;
  /** Present only when type === "place". */
  place?: Place;
}

export interface ItineraryDay {
  day: number;
  activities: ItineraryActivity[];
}

export interface Itinerary {
  tripId: string;
  transport: TransportOption;
  hotel: HotelOption;
  days: ItineraryDay[];
  generatedAt: string;
}
