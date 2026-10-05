import { Wifi } from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { ConnectivitySection } from "./types";

export function ConnectivityCard({ connectivity }: { connectivity: ConnectivitySection }) {
  return (
    <Card>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-100 text-ink-900">
          <Wifi className="h-5 w-5" strokeWidth={2} />
        </div>
        <h3 className="font-display text-lg font-medium text-text-heading">SIM &amp; eSIM</h3>
      </div>

      <p className="mt-4 text-sm text-text-body">{connectivity.summary}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {connectivity.esimOptions.map((option) => (
          <a
            key={option.provider}
            href={option.deepLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-ink-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-ink-950"
          >
            {option.label}
            <span aria-hidden>↗</span>
          </a>
        ))}
      </div>
    </Card>
  );
}
