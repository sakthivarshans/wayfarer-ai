import { Card } from "@/components/ui/Card";
import { PLACE_CATEGORY_LABELS, type Place } from "./types";

// Alternate the two badge tints DESIGN.md defines (`ink.100` / `sky.100`)
// across categories, rather than introducing new colors.
const CATEGORY_BADGE_CLASSES: Record<Place["category"], string> = {
  sights: "bg-ink-100 text-ink-900",
  nature: "bg-sky-100 text-ink-900",
  religion: "bg-ink-100 text-ink-900",
  museum: "bg-sky-100 text-ink-900",
  entertainment: "bg-ink-100 text-ink-900",
  other: "bg-sky-100 text-ink-900",
};

function formatCost(estimatedCost: number | null): string {
  if (estimatedCost === null) {
    return "Cost unknown";
  }
  if (estimatedCost === 0) {
    return "Free";
  }
  return `~${estimatedCost.toLocaleString()} est.`;
}

export function PlaceCard({ place }: { place: Place }) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold text-text-heading">{place.name}</h3>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${CATEGORY_BADGE_CLASSES[place.category]}`}
        >
          {PLACE_CATEGORY_LABELS[place.category]}
        </span>
      </div>
      {place.description && <p className="mt-2 text-sm text-text-body">{place.description}</p>}
      <p className="mt-3 text-xs font-medium text-text-muted">{formatCost(place.estimatedCost)}</p>
    </Card>
  );
}
