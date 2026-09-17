"use client";

import { useParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { HotelOptionCard } from "@/features/hotels/HotelOptionCard";
import { useHotels } from "@/features/hotels/useHotels";

export default function TripHotelsResultsPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const { hotels, loading, error } = useHotels(tripId);

  if (loading) {
    return (
      <div className="flex justify-center pt-10">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink-500 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <p className="text-sm text-status-danger">{error}</p>
      </Card>
    );
  }

  if (!hotels) {
    return null;
  }

  return (
    <div className="space-y-4">
      <p className="text-xs font-medium text-text-muted">
        ~{hotels.perNightBudgetHint.toLocaleString()}/night if you split your budget evenly across the trip
        (a rough guide — pick lower nightly rates to leave room for transport and activities)
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {hotels.options.map((option) => (
          <HotelOptionCard key={option.provider} option={option} />
        ))}
      </div>
    </div>
  );
}
