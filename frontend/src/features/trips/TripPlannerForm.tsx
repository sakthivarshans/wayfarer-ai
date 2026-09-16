"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/features/auth/AuthContext";
import { ApiClientError } from "@/lib/apiClient";
import { createTrip } from "./api";
import { TRANSPORT_MODE_LABELS, TRANSPORT_MODES, type TransportModePreference } from "./types";

export function TripPlannerForm() {
  const router = useRouter();
  const { getIdToken } = useAuth();

  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [budget, setBudget] = useState("");
  const [days, setDays] = useState("");
  const [transportModePreference, setTransportModePreference] = useState<TransportModePreference>("any");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const budgetNum = Number(budget);
    const daysNum = Number(days);

    if (!origin.trim() || !destination.trim()) {
      setError("Please fill in both an origin and a destination.");
      return;
    }
    if (!Number.isFinite(budgetNum) || budgetNum <= 0) {
      setError("Budget must be a number greater than 0.");
      return;
    }
    if (!Number.isInteger(daysNum) || daysNum <= 0) {
      setError("Days must be a whole number of at least 1.");
      return;
    }

    setSubmitting(true);
    try {
      const token = await getIdToken();
      if (!token) {
        setError("Your session expired. Please sign in again.");
        return;
      }
      const trip = await createTrip(token, {
        origin: origin.trim(),
        destination: destination.trim(),
        budget: budgetNum,
        days: daysNum,
        transportModePreference,
      });
      router.push(`/trips/${trip.id}`);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Origin" htmlFor="origin">
          <input
            id="origin"
            required
            placeholder="e.g. Mumbai"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Destination" htmlFor="destination">
          <input
            id="destination"
            required
            placeholder="e.g. Goa"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Budget" htmlFor="budget">
          <input
            id="budget"
            type="number"
            min={1}
            step="1"
            required
            placeholder="e.g. 15000"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Days" htmlFor="days">
          <input
            id="days"
            type="number"
            min={1}
            step="1"
            required
            placeholder="e.g. 4"
            value={days}
            onChange={(e) => setDays(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Preferred transport" htmlFor="transportModePreference">
          <select
            id="transportModePreference"
            value={transportModePreference}
            onChange={(e) => setTransportModePreference(e.target.value as TransportModePreference)}
            className={inputClass}
          >
            {TRANSPORT_MODES.map((mode) => (
              <option key={mode} value={mode}>
                {TRANSPORT_MODE_LABELS[mode]}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {error && <p className="text-sm text-status-danger">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-fit rounded-full bg-ink-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-ink-950 disabled:opacity-60"
      >
        {submitting ? "Planning…" : "Plan my trip"}
      </button>
    </form>
  );
}

const inputClass =
  "rounded-lg border border-surface-border bg-white px-3 py-2 text-sm text-text-heading outline-none focus:border-ink-500 focus:ring-2 focus:ring-ink-100";

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-text-heading">
        {label}
      </label>
      {children}
    </div>
  );
}
