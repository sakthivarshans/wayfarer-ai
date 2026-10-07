"use client";

import { useParams } from "next/navigation";
import { PageLoading } from "@/components/ui/PageLoading";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { LocalGuideProfileCard } from "@/features/localGuides/LocalGuideProfileCard";
import { useLocalGuides } from "@/features/localGuides/useLocalGuides";

export default function TripLocalGuidesResultsPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const { guides, loading, error } = useLocalGuides(tripId);

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

  if (guides.length === 0) {
    return (
      <Card>
        <h2 className="font-display text-xl font-medium text-text-heading">No local guides listed yet</h2>
        <p className="mt-2 max-w-md text-sm text-text-body">
          We don&apos;t have a curated guide for this destination yet. Established platforms like ToursByLocals,
          Viator, and Airbnb Experiences are a good place to look in the meantime.
        </p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {guides.map((guide) => (
        <LocalGuideProfileCard key={guide.id} guide={guide} />
      ))}
    </div>
  );
}
