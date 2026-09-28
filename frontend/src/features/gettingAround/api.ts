import { apiFetch } from "@/lib/apiClient";
import type { GettingAroundSummary } from "./types";

export async function getGettingAround(token: string, tripId: string): Promise<GettingAroundSummary> {
  const { gettingAround } = await apiFetch<{ gettingAround: GettingAroundSummary }>(
    `/trips/${tripId}/getting-around`,
    { token }
  );
  return gettingAround;
}
