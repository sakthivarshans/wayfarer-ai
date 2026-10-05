import type { OfficialLink, VisaEntry, VisaSectionStatus } from "../../types/travelEssentials";

export const DISCLAIMER =
  "General guidance only, not legal or immigration advice. Visa rules change often — always confirm with the " +
  "destination's official government or embassy website (or your airline) before you book or travel.";

interface VisaFacts {
  passportName: string | null;
  destinationName: string;
  status: VisaSectionStatus;
  entry: VisaEntry | null;
}

function stay(days: number | null): string {
  return days ? ` for up to ${days} days` : "";
}

/** The always-available, deterministic result line. Never AI-generated. */
export function buildHeadline(status: VisaSectionStatus, days: number | null): string {
  switch (status) {
    case "same-country":
      return "No visa needed — this is your own country";
    case "visa-free":
      return `Visa-free${stay(days)}`;
    case "freedom-of-movement":
      return "Freedom of movement — no visa needed";
    case "eta":
      return `Electronic travel authorisation required${stay(days)}`;
    case "e-visa":
      return `E-visa required${stay(days)}`;
    case "visa-on-arrival":
      return `Visa on arrival${stay(days)}`;
    case "visa-required":
      return "Visa required — apply before you travel";
    case "refused":
      return "Entry is not permitted for this passport";
    case "unknown":
      return "We don't have visa information for this trip";
  }
}

/**
 * Plain-language fallback used when the AI summary is unavailable. It states
 * only what the dataset says — nothing about fees, processing times, or
 * documents, which the dataset doesn't cover.
 */
export function buildTemplateSummary(facts: VisaFacts): string {
  const { passportName, destinationName, status, entry } = facts;
  const who = passportName ? `${passportName} passport holders` : "Travellers";
  const disputed =
    entry?.confidence === "disputed"
      ? " Our sources disagree about this route, so treat this as uncertain and check an official source."
      : "";

  switch (status) {
    case "same-country":
      return `You'd be travelling within your own country, so you shouldn't need a visa to enter ${destinationName}.`;
    case "unknown":
      return (
        `We couldn't work out the visa requirement for this trip — the destination or passport country wasn't ` +
        `recognised. Pick your passport country above, or check an official source.`
      );
    case "visa-free":
      return `${who} can generally enter ${destinationName} without a visa${stay(entry?.days ?? null)}.${disputed}`;
    case "freedom-of-movement":
      return `${who} can generally enter and stay in ${destinationName} without a visa.${disputed}`;
    case "eta":
      return `${who} generally need an electronic travel authorisation, applied for online before travelling to ${destinationName}.${disputed}`;
    case "e-visa":
      return `${who} generally need an e-visa, applied for online before travelling to ${destinationName}.${disputed}`;
    case "visa-on-arrival":
      return `${who} can generally get a visa on arrival in ${destinationName}${stay(entry?.days ?? null)}.${disputed}`;
    case "visa-required":
      return `${who} generally need to apply for a visa before travelling to ${destinationName}.${disputed}`;
    case "refused":
      return `${destinationName} generally does not admit ${who.toLowerCase()}.${disputed}`;
  }
}

/**
 * Curated per-country official URLs don't exist in any free dataset, so
 * these are honest general pointers, not a claim to know the government's
 * own page. (Curated overrides are planned for the admin dashboard.)
 */
export function buildOfficialLinks(destinationName: string, passportName: string | null): OfficialLink[] {
  const query = passportName
    ? `${destinationName} official visa requirements for ${passportName} citizens embassy`
    : `${destinationName} official visa requirements embassy`;
  const params = new URLSearchParams({ q: query });

  return [
    { label: "IATA Travel Centre — check entry rules", url: "https://www.iatatravelcentre.com/" },
    { label: `Search for ${destinationName}'s official visa page`, url: `https://www.google.com/search?${params}` },
  ];
}
