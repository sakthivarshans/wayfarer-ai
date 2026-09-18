import { ApiError } from "../../utils/apiError";
import type { HotelOption, HotelSummary } from "../../types/hotel";
import type { Itinerary, ItineraryActivity, ItineraryDay } from "../../types/itinerary";
import type { Place } from "../../types/place";
import type { Trip } from "../../types/trip";
import type { TransportOption, TransportSummary } from "../../types/transport";

/**
 * Picks the "chosen" transport option for the itinerary summary. There's
 * no per-item selection anywhere in the app (Phase 6 deliberately only
 * builds provider-level deep links, never priced individual flights — see
 * PHASES.md Phase 6), so this takes the first option in the summary's
 * existing order: `buildTransportOptions` already sorts the trip's
 * `transportModePreference` first (or leaves flight-first for "any").
 */
function chooseTransport(transport: TransportSummary): TransportOption {
  const [first] = transport.options;
  if (!first) {
    // Unreachable in practice — buildTransportOptions always returns all
    // three modes — but guarded because noUncheckedIndexedAccess can't
    // prove that here, and this must never fail silently.
    throw ApiError.internal("No transport options available to build an itinerary");
  }
  return first;
}

/**
 * Same reasoning as `chooseTransport`: hotels have no per-item selection
 * either (no priced individual hotels, just provider search links), so
 * this takes the first provider listed (Booking.com).
 */
function chooseHotel(hotel: HotelSummary): HotelOption {
  const [first] = hotel.options;
  if (!first) {
    throw ApiError.internal("No hotel options available to build an itinerary");
  }
  return first;
}

/**
 * Builds the day-by-day activity plan from a trip's already-ranked places
 * (Phase 5 trims this to ~3/day, cheap-first). Day 1 always opens with
 * arrival + hotel check-in; the last day always closes with departure.
 * Places are distributed round-robin starting on day 1 (right after
 * arrival/check-in), so day 1 gets a nearby place too and the remaining
 * places spread evenly across the rest — a day with no place landed on it
 * (only possible when there are fewer places than days) gets a "free
 * time" filler instead of being left empty.
 */
function buildDayPlans(destination: string, days: number, places: Place[]): ItineraryDay[] {
  const dayPlans: ItineraryDay[] = Array.from({ length: days }, (_, i) => ({
    day: i + 1,
    activities: [] as ItineraryActivity[],
  }));

  const firstDay = dayPlans[0];
  if (!firstDay) {
    // Unreachable — `days` is validated as a positive integer at trip
    // creation — but guarded for the same noUncheckedIndexedAccess reason.
    throw ApiError.internal("A trip must have at least one day to generate an itinerary");
  }
  firstDay.activities.push({ type: "arrival", label: `Arrive in ${destination}` });
  firstDay.activities.push({ type: "checkin", label: "Check in at your hotel" });

  places.forEach((place, index) => {
    const day = dayPlans[index % days];
    if (day) {
      day.activities.push({ type: "place", label: `Visit ${place.name}`, place });
    }
  });

  dayPlans.forEach((day) => {
    const hasPlace = day.activities.some((activity) => activity.type === "place");
    if (!hasPlace) {
      day.activities.push({ type: "free", label: "Free time to explore at your own pace" });
    }
  });

  const lastDay = dayPlans[dayPlans.length - 1];
  if (!lastDay) {
    throw ApiError.internal("A trip must have at least one day to generate an itinerary");
  }
  lastDay.activities.push({ type: "departure", label: `Depart from ${destination}` });

  return dayPlans;
}

/**
 * Combines a trip's places, transport summary, and hotel summary into a
 * full itinerary. Pure and deterministic — the same inputs always produce
 * the same output, so "regenerating" is just calling this again after the
 * underlying places/transport/hotels data has changed.
 */
export function buildItinerary(
  trip: Trip,
  places: Place[],
  transport: TransportSummary,
  hotel: HotelSummary
): Itinerary {
  return {
    tripId: trip.id,
    transport: chooseTransport(transport),
    hotel: chooseHotel(hotel),
    days: buildDayPlans(trip.destination, trip.days, places),
    generatedAt: new Date().toISOString(),
  };
}
