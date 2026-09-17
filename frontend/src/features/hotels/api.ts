import { apiFetch } from "@/lib/apiClient";
import type { HotelSummary } from "./types";

export async function getHotels(token: string, tripId: string): Promise<HotelSummary> {
  const { hotels } = await apiFetch<{ hotels: HotelSummary }>(`/trips/${tripId}/hotels`, { token });
  return hotels;
}
