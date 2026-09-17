import { apiFetch } from "@/lib/apiClient";
import type { TransportSummary } from "./types";

export async function getTransport(token: string, tripId: string): Promise<TransportSummary> {
  const { transport } = await apiFetch<{ transport: TransportSummary }>(`/trips/${tripId}/transport`, { token });
  return transport;
}
