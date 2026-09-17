export const PLACE_CATEGORIES = [
  "sights",
  "museum",
  "nature",
  "religion",
  "entertainment",
  "other",
] as const;
export type PlaceCategory = (typeof PLACE_CATEGORIES)[number];

export interface Place {
  /** Stable id, namespaced by provider so Geoapify/Overpass ids never collide. */
  id: string;
  name: string;
  description: string | null;
  category: PlaceCategory;
  /**
   * Rough per-visit cost estimate in the trip's local currency units, or
   * `null` when we have no basis to estimate it. Neither Geoapify nor
   * Overpass exposes real pricing on their free tiers, so this is a
   * heuristic derived from the place's category (see
   * `services/places/estimateCost.ts`), not a live price.
   */
  estimatedCost: number | null;
  lat: number;
  lng: number;
}

export interface GeoPoint {
  lat: number;
  lng: number;
}
