import { Trip, type TripDocument } from "../models/Trip";
import type { CreateTripInput } from "../schemas/trip.schema";

/**
 * Creates and persists a new Trip. Kept as a thin service function (rather
 * than inline in the route handler) so later phases — which will call this
 * from the itinerary generator, the Telegram webhook, etc. — have one place
 * to import it from.
 */
export async function createTrip(input: CreateTripInput): Promise<TripDocument> {
  return Trip.create(input);
}

export async function getTripById(id: string): Promise<TripDocument | null> {
  return Trip.findById(id);
}
