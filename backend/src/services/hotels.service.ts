import type { Trip } from "../types/trip";
import type { HotelSummary } from "../types/hotel";
import { buildHotelOptions } from "./hotels/deepLinks";

/**
 * Builds the hotel deep-link summary for a trip. Purely computed from the
 * trip's own fields — no external API call — so unlike places/transport
 * there's nothing here worth caching.
 */
export function getHotelsForTrip(trip: Trip): HotelSummary {
  return {
    perNightBudgetHint: Math.round(trip.budget / trip.days),
    options: buildHotelOptions(trip.destination),
  };
}
