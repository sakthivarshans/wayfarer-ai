import { withRetry } from "../../utils/retry";
import { ApiError } from "../../utils/apiError";
import type { GeoPoint } from "../../types/place";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

// Nominatim's usage policy requires a descriptive User-Agent identifying the
// application; requests without one are liable to be blocked.
const USER_AGENT = "wayfarer-ai/1.0 (https://github.com/sakthivarshans/wayfarer-ai)";

interface NominatimResult {
  lat: string;
  lon: string;
}

function isHttpError(status: number): Error & { status: number } {
  const err = new Error(`Nominatim request failed with status ${status}`) as Error & { status: number };
  err.status = status;
  return err;
}

/**
 * Resolves a free-text place name (e.g. "Goa", "Kyoto, Japan") to
 * coordinates. Used to turn a trip's `destination` into a center point for
 * the places providers below.
 */
export async function geocodeDestination(destination: string): Promise<GeoPoint> {
  const url = `${NOMINATIM_URL}?format=json&limit=1&q=${encodeURIComponent(destination)}`;

  const results = await withRetry(
    async () => {
      const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
      if (!res.ok) {
        throw isHttpError(res.status);
      }
      return (await res.json()) as NominatimResult[];
    },
    { attempts: 3, baseDelayMs: 500 }
  );

  const first = results[0];
  if (!first) {
    throw ApiError.badRequest(`Couldn't find a location matching "${destination}"`);
  }

  return { lat: Number(first.lat), lng: Number(first.lon) };
}
