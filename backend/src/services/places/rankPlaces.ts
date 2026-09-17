import type { Place } from "../../types/place";

const TARGET_PLACES_PER_DAY = 3;
const MAX_PLACES = 15;

/**
 * Ranks and trims a raw place list down to a sensible number for the trip's
 * length, prioritizing free/cheap places first when the per-day budget is
 * tight. Places with no cost estimate (`null`) are treated as free/unknown
 * rather than expensive, so they aren't penalized for lack of data.
 */
export function rankAndTrimPlaces(places: Place[], budget: number, days: number): Place[] {
  const perDayBudget = budget / days;
  // Below this per-day budget we lean harder on free places; above it we
  // still prefer cheaper options but don't need to be as aggressive.
  const isBudgetTight = perDayBudget < 1500;

  const sorted = [...places].sort((a, b) => {
    const costA = a.estimatedCost ?? 0;
    const costB = b.estimatedCost ?? 0;

    if (isBudgetTight) {
      return costA - costB;
    }

    // Even with a comfortable budget, still break ties cheap-first so the
    // free "sights"/"nature" categories aren't buried behind museums that
    // merely happen to be earlier in the raw provider response.
    if (costA !== costB) {
      return costA - costB;
    }
    return 0;
  });

  const target = Math.min(MAX_PLACES, Math.max(days * TARGET_PLACES_PER_DAY, TARGET_PLACES_PER_DAY));
  return sorted.slice(0, target);
}
