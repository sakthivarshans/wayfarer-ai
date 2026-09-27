import { withRetry } from "../../utils/retry";
import { estimateCostForCategory } from "./estimateCost";
import type { GeoPoint } from "../../types/place";
import type { Restaurant, RestaurantCategory } from "../../types/restaurant";

const GEOAPIFY_URL = "https://api.geoapify.com/v2/places";
const SEARCH_RADIUS_METERS = 5000;
const RESULT_LIMIT = 30;

// See https://apidocs.geoapify.com/docs/places/#categories — the "catering"
// tree covers everywhere you'd eat or drink.
const CATEGORIES =
  "catering.restaurant,catering.cafe,catering.fast_food,catering.bar,catering.pub,catering.biergarten,catering.bakery";

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

function mapCategory(categories: string[] | undefined): RestaurantCategory {
  const list = categories ?? [];
  if (list.some((c) => c.startsWith("catering.cafe"))) return "cafe";
  if (list.some((c) => c.startsWith("catering.fast_food"))) return "fastFood";
  if (list.some((c) => c.startsWith("catering.bakery"))) return "bakery";
  if (list.some((c) => c.startsWith("catering.bar") || c.startsWith("catering.pub") || c.startsWith("catering.biergarten"))) {
    return "bar";
  }
  if (list.some((c) => c.startsWith("catering.restaurant"))) return "restaurant";
  return "other";
}

function toRestaurant(feature: GeoapifyFeature): Restaurant | null {
  const { properties } = feature;
  const name = properties.name?.trim();
  if (!name) {
    // Skip unnamed features (e.g. a bare "catering.fast_food" node with no
    // name tag) — not useful to show a user as somewhere to eat.
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
 * Fetches nearby restaurants/cafes/bars from Geoapify's Places API. Throws
 * if the request fails (including a 4xx/5xx after retries) so the caller
 * (`restaurants.service.ts`) can fall back to Overpass.
 */
export async function fetchGeoapifyRestaurants(center: GeoPoint, apiKey: string): Promise<Restaurant[]> {
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

  return data.features.map(toRestaurant).filter((r): r is Restaurant => r !== null);
}
