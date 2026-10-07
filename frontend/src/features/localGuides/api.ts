import { apiFetch } from "@/lib/apiClient";
import type { LocalGuide } from "./types";

export async function getLocalGuides(token: string, tripId: string): Promise<LocalGuide[]> {
  const { guides } = await apiFetch<{ guides: LocalGuide[] }>(`/trips/${tripId}/local-guides`, { token });
  return guides;
}
