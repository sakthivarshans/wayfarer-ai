import type { LocalTransportOption } from "../../types/gettingAround";
import { providersForCountry } from "./rideProviders";

/**
 * IMPORTANT: every function in this file takes only the *destination*.
 * Local transport is about getting around where you're going, so a trip
 * from Chennai to Paris must only ever produce Paris links. Keeping the
 * origin out of these signatures entirely (rather than remembering not to
 * pass it) makes mixing them up a compile error instead of a silent bug.
 */

function buildMapsSearch(query: string): string {
  const params = new URLSearchParams({ api: "1", query });
  return `https://www.google.com/maps/search/?${params.toString()}`;
}

function buildUberLink(destination: string): string {
  const params = new URLSearchParams({
    action: "setPickup",
    pickup: "my_location",
    "dropoff[formatted_address]": destination,
  });
  return `https://m.uber.com/ul/?${params.toString()}`;
}

// Ola, Bolt, and Grab have no stable public web deep link that takes a
// destination, so these open the provider's own site/app landing page.
const PROVIDER_LINKS: Record<string, { label: string; build: (destination: string) => string }> = {
  uber: { label: "Book a ride with Uber", build: buildUberLink },
  ola: { label: "Open Ola", build: () => "https://www.olacabs.com/" },
  bolt: { label: "Open Bolt", build: () => "https://bolt.eu/" },
  grab: { label: "Open Grab", build: () => "https://www.grab.com/" },
};

export function buildCabOptions(destination: string, countryCode: string | null): LocalTransportOption[] {
  const rideApps = providersForCountry(countryCode).map((provider): LocalTransportOption => {
    const link = PROVIDER_LINKS[provider.id];
    return {
      kind: "cab",
      provider: provider.name,
      label: link?.label ?? `Open ${provider.name}`,
      deepLink: link ? link.build(destination) : buildMapsSearch(`taxi in ${destination}`),
    };
  });

  // Always offered, so there's a working option even where no ride app in
  // our table is known to operate (or the country couldn't be determined).
  const fallback: LocalTransportOption = {
    kind: "cab",
    provider: "Google Maps",
    label: `Find taxis in ${destination}`,
    deepLink: buildMapsSearch(`taxi in ${destination}`),
  };

  return [...rideApps, fallback];
}

export function buildTransitOptions(destination: string): LocalTransportOption[] {
  // No `origin` param: Google Maps then starts from the traveler's current
  // location, which is exactly what "getting around once I've arrived" means.
  const directions = new URLSearchParams({
    api: "1",
    destination,
    travelmode: "transit",
  });

  return [
    {
      kind: "transit",
      provider: "Google Maps",
      label: `Transit directions in ${destination}`,
      deepLink: `https://www.google.com/maps/dir/?${directions.toString()}`,
    },
    {
      kind: "transit",
      provider: "Google Maps",
      label: "Find nearby stops & stations",
      deepLink: buildMapsSearch(`public transport stops in ${destination}`),
    },
  ];
}
