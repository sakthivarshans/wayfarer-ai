/** Status vocabulary from the vendored visa dataset (see data/visa/NOTICE.md). */
export const VISA_STATUSES = [
  "visa-free",
  "freedom-of-movement",
  "eta",
  "e-visa",
  "visa-on-arrival",
  "visa-required",
  "refused",
] as const;
export type VisaStatus = (typeof VISA_STATUSES)[number];

/** How much the dataset trusts a row: `disputed` means its sources disagree. */
export type VisaConfidence = "high" | "medium" | "disputed";

export interface VisaEntry {
  status: VisaStatus;
  /** Permitted stay in days when the dataset knows it, otherwise null. */
  days: number | null;
  confidence: VisaConfidence;
}

export interface CountryRef {
  /** Uppercase ISO 3166-1 alpha-2, or null if it couldn't be determined. */
  countryCode: string | null;
  /** Display name from the dataset's country list, when the code is in it. */
  countryName: string | null;
}

export type SummarySource = "ai" | "template";

/** `same-country` and `unknown` are ours, not the dataset's. */
export type VisaSectionStatus = VisaStatus | "same-country" | "unknown";

export interface OfficialLink {
  label: string;
  url: string;
}

export interface VisaSection {
  status: VisaSectionStatus;
  days: number | null;
  confidence: VisaConfidence | null;
  /** True when the dataset's own sources disagree about this route. */
  sourcesDisagree: boolean;
  /** Deterministic one-line result, always shown even if the AI summary fails. */
  headline: string;
  /** Plain-language explanation. AI-written when possible, template otherwise. */
  summary: string;
  summarySource: SummarySource;
  officialLinks: OfficialLink[];
}

export interface EsimOption {
  provider: string;
  label: string;
  deepLink: string;
  /** False when we fell back to the provider's general store page. */
  countrySpecific: boolean;
}

export interface ConnectivitySection {
  summary: string;
  summarySource: SummarySource;
  esimOptions: EsimOption[];
}

export interface PassportOption {
  code: string;
  name: string;
}

export interface TravelEssentials {
  destination: CountryRef & { name: string };
  passport: CountryRef & {
    /**
     * `origin`: guessed from the trip's origin country (which may not match
     * the traveller's actual passport). `selected`: the user chose it.
     */
    source: "origin" | "selected" | "unknown";
  };
  visa: VisaSection;
  connectivity: ConnectivitySection;
  passportOptions: PassportOption[];
  dataset: { source: string; license: string; retrievedAt: string };
  disclaimer: string;
}
