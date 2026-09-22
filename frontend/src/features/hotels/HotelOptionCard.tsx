import { Hotel } from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { HotelOption } from "./types";

export function HotelOptionCard({ option }: { option: HotelOption }) {
  return (
    <Card>
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sand-100 text-sand-700">
          <Hotel className="h-5 w-5" strokeWidth={2} />
        </div>
        <h3 className="font-display text-base font-medium text-text-heading">{option.provider}</h3>
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
