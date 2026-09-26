interface ResultsPlaceholderProps {
  tabName: string;
}

/**
 * Shared "no data yet" placeholder shown by each Results sub-tab until its
 * real data-fetching phase is built (Places: Phase 2, Transport: Phase 3,
 * Hotels: Phase 4). Includes a lightweight loading-skeleton look so the
 * real cards can drop in later without a layout shift.
 */
export function ResultsPlaceholder({
  tabName,
}: ResultsPlaceholderProps): JSX.Element {
  return (
    <div>
      <div className="space-y-3" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-lg bg-slate-200"
          />
        ))}
      </div>
      <p className="mt-4 text-sm text-slate-500">
        No {tabName.toLowerCase()} data yet — this tab will populate once its
        backend phase is built.
      </p>
    </div>
  );
}
