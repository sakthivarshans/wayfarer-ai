"use client";

import { useParams } from "next/navigation";
import { PageLoading } from "@/components/ui/PageLoading";
import { ErrorState } from "@/components/ui/ErrorState";
import { LocalTransportCard } from "@/features/gettingAround/LocalTransportCard";
import { useGettingAround } from "@/features/gettingAround/useGettingAround";

export default function TripGettingAroundResultsPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const { gettingAround, loading, error } = useGettingAround(tripId);

  if (loading) {
    return (
      <div className="flex justify-center pt-10">
        <PageLoading />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (!gettingAround) {
    return null;
  }

  return (
    <div className="space-y-8">
      <p className="text-xs font-medium text-text-muted">
        Local transport in {gettingAround.destination} — for getting around once you&apos;ve arrived. Ride apps
        listed are commonly available there; check the app for current coverage.
      </p>

      <section>
        <h2 className="mb-3 font-display text-lg font-medium text-text-heading">Cabs &amp; ride apps</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {gettingAround.cabs.map((option) => (
            <LocalTransportCard key={`${option.provider}-${option.label}`} option={option} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-display text-lg font-medium text-text-heading">Public transit</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {gettingAround.transit.map((option) => (
            <LocalTransportCard key={`${option.provider}-${option.label}`} option={option} />
          ))}
        </div>
      </section>
    </div>
  );
}
