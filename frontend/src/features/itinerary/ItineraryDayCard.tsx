import { Card } from "@/components/ui/Card";
import { PlacePhoto } from "@/features/places/PlacePhoto";
import type { ItineraryActivity, ItineraryDay } from "./types";

// Small dot color per activity type, reusing DESIGN.md's ink/sky tints
// rather than introducing new colors.
const ACTIVITY_MARKER_CLASSES: Record<ItineraryActivity["type"], string> = {
  arrival: "bg-ink-500",
  checkin: "bg-ink-500",
  place: "bg-ink-700",
  free: "bg-sky-100 ring-1 ring-inset ring-ink-300",
  departure: "bg-ink-500",
};

function formatCost(estimatedCost: number | null | undefined): string | null {
  if (estimatedCost === null || estimatedCost === undefined) {
    return null;
  }
  return estimatedCost === 0 ? "Free" : `~${estimatedCost.toLocaleString()} est.`;
}

function ActivityRow({ activity }: { activity: ItineraryActivity }) {
  const cost = activity.type === "place" ? formatCost(activity.place?.estimatedCost) : null;

  return (
    <li className="flex items-start gap-3">
      <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${ACTIVITY_MARKER_CLASSES[activity.type]}`} />
      {activity.type === "place" && activity.place && (
        <div className="w-14 shrink-0">
          <PlacePhoto
            placeId={activity.place.id}
            name={activity.place.name}
            category={activity.place.category}
            showCaption={false}
            className="!rounded-lg"
          />
        </div>
      )}
      <div>
        <p className="text-sm font-medium text-text-heading">{activity.label}</p>
        {activity.type === "place" && activity.place?.description && (
          <p className="mt-0.5 text-xs text-text-body">{activity.place.description}</p>
        )}
        {cost && <p className="mt-0.5 text-xs text-text-muted">{cost}</p>}
      </div>
    </li>
  );
}

export function ItineraryDayCard({ day }: { day: ItineraryDay }) {
  return (
    <Card>
      <h3 className="text-sm font-semibold text-text-heading">Day {day.day}</h3>
      <ul className="mt-4 space-y-3">
        {day.activities.map((activity, index) => (
          <ActivityRow key={`${activity.type}-${index}`} activity={activity} />
        ))}
      </ul>
    </Card>
  );
}
