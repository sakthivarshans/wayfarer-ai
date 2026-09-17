"use client";

import { useParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { PlaceCard } from "@/features/places/PlaceCard";
import { usePlaces } from "@/features/places/usePlaces";

export default function TripPlacesResultsPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const { places, loading, error } = usePlaces(tripId);

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

  if (places.length === 0) {
    return (
      <Card>
        <h2 className="text-base font-semibold text-text-heading">No places found</h2>
        <p className="mt-2 max-w-md text-sm text-text-body">
          We couldn&apos;t find any attractions near this destination. Try a nearby city or double-check the
          spelling.
        </p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {places.map((place) => (
        <PlaceCard key={place.id} place={place} />
      ))}
    </div>
  );
}
