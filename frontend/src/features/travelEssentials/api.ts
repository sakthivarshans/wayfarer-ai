import { apiFetch } from "@/lib/apiClient";
import type { TravelEssentials } from "./types";

export async function getTravelEssentials(
  token: string,
  tripId: string,
  passport?: string
): Promise<TravelEssentials> {
  const query = passport ? `?passport=${encodeURIComponent(passport)}` : "";
  const { travelEssentials } = await apiFetch<{ travelEssentials: TravelEssentials }>(
    `/trips/${tripId}/travel-essentials${query}`,
    { token }
  );
  return travelEssentials;
}
