"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { PageLoading } from "@/components/ui/PageLoading";
import { Card } from "@/components/ui/Card";
import { useTrips } from "@/features/trips/useTrips";

export default function ResultsRedirectPage() {
  const { trips, loading, error } = useTrips();
  const router = useRouter();

  useEffect(() => {
    const first = trips[0];
    if (!loading && !error && first) {
      router.replace(`/trips/${first.id}/results/places`);
    }
  }, [loading, error, trips, router]);

  if (loading || (!error && trips.length > 0)) {
    return (
      <div className="flex justify-center pt-10">
        <PageLoading />
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

  return (
    <div className="pt-2">
      <Card>
        <h2 className="text-base font-semibold text-text-heading">No results yet</h2>
        <p className="mt-2 max-w-md text-sm text-text-body">
          Plan a trip first, then its places, transport, and hotel results will show up here.
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
