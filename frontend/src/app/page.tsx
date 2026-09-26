import { TripForm } from "@/components/TripForm";

/**
 * Trip Planner (Home). Collects origin, destination, budget, days, and
 * transport preference, validates client-side, then POSTs to
 * /api/trips and forwards to the Results tabs with the new trip's id.
 */
export default function TripPlannerPage(): JSX.Element {
  return (
    <section>
      <h1 className="text-2xl font-bold">Plan your trip</h1>
      <p className="mt-2 text-slate-600">
        Tell us where you&apos;re starting from, where you want to go, your
        budget, and how many days you have.
      </p>
      <TripForm />
    </section>
  );
}
