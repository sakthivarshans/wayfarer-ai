"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ApiRequestError, apiFetch } from "@/lib/api";
import {
  TRANSPORT_MODES,
  type CreateTripPayload,
  type CreateTripResponse,
  type TransportModePreference,
} from "@/types/trip";

interface FormValues {
  origin: string;
  destination: string;
  budget: string;
  days: string;
  transportModePreference: TransportModePreference;
}

const INITIAL_VALUES: FormValues = {
  origin: "",
  destination: "",
  budget: "",
  days: "",
  transportModePreference: "any",
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

const TRANSPORT_LABELS: Record<TransportModePreference, string> = {
  flight: "Flight",
  train: "Train",
  bus: "Bus",
  any: "Any",
};

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  if (!values.origin.trim()) {
    errors.origin = "Origin is required";
  }

  if (!values.destination.trim()) {
    errors.destination = "Destination is required";
  } else if (
    values.origin.trim().toLowerCase() === values.destination.trim().toLowerCase() &&
    values.origin.trim() !== ""
  ) {
    errors.destination = "Destination should be different from origin";
  }

  const budgetNumber = Number(values.budget);
  if (values.budget.trim() === "" || Number.isNaN(budgetNumber) || budgetNumber <= 0) {
    errors.budget = "Enter a budget greater than 0";
  }

  const daysNumber = Number(values.days);
  if (values.days.trim() === "" || !Number.isInteger(daysNumber) || daysNumber < 1) {
    errors.days = "Enter a whole number of days (at least 1)";
  } else if (daysNumber > 90) {
    errors.days = "Trip can be at most 90 days";
  }

  return errors;
}

/**
 * The Trip Planner form. Validates client-side before ever hitting the
 * network, then POSTs to /api/trips and forwards the user to the Results
 * tabs with the new trip's id so later phases can fetch real data for it.
 */
export function TripForm(): JSX.Element {
  const router = useRouter();
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField<K extends keyof FormValues>(field: K, value: FormValues[K]): void {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setSubmitError(null);

    const validationErrors = validate(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const payload: CreateTripPayload = {
      origin: values.origin.trim(),
      destination: values.destination.trim(),
      budget: Number(values.budget),
      days: Number(values.days),
      transportModePreference: values.transportModePreference,
    };

    setIsSubmitting(true);
    try {
      const response = await apiFetch<CreateTripResponse>("/trips", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      router.push(`/results/places?tripId=${response.id}`);
    } catch (error) {
      setSubmitError(
        error instanceof ApiRequestError
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-6 max-w-xl space-y-5">
      <Field label="Origin" error={errors.origin}>
        <input
          type="text"
          value={values.origin}
          onChange={(e) => updateField("origin", e.target.value)}
          placeholder="e.g. Chennai"
          className={inputClassName(Boolean(errors.origin))}
        />
      </Field>

      <Field label="Destination" error={errors.destination}>
        <input
          type="text"
          value={values.destination}
          onChange={(e) => updateField("destination", e.target.value)}
          placeholder="e.g. Paris"
          className={inputClassName(Boolean(errors.destination))}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Budget (in your currency)" error={errors.budget}>
          <input
            type="number"
            min={0}
            value={values.budget}
            onChange={(e) => updateField("budget", e.target.value)}
            placeholder="e.g. 50000"
            className={inputClassName(Boolean(errors.budget))}
          />
        </Field>

        <Field label="Number of days" error={errors.days}>
          <input
            type="number"
            min={1}
            max={90}
            value={values.days}
            onChange={(e) => updateField("days", e.target.value)}
            placeholder="e.g. 5"
            className={inputClassName(Boolean(errors.days))}
          />
        </Field>
      </div>

      <Field label="Preferred transport mode" error={errors.transportModePreference}>
        <select
          value={values.transportModePreference}
          onChange={(e) =>
            updateField("transportModePreference", e.target.value as TransportModePreference)
          }
          className={inputClassName(false)}
        >
          {TRANSPORT_MODES.map((mode) => (
            <option key={mode} value={mode}>
              {TRANSPORT_LABELS[mode]}
            </option>
          ))}
        </select>
      </Field>

      {submitError && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {submitError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Planning your trip…" : "Plan my trip"}
      </button>
    </form>
  );
}

function inputClassName(hasError: boolean): string {
  const base =
    "mt-1 w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400";
  return hasError ? `${base} border-red-400` : `${base} border-slate-300`;
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}): JSX.Element {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      {children}
      {error && <span className="mt-1 block text-xs font-normal text-red-600">{error}</span>}
    </label>
  );
}
