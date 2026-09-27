import type { RestaurantCategory } from "../../types/restaurant";

/**
 * Neither Geoapify nor OSM Overpass expose real menu prices on their free
 * tiers, so we fall back to a per-category rough estimate. This is
 * intentionally coarse — it exists so the budget-aware ranking in
 * `rankRestaurants.ts` has *something* to sort on, not to promise an
 * accurate price. `null` means "no basis to estimate," which the ranker
 * treats as free/unknown rather than expensive.
 */
const CATEGORY_COST_ESTIMATE: Record<RestaurantCategory, number | null> = {
  bakery: 100,
  fastFood: 150,
  cafe: 200,
  restaurant: 500,
  bar: 400,
  other: null,
};

export function estimateCostForCategory(category: RestaurantCategory): number | null {
  return CATEGORY_COST_ESTIMATE[category];
}
