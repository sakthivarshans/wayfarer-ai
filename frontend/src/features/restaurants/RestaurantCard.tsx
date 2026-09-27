import { Card } from "@/components/ui/Card";
import { RESTAURANT_CATEGORY_LABELS, type Restaurant } from "./types";
import { RestaurantPhoto } from "./RestaurantPhoto";

// Alternate the two badge tints DESIGN.md defines (`ink.100` / `sky.100`)
// across categories, matching PlaceCard's convention.
const CATEGORY_BADGE_CLASSES: Record<Restaurant["category"], string> = {
  restaurant: "bg-ink-100 text-ink-900",
  cafe: "bg-sky-100 text-ink-900",
  fastFood: "bg-ink-100 text-ink-900",
  bar: "bg-sky-100 text-ink-900",
  bakery: "bg-ink-100 text-ink-900",
  other: "bg-sky-100 text-ink-900",
};

function formatCost(estimatedCost: number | null): string {
  if (estimatedCost === null) {
    return "Cost unknown";
  }
  if (estimatedCost === 0) {
    return "Free";
  }
  return `~${estimatedCost.toLocaleString()} est. per meal`;
}

export function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  return (
    <Card padded={false} className="overflow-hidden">
      <RestaurantPhoto restaurantId={restaurant.id} name={restaurant.name} category={restaurant.category} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-sm font-semibold text-text-heading">{restaurant.name}</h3>
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${CATEGORY_BADGE_CLASSES[restaurant.category]}`}
          >
            {RESTAURANT_CATEGORY_LABELS[restaurant.category]}
          </span>
        </div>
        {restaurant.description && <p className="mt-2 text-sm text-text-body">{restaurant.description}</p>}
        <p className="mt-3 text-xs font-medium text-text-muted">{formatCost(restaurant.estimatedCost)}</p>
      </div>
    </Card>
  );
}
