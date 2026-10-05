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
export type VisaConfidence = "high" | "medium" | "disputed";
export type SummarySource = "ai" | "template";
export type VisaSectionStatus = VisaStatus | "same-country" | "unknown";

export interface OfficialLink {
  label: string;
  url: string;
}

export interface VisaSection {
  status: VisaSectionStatus;
  days: number | null;
  confidence: VisaConfidence | null;
  sourcesDisagree: boolean;
  headline: string;
  summary: string;
  summarySource: SummarySource;
  officialLinks: OfficialLink[];
}

export interface EsimOption {
  provider: string;
  label: string;
  deepLink: string;
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

export interface CountryRef {
  countryCode: string | null;
  countryName: string | null;
}

export interface TravelEssentials {
  destination: CountryRef & { name: string };
  passport: CountryRef & { source: "origin" | "selected" | "unknown" };
  visa: VisaSection;
  connectivity: ConnectivitySection;
  passportOptions: PassportOption[];
  dataset: { source: string; license: string; retrievedAt: string };
  disclaimer: string;
}
