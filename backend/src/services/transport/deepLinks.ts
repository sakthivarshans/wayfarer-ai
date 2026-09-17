import type { TransportModePreference } from "../../types/trip";
import type { TransportOption, TransportOptionMode } from "../../types/transport";

/**
 * Every link below is a plain URL to the provider's own search results —
 * no API key, no server-side call, no pricing data. This matches the
 * app's redirect-only booking model: we help the user compare *where* to
 * look, the provider's site handles dates, pricing, and the actual
 * booking.
 */
function buildFlightDeepLink(origin: string, destination: string): string {
  const query = `Flights from ${origin} to ${destination}`;
  return `https://www.google.com/travel/flights?q=${encodeURIComponent(query)}`;
}

function buildTrainDeepLink(origin: string, destination: string): string {
  // Google Maps' public "transit" travel mode covers rail options in most
  // regions with transit data, without needing a rail-specific API.
  const params = new URLSearchParams({
    api: "1",
    origin,
    destination,
    travelmode: "transit",
  });
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

function buildBusDeepLink(origin: string, destination: string): string {
  // Rome2Rio is a free, keyless aggregator covering bus (and other
  // surface-transport) routes globally, which no single regional bus
  // operator's site does.
  return `https://www.rome2rio.com/s/${encodeURIComponent(origin)}/${encodeURIComponent(destination)}`;
}

const DEEP_LINK_BUILDERS: Record<
  TransportOptionMode,
  { provider: string; label: string; build: (origin: string, destination: string) => string }
> = {
  flight: { provider: "Google Flights", label: "Search flights", build: buildFlightDeepLink },
  train: { provider: "Google Maps", label: "Search trains & transit", build: buildTrainDeepLink },
  bus: { provider: "Rome2Rio", label: "Compare buses & trains", build: buildBusDeepLink },
};

const ALL_MODES: TransportOptionMode[] = ["flight", "train", "bus"];

/**
 * Builds one deep link per transport mode, with the trip's preferred mode
 * marked `recommended` and moved to the front. "any" leaves the default
 * flight → train → bus order with nothing marked recommended.
 */
export function buildTransportOptions(
  origin: string,
  destination: string,
  preference: TransportModePreference
): TransportOption[] {
  const options = ALL_MODES.map((mode) => {
    const { provider, label, build } = DEEP_LINK_BUILDERS[mode];
    return {
      mode,
      provider,
      label,
      deepLink: build(origin, destination),
      recommended: mode === preference,
    };
  });

  if (preference === "any") {
    return options;
  }

  return [...options].sort((a, b) => Number(b.recommended) - Number(a.recommended));
}
