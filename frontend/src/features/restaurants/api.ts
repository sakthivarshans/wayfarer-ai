import { apiFetch } from "@/lib/apiClient";
import type { Restaurant } from "./types";

export async function getRestaurants(token: string, tripId: string): Promise<Restaurant[]> {
  const { restaurants } = await apiFetch<{ restaurants: Restaurant[] }>(`/trips/${tripId}/restaurants`, {
    token,
  });
  return restaurants;
}
