export const TRANSPORT_OPTION_MODES = ["flight", "train", "bus"] as const;
export type TransportOptionMode = (typeof TRANSPORT_OPTION_MODES)[number];

export const TRANSPORT_MODE_LABELS: Record<TransportOptionMode, string> = {
  flight: "Flight",
  train: "Train",
  bus: "Bus",
};

export interface TransportOption {
  mode: TransportOptionMode;
  provider: string;
  label: string;
  deepLink: string;
  recommended: boolean;
}

export interface TransportSummary {
  distanceKm: number | null;
  drivingDurationMinutes: number | null;
  options: TransportOption[];
}
