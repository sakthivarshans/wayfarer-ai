import { apiFetch } from "@/lib/apiClient";
import type { Itinerary } from "./types";

export async function getItinerary(token: string, tripId: string): Promise<Itinerary> {
  const { itinerary } = await apiFetch<{ itinerary: Itinerary }>(`/trips/${tripId}/itinerary`, { token });
  return itinerary;
}

/** Generates a fresh itinerary (or regenerates one), overwriting any saved version. */
export async function generateItinerary(token: string, tripId: string): Promise<Itinerary> {
  const { itinerary } = await apiFetch<{ itinerary: Itinerary }>(`/trips/${tripId}/itinerary/generate`, {
    method: "POST",
    token,
  });
  return itinerary;
}
