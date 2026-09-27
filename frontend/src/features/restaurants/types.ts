export const RESTAURANT_CATEGORIES = ["restaurant", "cafe", "fastFood", "bar", "bakery", "other"] as const;
export type RestaurantCategory = (typeof RESTAURANT_CATEGORIES)[number];

export const RESTAURANT_CATEGORY_LABELS: Record<RestaurantCategory, string> = {
  restaurant: "Restaurant",
  cafe: "Cafe",
  fastFood: "Fast food",
  bar: "Bar",
  bakery: "Bakery",
  other: "Other",
};

export interface Restaurant {
  id: string;
  name: string;
  description: string | null;
  category: RestaurantCategory;
  /** Rough per-meal cost estimate, or null when there's no basis to estimate it. */
  estimatedCost: number | null;
  lat: number;
  lng: number;
}
