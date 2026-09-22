import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { TRANSPORT_MODE_LABELS, type Trip } from "./types";

export function TripCard({ trip }: { trip: Trip }) {
  const created = new Date(trip.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <Link href={`/trips/${trip.id}`}>
      <Card className="border-l-4 border-ink-700 transition-shadow hover:shadow-lg">
        <p className="font-display text-lg font-medium text-text-heading">
          {trip.origin} <span className="text-text-muted">→</span> {trip.destination}
        </p>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-text-body">
          <span>{trip.days} days</span>
          <span>Budget {trip.budget.toLocaleString()}</span>
          <span>{TRANSPORT_MODE_LABELS[trip.transportModePreference]}</span>
        </div>
        <p className="mt-2 text-xs text-text-muted">Planned {created}</p>
      </Card>
    </Link>
  );
}
