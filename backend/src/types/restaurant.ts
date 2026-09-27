export const RESTAURANT_CATEGORIES = [
  "restaurant",
  "cafe",
  "fastFood",
  "bar",
  "bakery",
  "other",
] as const;
export type RestaurantCategory = (typeof RESTAURANT_CATEGORIES)[number];

export interface Restaurant {
  /** Stable id, namespaced by provider so Geoapify/Overpass ids never collide. */
  id: string;
  name: string;
  description: string | null;
  category: RestaurantCategory;
  /**
   * Rough per-meal cost estimate in the trip's local currency units, or
   * `null` when we have no basis to estimate it. Neither Geoapify nor
   * Overpass exposes real menu pricing on their free tiers, so this is a
   * heuristic derived from the restaurant's category (see
   * `services/restaurants/estimateCost.ts`), not a live price.
   */
  estimatedCost: number | null;
  lat: number;
  lng: number;
}
