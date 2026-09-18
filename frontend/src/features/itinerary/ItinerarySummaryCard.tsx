import { Card } from "@/components/ui/Card";
import { TRANSPORT_MODE_LABELS } from "@/features/transport/types";
import type { Itinerary } from "./types";

export function ItinerarySummaryCard({ itinerary }: { itinerary: Itinerary }) {
  return (
    <Card>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium text-text-muted">Getting there</p>
          <p className="mt-1 text-sm font-semibold text-text-heading">
            {TRANSPORT_MODE_LABELS[itinerary.transport.mode]} · {itinerary.transport.provider}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-text-muted">Staying at</p>
          <p className="mt-1 text-sm font-semibold text-text-heading">{itinerary.hotel.provider}</p>
        </div>
        <div className="flex gap-2">
          <a
            href={itinerary.transport.deepLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-surface-border px-4 py-2 text-sm font-medium text-ink-900 transition-colors hover:bg-ink-100"
          >
            {itinerary.transport.label}
            <span aria-hidden>↗</span>
          </a>
          <a
            href={itinerary.hotel.deepLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-surface-border px-4 py-2 text-sm font-medium text-ink-900 transition-colors hover:bg-ink-100"
          >
            {itinerary.hotel.label}
            <span aria-hidden>↗</span>
          </a>
        </div>
      </div>
    </Card>
  );
}
