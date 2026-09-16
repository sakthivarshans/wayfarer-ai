import { redirect } from "next/navigation";

export default function TripOverviewPage({ params }: { params: { tripId: string } }) {
  redirect(`/trips/${params.tripId}/results/places`);
}
