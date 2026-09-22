"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { PlaceCard } from "@/features/places/PlaceCard";
import { usePlaces } from "@/features/places/usePlaces";
import { useMascotNudge } from "@/components/mascot/MascotNudgeContext";

export default function TripPlacesResultsPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const { places, loading, error } = usePlaces(tripId);
  const { sendNudge } = useMascotNudge();

  useEffect(() => {
    if (!loading && !error && places.length === 0) {
      sendNudge("No matches nearby — try a bigger city close by, or double-check the spelling.");
    }
    // sendNudge is stable (useCallback in the provider); only re-run when
    // the actual result set changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, error, places.length]);

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
        <h2 className="font-display text-xl font-medium text-text-heading">No places found</h2>
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
