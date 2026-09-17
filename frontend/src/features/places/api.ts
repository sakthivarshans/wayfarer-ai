import { apiFetch } from "@/lib/apiClient";
import type { Place } from "./types";

export async function getPlaces(token: string, tripId: string): Promise<Place[]> {
  const { places } = await apiFetch<{ places: Place[] }>(`/trips/${tripId}/places`, { token });
  return places;
}
