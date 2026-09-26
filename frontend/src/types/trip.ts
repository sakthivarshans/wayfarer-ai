// Mirrors backend/src/models/Trip.ts + schemas/trip.schema.ts. Kept as a
// separate, hand-synced copy since frontend and backend are independent
// apps/deploys (no shared package) — update both sides together.

export const TRANSPORT_MODES = ["flight", "train", "bus", "any"] as const;
export type TransportModePreference = (typeof TRANSPORT_MODES)[number];

export interface CreateTripPayload {
  origin: string;
  destination: string;
  budget: number;
  days: number;
  transportModePreference: TransportModePreference;
}

export interface TripRecord extends CreateTripPayload {
  id: string;
  createdAt: string;
}

export interface CreateTripResponse {
  id: string;
  trip: TripRecord;
}
