export const TRANSPORT_MODES = ["flight", "train", "bus", "any"] as const;
export type TransportModePreference = (typeof TRANSPORT_MODES)[number];

export interface CreateTripInput {
  origin: string;
  destination: string;
  budget: number;
  days: number;
  transportModePreference: TransportModePreference;
}

export interface Trip extends CreateTripInput {
  id: string;
  userId: string;
  /** ISO 8601 string, set server-side. */
  createdAt: string;
}
