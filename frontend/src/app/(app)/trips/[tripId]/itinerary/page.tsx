"use client";

import { useParams } from "next/navigation";
import { PageLoading } from "@/components/ui/PageLoading";
import { Card } from "@/components/ui/Card";
import { ItineraryDayCard } from "@/features/itinerary/ItineraryDayCard";
import { ItinerarySummaryCard } from "@/features/itinerary/ItinerarySummaryCard";
import { useItinerary } from "@/features/itinerary/useItinerary";
import { useMascotNudge } from "@/components/mascot/MascotNudgeContext";

export default function TripItineraryPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const { itinerary, loading, error, generating, generateError, generate } = useItinerary(tripId);
  const { sendNudge } = useMascotNudge();

  async function handleGenerate() {
    await generate();
    sendNudge("Your itinerary is ready! Have a look through each day below. 🎉");
  }

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

  if (!itinerary) {
    return (
      <Card>
        <h2 className="font-display text-xl font-medium text-text-heading">Your day-by-day plan</h2>
        <p className="mt-2 max-w-md text-sm text-text-body">
          Generate an itinerary that combines your nearby places, transport, and hotel into a day-by-day plan.
        </p>
        {generateError && <p className="mt-3 text-sm text-status-danger">{generateError}</p>}
        <button
          type="button"
          onClick={() => void handleGenerate()}
          disabled={generating}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-ink-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-ink-950 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {generating && (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          )}
          {generating ? "Generating…" : "Generate itinerary"}
        </button>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <ItinerarySummaryCard itinerary={itinerary} />

      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-text-muted">
          Generated {new Date(itinerary.generatedAt).toLocaleString()}
        </p>
        <button
          type="button"
          onClick={() => void handleGenerate()}
          disabled={generating}
          className="inline-flex items-center gap-2 rounded-full border border-surface-border px-4 py-2 text-sm font-medium text-ink-900 transition-colors hover:bg-ink-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {generating && (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-ink-900 border-t-transparent" />
          )}
          {generating ? "Regenerating…" : "Regenerate"}
        </button>
      </div>
      {generateError && <p className="text-sm text-status-danger">{generateError}</p>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {itinerary.days.map((day) => (
          <ItineraryDayCard key={day.day} day={day} />
        ))}
      </div>
    </div>
  );
}
