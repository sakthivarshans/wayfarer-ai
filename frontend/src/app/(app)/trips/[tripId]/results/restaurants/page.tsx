"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { PageLoading } from "@/components/ui/PageLoading";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { RestaurantCard } from "@/features/restaurants/RestaurantCard";
import { useRestaurants } from "@/features/restaurants/useRestaurants";
import { useMascotNudge } from "@/components/mascot/MascotNudgeContext";

export default function TripRestaurantsResultsPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const { restaurants, loading, error } = useRestaurants(tripId);
  const { sendNudge } = useMascotNudge();

  useEffect(() => {
    if (!loading && !error && restaurants.length === 0) {
      sendNudge("No restaurants nearby — try a bigger city close by, or double-check the spelling.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, error, restaurants.length]);

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

  if (restaurants.length === 0) {
    return (
      <Card>
        <h2 className="font-display text-xl font-medium text-text-heading">No restaurants found</h2>
        <p className="mt-2 max-w-md text-sm text-text-body">
          We couldn&apos;t find anywhere to eat near this destination. Try a nearby city or double-check the
          spelling.
        </p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {restaurants.map((restaurant) => (
        <RestaurantCard key={restaurant.id} restaurant={restaurant} />
      ))}
    </div>
  );
}
