import type { Restaurant } from "../../types/restaurant";

const TARGET_RESTAURANTS_PER_DAY = 2;
const MAX_RESTAURANTS = 12;

/**
 * Ranks and trims a raw restaurant list down to a sensible number for the
 * trip's length, prioritizing cheap/casual options first when the per-day
 * budget is tight. Restaurants with no cost estimate (`null`) are treated
 * as free/unknown rather than expensive, so they aren't penalized for lack
 * of data. Mirrors `places/rankPlaces.ts`'s approach.
 */
export function rankAndTrimRestaurants(restaurants: Restaurant[], budget: number, days: number): Restaurant[] {
  const perDayBudget = budget / days;
  const isBudgetTight = perDayBudget < 1500;

  const sorted = [...restaurants].sort((a, b) => {
    const costA = a.estimatedCost ?? 0;
    const costB = b.estimatedCost ?? 0;

    if (isBudgetTight) {
      return costA - costB;
    }

    if (costA !== costB) {
      return costA - costB;
    }
    return 0;
  });

  const target = Math.min(
    MAX_RESTAURANTS,
    Math.max(days * TARGET_RESTAURANTS_PER_DAY, TARGET_RESTAURANTS_PER_DAY)
  );
  return sorted.slice(0, target);
}
