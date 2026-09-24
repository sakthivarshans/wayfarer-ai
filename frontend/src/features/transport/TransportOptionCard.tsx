import { Bus, Plane, TrainFront } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { TRANSPORT_MODE_LABELS, type TransportOption, type TransportOptionMode } from "./types";

const MODE_ICON: Record<TransportOptionMode, typeof Plane> = {
  flight: Plane,
  train: TrainFront,
  bus: Bus,
};

export function TransportOptionCard({ option }: { option: TransportOption }) {
  const Icon = MODE_ICON[option.mode];

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sand-100 text-sand-800">
            <Icon className="h-5 w-5" strokeWidth={2} />
          </div>
          <div>
            <h3 className="font-display text-base font-medium text-text-heading">
              {TRANSPORT_MODE_LABELS[option.mode]}
            </h3>
            <p className="mt-0.5 text-sm text-text-body">{option.provider}</p>
          </div>
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
