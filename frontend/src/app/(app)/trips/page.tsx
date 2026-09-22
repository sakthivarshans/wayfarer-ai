"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { TripCard } from "@/features/trips/TripCard";
import { useTrips } from "@/features/trips/useTrips";
import { useMascotNudge } from "@/components/mascot/MascotNudgeContext";

export default function MyTripsPage() {
  const { trips, loading, error } = useTrips();
  const { sendNudge } = useMascotNudge();

  useEffect(() => {
    if (!loading && !error && trips.length === 0) {
      sendNudge("No trips yet — plan your first one and I'll help along the way!");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, error, trips.length]);

  if (loading) {
    return (
      <div className="flex justify-center pt-10">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink-500 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-2">
        <Card>
          <p className="text-sm text-status-danger">{error}</p>
        </Card>
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <div className="pt-2">
        <Card>
          <h2 className="font-display text-xl font-medium text-text-heading">No trips yet</h2>
          <p className="mt-2 max-w-md text-sm text-text-body">
            Plan your first trip and it&apos;ll show up here so you can revisit it any time.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block rounded-full bg-ink-900 px-4 py-2 text-sm font-medium text-white hover:bg-ink-950"
          >
            Plan a trip
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-4 pt-2 sm:grid-cols-2">
      {trips.map((trip) => (
        <TripCard key={trip.id} trip={trip} />
      ))}
    </div>
  );
}
