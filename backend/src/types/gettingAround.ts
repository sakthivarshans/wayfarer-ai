export const LOCAL_TRANSPORT_KINDS = ["cab", "transit"] as const;
export type LocalTransportKind = (typeof LOCAL_TRANSPORT_KINDS)[number];

export interface LocalTransportOption {
  kind: LocalTransportKind;
  /** Human-readable provider name, e.g. "Uber" or "Google Maps". */
  provider: string;
  /** Short label describing what the link does, shown as the button text. */
  label: string;
  /** Deep link to the provider — booking/directions happen there. */
  deepLink: string;
}

/**
 * Local transport *within the trip's destination* — distinct from
 * `TransportSummary`, which covers getting from origin to destination.
 * Every field here is derived from the destination only, never the origin.
 */
export interface GettingAroundSummary {
  /** The destination these options are scoped to (echoed for clarity). */
  destination: string;
  /** Uppercase ISO 3166-1 alpha-2 code, or null if it couldn't be determined. */
  countryCode: string | null;
  cabs: LocalTransportOption[];
  transit: LocalTransportOption[];
}
