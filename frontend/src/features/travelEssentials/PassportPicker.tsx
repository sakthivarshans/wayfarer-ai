"use client";

import type { PassportOption } from "./types";

export function PassportPicker({
  options,
  value,
  onChange,
}: {
  options: PassportOption[];
  value: string | null;
  onChange: (code: string) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-text-body">
      Passport
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-full border border-surface-border bg-white px-3 py-1.5 text-sm text-text-heading"
      >
        {!value && <option value="">Select a country</option>}
        {options.map((option) => (
          <option key={option.code} value={option.code}>
            {option.name}
          </option>
        ))}
      </select>
    </label>
  );
}
