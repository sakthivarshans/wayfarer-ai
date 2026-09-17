export const TRANSPORT_OPTION_MODES = ["flight", "train", "bus"] as const;
export type TransportOptionMode = (typeof TRANSPORT_OPTION_MODES)[number];

export interface TransportOption {
  mode: TransportOptionMode;
  /** Human-readable provider/aggregator name, e.g. "Google Flights". */
  provider: string;
  /** Short label describing what the link does, shown as the button text. */
  label: string;
  /** Deep link to the provider's own search results — booking happens there. */
  deepLink: string;
  /** True when this mode matches the trip's transportModePreference. */
  recommended: boolean;
}

export interface TransportSummary {
  /**
   * Straight-line-routed road distance/duration between origin and
   * destination, from OSRM. `null` for either field if OSRM couldn't be
   * reached — the deep links below still work without it, since we never
   * gate transport options on this succeeding.
   */
  distanceKm: number | null;
  drivingDurationMinutes: number | null;
  options: TransportOption[];
}
