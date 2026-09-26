/**
 * Itinerary shell. The real day-by-day timeline (combining places +
 * transport + hotel) is built in Phase 5.
 */
export default function ItineraryPage(): JSX.Element {
  return (
    <section>
      <h1 className="text-2xl font-bold">Itinerary</h1>
      <p className="mt-2 text-slate-600">
        Your day-by-day plan will appear here once places, transport, and
        hotels have been chosen.
      </p>
    </section>
  );
}
