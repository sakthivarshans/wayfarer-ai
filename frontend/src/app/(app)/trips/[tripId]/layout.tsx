"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { CalendarDays, Compass } from "lucide-react";
import { PageLoading } from "@/components/ui/PageLoading";
import { Card } from "@/components/ui/Card";
import { TripProvider, useTrip } from "@/features/trips/TripContext";
import { TRANSPORT_MODE_LABELS } from "@/features/trips/types";

const tabs = [
  { match: "results", href: (id: string) => `/trips/${id}/results/places`, label: "Results", icon: Compass },
  { match: "itinerary", href: (id: string) => `/trips/${id}/itinerary`, label: "Itinerary", icon: CalendarDays },
];

function TripShell({ tripId, children }: { tripId: string; children: ReactNode }) {
  const { trip, loading, error } = useTrip();
  const pathname = usePathname();

  if (loading) {
    return (
      <div className="flex pt-10">
        <PageLoading />
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="pt-2">
        <Card>
          <p className="text-sm text-status-danger">{error ?? "Trip not found."}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="pt-2">
      <Card className="mb-6">
        <p className="font-display text-xl font-medium text-text-heading">
          {trip.origin} <span className="text-text-muted">→</span> {trip.destination}
        </p>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-text-body">
          <span>{trip.days} days</span>
          <span>Budget {trip.budget.toLocaleString()}</span>
          <span>{TRANSPORT_MODE_LABELS[trip.transportModePreference]}</span>
        </div>
      </Card>

      <div className="mb-6 flex w-fit gap-1 rounded-full bg-surface-card p-1 shadow-card">
        {tabs.map((tab) => {
          const active = pathname.includes(`/${tab.match}`);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.match}
              href={tab.href(tripId)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                active ? "bg-ink-900 text-white" : "text-text-body hover:text-ink-700"
              }`}
            >
              <Icon className="h-4 w-4" strokeWidth={2} />
              {tab.label}
            </Link>
          );
        })}
      </div>

      {children}
    </div>
  );
}

export default function TripLayout({ children }: { children: ReactNode }) {
  const params = useParams<{ tripId: string }>();
  const tripId = params.tripId;

  return (
    <TripProvider tripId={tripId}>
      <TripShell tripId={tripId}>{children}</TripShell>
    </TripProvider>
  );
}
