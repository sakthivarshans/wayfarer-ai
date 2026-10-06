"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import type { LocalGuide } from "./types";

export function LocalGuideList({
  guides,
  onEdit,
  onDelete,
}: {
  guides: LocalGuide[];
  onEdit: (guide: LocalGuide) => void;
  onDelete: (guideId: string) => Promise<void>;
}) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(guideId: string): Promise<void> {
    setDeletingId(guideId);
    try {
      await onDelete(guideId);
    } finally {
      setDeletingId(null);
    }
  }

  if (guides.length === 0) {
    return (
      <Card>
        <p className="text-sm text-text-muted">No local guides yet — add one above.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {guides.map((guide) => (
        <Card key={guide.id}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h4 className="font-display text-base font-medium text-text-heading">{guide.name}</h4>
              <p className="text-xs text-text-muted">
                {guide.destination} · {guide.specialty}
              </p>
              <p className="mt-1 text-xs text-text-muted">{guide.languages.join(", ")}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => onEdit(guide)}
                className="rounded-full border border-surface-border px-3 py-1.5 text-xs font-medium text-text-body transition-colors hover:border-ink-700 hover:text-ink-700"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => void handleDelete(guide.id)}
                disabled={deletingId === guide.id}
                className="rounded-full border border-surface-border px-3 py-1.5 text-xs font-medium text-status-danger transition-colors hover:border-status-danger disabled:opacity-60"
              >
                {deletingId === guide.id ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
