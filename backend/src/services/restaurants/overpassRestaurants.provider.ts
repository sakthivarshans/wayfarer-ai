import { withRetry } from "../../utils/retry";
import { estimateCostForCategory } from "./estimateCost";
import type { GeoPoint } from "../../types/place";
import type { Restaurant, RestaurantCategory } from "../../types/restaurant";

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const SEARCH_RADIUS_METERS = 5000;
const RESULT_LIMIT = 40;

interface OverpassElement {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

interface OverpassResponse {
  elements: OverpassElement[];
}

function isHttpError(status: number): Error & { status: number } {
  const err = new Error(`Overpass request failed with status ${status}`) as Error & { status: number };
  err.status = status;
  return err;
}

function buildQuery(center: GeoPoint): string {
  const around = `around:${SEARCH_RADIUS_METERS},${center.lat},${center.lng}`;
  return `
    [out:json][timeout:25];
    (
      node["amenity"~"^(restaurant|cafe|fast_food|bar|pub|biergarten)$"](${around});
      way["amenity"~"^(restaurant|cafe|fast_food|bar|pub|biergarten)$"](${around});
      node["shop"="bakery"](${around});
    );
    out center ${RESULT_LIMIT};
  `.trim();
}

function mapCategory(tags: Record<string, string>): RestaurantCategory {
  if (tags.shop === "bakery") return "bakery";
  if (tags.amenity === "cafe") return "cafe";
  if (tags.amenity === "fast_food") return "fastFood";
  if (tags.amenity === "bar" || tags.amenity === "pub" || tags.amenity === "biergarten") return "bar";
  if (tags.amenity === "restaurant") return "restaurant";
  return "other";
}

function toRestaurant(element: OverpassElement): Restaurant | null {
  const tags = element.tags ?? {};
  const name = tags.name?.trim();
  if (!name) {
    return null;
  }

  const lat = element.lat ?? element.center?.lat;
  const lng = element.lon ?? element.center?.lon;
  if (lat === undefined || lng === undefined) {
    return null;
  }

  const category = mapCategory(tags);

  return {
    id: `osm-${element.type}-${element.id}`,
    name,
    description: tags.cuisine ?? null,
    category,
    estimatedCost: estimateCostForCategory(category),
    lat,
    lng,
  };
}

/**
 * Fetches nearby restaurants/cafes/bars from OSM's Overpass API. Fully
 * free, no API key — used when Geoapify isn't configured or its call fails.
 */
export async function fetchOverpassRestaurants(center: GeoPoint): Promise<Restaurant[]> {
  const query = buildQuery(center);

  const data = await withRetry(
    async () => {
      const res = await fetch(OVERPASS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `data=${encodeURIComponent(query)}`,
      });
      if (!res.ok) {
        throw isHttpError(res.status);
      }
      return (await res.json()) as OverpassResponse;
    },
    { attempts: 3, baseDelayMs: 800 }
  );

  return data.elements.map(toRestaurant).filter((r): r is Restaurant => r !== null);
}
