import { withRetry } from "../../utils/retry";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

// Nominatim's usage policy requires a descriptive User-Agent.
const USER_AGENT = "wayfarer-ai/1.0 (https://github.com/sakthivarshans/wayfarer-ai)";

interface NominatimResult {
  address?: { country_code?: string };
}

function isHttpError(status: number): Error & { status: number } {
  const err = new Error(`Nominatim request failed with status ${status}`) as Error & { status: number };
  err.status = status;
  return err;
}

/**
 * Resolves a destination name to an uppercase ISO 3166-1 alpha-2 country
 * code (e.g. "Paris" -> "FR"). Returns `null` when the lookup succeeds but
 * yields no country; throws if the request itself fails, so callers can
 * tell "we don't know" apart from "we couldn't ask" and avoid caching the
 * latter.
 */
export async function lookupCountryCode(destination: string): Promise<string | null> {
  const url = `${NOMINATIM_URL}?format=json&limit=1&addressdetails=1&q=${encodeURIComponent(destination)}`;

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

  const code = results[0]?.address?.country_code;
  return code ? code.toUpperCase() : null;
}
