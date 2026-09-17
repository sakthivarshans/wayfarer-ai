import { withRetry } from "../../utils/retry";
import { estimateCostForCategory } from "./estimateCost";
import type { GeoPoint, Place, PlaceCategory } from "../../types/place";

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const SEARCH_RADIUS_METERS = 8000;
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
      node["tourism"](${around});
      way["tourism"](${around});
      node["historic"](${around});
      node["leisure"="park"](${around});
      way["leisure"="park"](${around});
      node["natural"~"^(beach|peak|volcano|water)$"](${around});
    );
    out center ${RESULT_LIMIT};
  `.trim();
}

function mapCategory(tags: Record<string, string>): PlaceCategory {
  if (tags.tourism === "museum") return "museum";
  if (tags.leisure === "park" || tags.natural) return "nature";
  if (tags.tourism === "attraction" || tags.tourism === "viewpoint" || tags.historic) return "sights";
  if (tags.tourism === "theme_park" || tags.tourism === "zoo" || tags.tourism === "aquarium") {
    return "entertainment";
  }
  if (tags.tourism) return "sights";
  return "other";
}

function toPlace(element: OverpassElement): Place | null {
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
    description: tags.description ?? tags["tourism"] ?? null,
    category,
    estimatedCost: estimateCostForCategory(category),
    lat,
    lng,
  };
}

/**
 * Fetches nearby points of interest from OSM's Overpass API. Fully free, no
 * API key — used when Geoapify isn't configured or its call fails.
 */
export async function fetchOverpassPlaces(center: GeoPoint): Promise<Place[]> {
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

  return data.elements.map(toPlace).filter((place): place is Place => place !== null);
}
