export const TRANSPORT_MODES = ["flight", "train", "bus", "any"] as const;
export type TransportModePreference = (typeof TRANSPORT_MODES)[number];

export const TRANSPORT_MODE_LABELS: Record<TransportModePreference, string> = {
  flight: "Flight",
  train: "Train",
  bus: "Bus",
  any: "Any",
};

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
  createdAt: string;
}
