import type { EsimOption } from "../../types/travelEssentials";

// Store/home pages both confirmed to exist; used whenever we can't build a
// country page we're confident about.
const AIRALO_STORE = "https://www.airalo.com/esim";
const HOLAFLY_HOME = "https://esim.holafly.com/";

// Airalo country pages are `/{name}-esim` (verified: /japan-esim,
// /united-states-esim). Where the dataset's name differs from how Airalo
// names the country, map it explicitly.
const AIRALO_SLUG_ALIASES: Record<string, string> = {
  CZ: "czechia",
  MM: "myanmar",
  CI: "ivory-coast",
  CV: "cape-verde",
};

// Names we can't confidently map (punctuation, "and", or a naming we
// haven't seen the marketplace use) get the store page instead of a guess.
const NO_DIRECT_LINK = new Set(["AG", "BA", "GW", "KN", "ST", "TT", "VC", "CD", "FM", "KP"]);

// Holafly country pages are `/esim-{name}/` (verified: /esim-japan/). Only
// single-word names are linked directly; multi-word names (US, UK, UAE...)
// are unverified, so they go to the home page.
const HOLAFLY_EXCLUDE = new Set(["MM", "KP", ...NO_DIRECT_LINK]);

function stripDiacritics(value: string): string {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
}

function slugify(name: string): string {
  return stripDiacritics(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function isPlainName(name: string): boolean {
  return /^[A-Za-z ]+$/.test(stripDiacritics(name)) && !/\band\b/i.test(name);
}

function airaloSlug(code: string, name: string): string | null {
  if (NO_DIRECT_LINK.has(code) && !(code in AIRALO_SLUG_ALIASES)) {
    return null;
  }
  const alias = AIRALO_SLUG_ALIASES[code];
  if (alias) {
    return alias;
  }
  return isPlainName(name) ? slugify(name) : null;
}

function holaflySlug(code: string, name: string): string | null {
  if (HOLAFLY_EXCLUDE.has(code) || !isPlainName(name) || name.includes(" ")) {
    return null;
  }
  return slugify(name);
}

/**
 * Builds redirect-only links to established eSIM marketplaces. When the
 * destination's country isn't known, or we can't build a country page we
 * trust, each provider falls back to its general store page — a working
 * link is always better than a guessed one that might 404.
 */
export function buildEsimOptions(code: string | null, name: string | null): EsimOption[] {
  const airalo = code && name ? airaloSlug(code.toUpperCase(), name) : null;
  const holafly = code && name ? holaflySlug(code.toUpperCase(), name) : null;

  return [
    {
      provider: "Airalo",
      label: airalo && name ? `Browse ${name} eSIM plans` : "Browse the Airalo eSIM store",
      deepLink: airalo ? `https://www.airalo.com/${airalo}-esim` : AIRALO_STORE,
      countrySpecific: airalo !== null,
    },
    {
      provider: "Holafly",
      label: holafly && name ? `Browse ${name} eSIM plans` : "Browse Holafly eSIM plans",
      deepLink: holafly ? `https://esim.holafly.com/esim-${holafly}/` : HOLAFLY_HOME,
      countrySpecific: holafly !== null,
    },
  ];
}

export function buildTemplateConnectivitySummary(destinationName: string): string {
  return (
    `Travellers to ${destinationName} usually choose between a local physical SIM, an international eSIM, or ` +
    `roaming on their home plan. eSIMs can be installed before you fly, while local SIMs are often sold at airports ` +
    `or phone shops (sometimes requiring a passport). Compare options and check that your phone is unlocked and ` +
    `eSIM-compatible before you go.`
  );
}
