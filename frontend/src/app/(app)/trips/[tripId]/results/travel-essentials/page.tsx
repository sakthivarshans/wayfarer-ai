"use client";

import { useParams } from "next/navigation";
import { PageLoading } from "@/components/ui/PageLoading";
import { ErrorState } from "@/components/ui/ErrorState";
import { ConnectivityCard } from "@/features/travelEssentials/ConnectivityCard";
import { PassportPicker } from "@/features/travelEssentials/PassportPicker";
import { VisaSummaryCard } from "@/features/travelEssentials/VisaSummaryCard";
import { useTravelEssentials } from "@/features/travelEssentials/useTravelEssentials";

export default function TripTravelEssentialsResultsPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const { travelEssentials, loading, error, setPassport } = useTravelEssentials(tripId);

  if (loading && !travelEssentials) {
    return (
      <div className="flex justify-center pt-10">
        <PageLoading />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (!travelEssentials) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-medium text-text-muted">
          For {travelEssentials.destination.countryName ?? travelEssentials.destination.name}
        </p>
        <PassportPicker
          options={travelEssentials.passportOptions}
          value={travelEssentials.passport.countryCode}
          onChange={setPassport}
        />
      </div>

      <VisaSummaryCard visa={travelEssentials.visa} passportName={travelEssentials.passport.countryName} />
      <ConnectivityCard connectivity={travelEssentials.connectivity} />

      <p className="text-xs text-text-muted">{travelEssentials.disclaimer}</p>
    </div>
  );
}
