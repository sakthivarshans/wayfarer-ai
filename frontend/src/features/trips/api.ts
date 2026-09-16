import { apiFetch } from "@/lib/apiClient";
import type { CreateTripInput, Trip } from "./types";

export async function createTrip(token: string, input: CreateTripInput): Promise<Trip> {
  const { trip } = await apiFetch<{ trip: Trip }>("/trips", {
    method: "POST",
    token,
    body: input,
  });
  return trip;
}

export async function listTrips(token: string): Promise<Trip[]> {
  const { trips } = await apiFetch<{ trips: Trip[] }>("/trips", { token });
  return trips;
}

export async function getTrip(token: string, id: string): Promise<Trip> {
  const { trip } = await apiFetch<{ trip: Trip }>(`/trips/${id}`, { token });
  return trip;
}
