/**
 * Curated, static ride-hailing coverage by country. There's no free live
 * API for "which ride apps operate here," so this is a conservative
 * best-effort table of well-known main markets — the UI frames these as
 * "commonly available, check the app," and a Google Maps taxi search is
 * always offered as a fallback for anywhere not listed.
 */
export interface RideProvider {
  id: string;
  name: string;
  countries: ReadonlySet<string>;
}

function codes(list: string): ReadonlySet<string> {
  return new Set(list.split(/\s+/).filter(Boolean));
}

export const RIDE_PROVIDERS: readonly RideProvider[] = [
  {
    id: "uber",
    name: "Uber",
    countries: codes(
      `US CA MX BR AR CL CO EC PE UY CR DO GT PA SV HN PY BO
       GB IE FR DE ES IT PT NL BE LU AT CH SE NO DK FI PL CZ SK RO HU BG GR HR RS SI EE LV LT TR CY IS MT
       IN JP KR AU NZ TW HK LK PK BD
       ZA EG MA KE NG GH TZ UG ZM ZW
       AE SA QA BH KW OM JO LB IL`
    ),
  },
  { id: "ola", name: "Ola", countries: codes("IN") },
  {
    id: "bolt",
    name: "Bolt",
    countries: codes(
      `EE LV LT PL FI SE NO DK GB IE DE FR ES PT CZ SK RO HU BG HR RS SI UA GE AZ
       ZA NG KE GH TZ UG ZM MA`
    ),
  },
  { id: "grab", name: "Grab", countries: codes("SG MY ID PH TH VN KH MM") },
];

export function providersForCountry(countryCode: string | null): RideProvider[] {
  if (!countryCode) {
    return [];
  }
  const code = countryCode.toUpperCase();
  return RIDE_PROVIDERS.filter((provider) => provider.countries.has(code));
}
