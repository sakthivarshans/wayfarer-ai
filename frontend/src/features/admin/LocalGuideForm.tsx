"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Card } from "@/components/ui/Card";
import type { LocalGuide, LocalGuideInput } from "./types";

interface LocalGuideFormProps {
  /** When set, the form edits this guide instead of creating a new one. */
  editingGuide: LocalGuide | null;
  onCreate: (input: LocalGuideInput) => Promise<void>;
  onUpdate: (guideId: string, input: Partial<LocalGuideInput>) => Promise<void>;
  onCancelEdit: () => void;
}

const EMPTY_FORM = { name: "", destination: "", languages: "", specialty: "", bio: "", photoUrl: "", profileUrl: "" };

function toFormState(guide: LocalGuide) {
  return {
    name: guide.name,
    destination: guide.destination,
    languages: guide.languages.join(", "),
    specialty: guide.specialty,
    bio: guide.bio ?? "",
    photoUrl: guide.photoUrl ?? "",
    profileUrl: guide.profileUrl,
  };
}

export function LocalGuideForm({ editingGuide, onCreate, onUpdate, onCancelEdit }: LocalGuideFormProps) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setForm(editingGuide ? toFormState(editingGuide) : EMPTY_FORM);
    setError(null);
  }, [editingGuide]);

  function field<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);

    const languages = form.languages
      .split(",")
      .map((lang) => lang.trim())
      .filter(Boolean);

    if (!form.name.trim() || !form.destination.trim() || !form.specialty.trim() || !form.profileUrl.trim()) {
      setError("Name, destination, specialty, and profile URL are all required.");
      return;
    }
    if (languages.length === 0) {
      setError("At least one language is required.");
      return;
    }

    const input: LocalGuideInput = {
      name: form.name.trim(),
      destination: form.destination.trim(),
      languages,
      specialty: form.specialty.trim(),
      profileUrl: form.profileUrl.trim(),
      ...(form.bio.trim() && { bio: form.bio.trim() }),
      ...(form.photoUrl.trim() && { photoUrl: form.photoUrl.trim() }),
    };

    setSubmitting(true);
    try {
      if (editingGuide) {
        await onUpdate(editingGuide.id, input);
      } else {
        await onCreate(input);
        setForm(EMPTY_FORM);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <h3 className="font-display text-lg font-medium text-text-heading">
        {editingGuide ? `Edit ${editingGuide.name}` : "Add a local guide"}
      </h3>

      <form onSubmit={handleSubmit} className="mt-4 grid gap-3 sm:grid-cols-2">
        <input
          value={form.name}
          onChange={(e) => field("name", e.target.value)}
          placeholder="Name"
          className="rounded-lg border border-surface-border px-3 py-2 text-sm"
        />
        <input
          value={form.destination}
          onChange={(e) => field("destination", e.target.value)}
          placeholder="Destination (e.g. Marrakech)"
          className="rounded-lg border border-surface-border px-3 py-2 text-sm"
        />
        <input
          value={form.languages}
          onChange={(e) => field("languages", e.target.value)}
          placeholder="Languages, comma separated"
          className="rounded-lg border border-surface-border px-3 py-2 text-sm"
        />
        <input
          value={form.specialty}
          onChange={(e) => field("specialty", e.target.value)}
          placeholder="Specialty (e.g. Medina food tours)"
          className="rounded-lg border border-surface-border px-3 py-2 text-sm"
        />
        <input
          value={form.photoUrl}
          onChange={(e) => field("photoUrl", e.target.value)}
          placeholder="Photo URL (optional)"
          className="rounded-lg border border-surface-border px-3 py-2 text-sm sm:col-span-2"
        />
        <input
          value={form.profileUrl}
          onChange={(e) => field("profileUrl", e.target.value)}
          placeholder="Profile URL (ToursByLocals / Viator / Airbnb Experiences)"
          className="rounded-lg border border-surface-border px-3 py-2 text-sm sm:col-span-2"
        />
        <textarea
          value={form.bio}
          onChange={(e) => field("bio", e.target.value)}
          placeholder="Short bio (optional)"
          rows={2}
          className="rounded-lg border border-surface-border px-3 py-2 text-sm sm:col-span-2"
        />

        {error && <p className="text-sm text-status-danger sm:col-span-2">{error}</p>}

        <div className="flex gap-2 sm:col-span-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-ink-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-ink-950 disabled:opacity-60"
          >
            {submitting ? "Saving…" : editingGuide ? "Save changes" : "Add guide"}
          </button>
          {editingGuide && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="rounded-full border border-surface-border px-4 py-2 text-sm font-medium text-text-body"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </Card>
  );
}
