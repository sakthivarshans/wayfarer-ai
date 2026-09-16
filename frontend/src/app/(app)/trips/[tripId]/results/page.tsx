import { redirect } from "next/navigation";

export default function TripResultsIndexPage({ params }: { params: { tripId: string } }) {
  redirect(`/trips/${params.tripId}/results/places`);
}
