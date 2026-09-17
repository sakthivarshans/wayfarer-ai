import { Card } from "@/components/ui/Card";
import { TRANSPORT_MODE_LABELS, type TransportOption } from "./types";

export function TransportOptionCard({ option }: { option: TransportOption }) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-text-heading">{TRANSPORT_MODE_LABELS[option.mode]}</h3>
          <p className="mt-1 text-sm text-text-body">{option.provider}</p>
        </div>
        {option.recommended && (
          <span className="shrink-0 rounded-full bg-ink-100 px-2.5 py-1 text-xs font-medium text-ink-900">
            Your preference
          </span>
        )}
      </div>
      <a
        href={option.deepLink}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-ink-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-ink-950"
      >
        {option.label}
        <span aria-hidden>↗</span>
      </a>
    </Card>
  );
}
