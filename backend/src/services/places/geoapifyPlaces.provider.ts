import { withRetry } from "../../utils/retry";
import { estimateCostForCategory } from "./estimateCost";
import type { GeoPoint, Place, PlaceCategory } from "../../types/place";

const GEOAPIFY_URL = "https://api.geoapify.com/v2/places";
const SEARCH_RADIUS_METERS = 8000;
const RESULT_LIMIT = 30;

// Broad category set covering everything we want to surface as a "place to
// visit" — see https://apidocs.geoapify.com/docs/places/#categories
const CATEGORIES = "tourism,entertainment,natural,leisure.park,religion.place_of_worship";

interface GeoapifyFeature {
  properties: {
    place_id: string;
    name?: string;
    formatted?: string;
    categories?: string[];
    lat: number;
    lon: number;
  };
}

interface GeoapifyResponse {
  features: GeoapifyFeature[];
}

function isHttpError(status: number): Error & { status: number } {
  const err = new Error(`Geoapify request failed with status ${status}`) as Error & { status: number };
  err.status = status;
  return err;
}

function mapCategory(categories: string[] | undefined): PlaceCategory {
  const list = categories ?? [];
  if (list.some((c) => c.startsWith("entertainment.museum"))) return "museum";
  if (list.some((c) => c.startsWith("entertainment"))) return "entertainment";
  if (list.some((c) => c.startsWith("natural") || c.startsWith("leisure.park"))) return "nature";
  if (list.some((c) => c.startsWith("religion"))) return "religion";
  if (list.some((c) => c.startsWith("tourism"))) return "sights";
  return "other";
}

function toPlace(feature: GeoapifyFeature): Place | null {
  const { properties } = feature;
  const name = properties.name?.trim();
  if (!name) {
    // Skip unnamed features (e.g. a bare "place_of_worship" node with no
    // name tag) — not useful to show a user as a place to visit.
    return null;
  }

  const category = mapCategory(properties.categories);

  return {
    id: `geoapify-${properties.place_id}`,
    name,
    description: properties.formatted ?? null,
    category,
    estimatedCost: estimateCostForCategory(category),
    lat: properties.lat,
    lng: properties.lon,
  };
}

/**
 * Fetches nearby points of interest from Geoapify's Places API. Throws if
 * the request fails (including a 4xx/5xx after retries) so the caller
 * (`places.service.ts`) can fall back to Overpass.
 */
export async function fetchGeoapifyPlaces(center: GeoPoint, apiKey: string): Promise<Place[]> {
  const url =
    `${GEOAPIFY_URL}?categories=${CATEGORIES}` +
    `&filter=circle:${center.lng},${center.lat},${SEARCH_RADIUS_METERS}` +
    `&bias=proximity:${center.lng},${center.lat}` +
    `&limit=${RESULT_LIMIT}&apiKey=${apiKey}`;

  const data = await withRetry(
    async () => {
      const res = await fetch(url);
      if (!res.ok) {
        throw isHttpError(res.status);
      }
      return (await res.json()) as GeoapifyResponse;
    },
    { attempts: 3, baseDelayMs: 500 }
  );

  return data.features.map(toPlace).filter((place): place is Place => place !== null);
}
