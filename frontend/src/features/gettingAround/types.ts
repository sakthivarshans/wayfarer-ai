export type LocalTransportKind = "cab" | "transit";

export interface LocalTransportOption {
  kind: LocalTransportKind;
  provider: string;
  label: string;
  deepLink: string;
}

export interface GettingAroundSummary {
  /** The destination these options are scoped to (never the trip's origin). */
  destination: string;
  countryCode: string | null;
  cabs: LocalTransportOption[];
  transit: LocalTransportOption[];
}
