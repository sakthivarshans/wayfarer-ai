import { AlertTriangle, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { VisaSection } from "./types";

const POSITIVE_STATUSES = new Set(["visa-free", "freedom-of-movement", "same-country"]);

export function VisaSummaryCard({ visa, passportName }: { visa: VisaSection; passportName: string | null }) {
  const isPositive = POSITIVE_STATUSES.has(visa.status);

  return (
    <Card>
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
            isPositive ? "bg-sky-100 text-ink-900" : "bg-sand-100 text-sand-800"
          }`}
        >
          <ShieldCheck className="h-5 w-5" strokeWidth={2} />
        </div>
        <div>
          <h3 className="font-display text-lg font-medium text-text-heading">{visa.headline}</h3>
          {passportName && <p className="text-xs text-text-muted">For {passportName} passport holders</p>}
        </div>
      </div>

      {visa.sourcesDisagree && (
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-sand-100 p-3 text-sm text-sand-900">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>Our sources disagree about this route — treat this as uncertain and check an official source.</span>
        </div>
      )}

      <p className="mt-4 text-sm text-text-body">{visa.summary}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {visa.officialLinks.map((link) => (
          <a
            key={link.url}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-surface-border px-3 py-1.5 text-xs font-medium text-text-heading transition-colors hover:bg-sand-50"
          >
            {link.label}
            <span aria-hidden>↗</span>
          </a>
        ))}
      </div>
    </Card>
  );
}
