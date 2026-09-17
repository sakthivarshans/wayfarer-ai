import { Card } from "@/components/ui/Card";
import type { HotelOption } from "./types";

export function HotelOptionCard({ option }: { option: HotelOption }) {
  return (
    <Card>
      <h3 className="text-sm font-semibold text-text-heading">{option.provider}</h3>
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
