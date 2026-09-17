import type { PlaceCategory } from "../../types/place";

/**
 * Neither Geoapify nor OSM Overpass expose real entry prices on their free
 * tiers, so we fall back to a per-category rough estimate. This is
 * intentionally coarse — it exists so the budget-aware ranking in
 * `rankPlaces.ts` has *something* to sort on, not to promise an accurate
 * price. `null` means "no basis to estimate," which the ranker treats as
 * free/unknown rather than expensive.
 */
const CATEGORY_COST_ESTIMATE: Record<PlaceCategory, number | null> = {
  sights: 0,
  nature: 0,
  religion: 0,
  museum: 300,
  entertainment: 500,
  other: null,
};

export function estimateCostForCategory(category: PlaceCategory): number | null {
  return CATEGORY_COST_ESTIMATE[category];
}
