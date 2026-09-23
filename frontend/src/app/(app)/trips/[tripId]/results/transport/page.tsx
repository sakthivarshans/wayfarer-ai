"use client";

import { useParams } from "next/navigation";
import { PageLoading } from "@/components/ui/PageLoading";
import { Card } from "@/components/ui/Card";
import { TransportOptionCard } from "@/features/transport/TransportOptionCard";
import { useTransport } from "@/features/transport/useTransport";

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  return `${hours}h ${mins}m`;
}

export default function TripTransportResultsPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const { transport, loading, error } = useTransport(tripId);

  if (loading) {
    return (
      <div className="flex justify-center pt-10">
        <PageLoading />
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

  if (!transport) {
    return null;
  }

  return (
    <div className="space-y-4">
      {transport.distanceKm !== null && transport.drivingDurationMinutes !== null && (
        <p className="text-xs font-medium text-text-muted">
          ~{transport.distanceKm} km by road · ~{formatDuration(transport.drivingDurationMinutes)} driving
          (estimate, for context only — actual travel time varies by mode)
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {transport.options.map((option) => (
          <TransportOptionCard key={option.mode} option={option} />
        ))}
      </div>
    </div>
  );
}
