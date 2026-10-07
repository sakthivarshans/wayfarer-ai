import { Languages } from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { LocalGuide } from "./types";

function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

export function LocalGuideProfileCard({ guide }: { guide: LocalGuide }) {
  return (
    <Card>
      <div className="flex items-start gap-4">
        {guide.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- admin-supplied, unpredictable-domain photo; not worth next/image's remote-pattern config
          <img
            src={guide.photoUrl}
            alt=""
            className="h-16 w-16 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-sand-100 text-lg font-semibold text-sand-800">
            {initialsFrom(guide.name)}
          </div>
        )}

        <div className="min-w-0">
          <h3 className="font-display text-base font-medium text-text-heading">{guide.name}</h3>
          <p className="text-xs text-text-muted">{guide.specialty}</p>
          <p className="mt-1 flex items-center gap-1 text-xs text-text-muted">
            <Languages className="h-3 w-3 shrink-0" />
            {guide.languages.join(", ")}
          </p>
        </div>
      </div>

      {guide.bio && <p className="mt-4 text-sm text-text-body">{guide.bio}</p>}

      <a
        href={guide.profileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-ink-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-ink-950"
      >
        View profile
        <span aria-hidden>↗</span>
      </a>
    </Card>
  );
}
