import { readFileSync } from "node:fs";
import path from "node:path";
import {
  VISA_STATUSES,
  type PassportOption,
  type VisaConfidence,
  type VisaEntry,
  type VisaStatus,
} from "../../types/travelEssentials";

// Resolves to `backend/data/visa` from both `src/services/travelEssentials`
// (tests, tsx dev) and `dist/services/travelEssentials` (production build),
// since both sit exactly three levels below `backend/`.
const DATA_DIR = path.resolve(__dirname, "../../../data/visa");

const STATUS_SET: ReadonlySet<string> = new Set(VISA_STATUSES);
const CONFIDENCE_SET: ReadonlySet<string> = new Set(["high", "medium", "disputed"]);

export interface DatasetMetadata {
  source: string;
  commit: string;
  retrievedAt: string;
  license: string;
}

interface VisaDataset {
  entries: Map<string, VisaEntry>;
  /** ISO2 code -> display name (the first name the dataset lists for it). */
  names: Map<string, string>;
  metadata: DatasetMetadata;
}

function key(passport: string, destination: string): string {
  return `${passport.toUpperCase()}>${destination.toUpperCase()}`;
}

/**
 * Parses the dataset's tidy CSV (`passport,destination,type,days,confidence`).
 * Rows with an unrecognised status or confidence are skipped rather than
 * guessed at — better to say "unknown" than to show a wrong requirement.
 */
export function parseVisaCsv(text: string): Map<string, VisaEntry> {
  const entries = new Map<string, VisaEntry>();
  const lines = text.split(/\r?\n/);

  for (const line of lines.slice(1)) {
    if (!line.trim()) {
      continue;
    }
    const [passport, destination, type, days, confidence] = line.split(",");
    if (!passport || !destination || !type || !confidence) {
      continue;
    }
    if (!STATUS_SET.has(type) || !CONFIDENCE_SET.has(confidence.trim())) {
      continue;
    }
    const parsedDays = days && days.trim() !== "" ? Number(days) : null;
    entries.set(key(passport, destination), {
      status: type as VisaStatus,
      days: parsedDays !== null && Number.isFinite(parsedDays) && parsedDays > 0 ? parsedDays : null,
      confidence: confidence.trim() as VisaConfidence,
    });
  }

  return entries;
}

/** Inverts the dataset's `name -> code` map, keeping the first name listed per code. */
export function parseCountryNames(json: string): Map<string, string> {
  const byName = JSON.parse(json) as Record<string, string>;
  const names = new Map<string, string>();
  for (const [name, code] of Object.entries(byName)) {
    const upper = code.toUpperCase();
    if (!names.has(upper)) {
      names.set(upper, name);
    }
  }
  return names;
}

let cached: VisaDataset | null = null;

// Loaded lazily and once: ~1 MB of CSV parsed on first use, then served from
// memory, so a cold start doesn't pay for it until someone opens the tab.
function getDataset(): VisaDataset {
  if (!cached) {
    const entries = parseVisaCsv(readFileSync(path.join(DATA_DIR, "visa-matrix-tidy.csv"), "utf8"));
    const names = parseCountryNames(readFileSync(path.join(DATA_DIR, "countries-iso2.json"), "utf8"));
    const metadata = JSON.parse(readFileSync(path.join(DATA_DIR, "metadata.json"), "utf8")) as DatasetMetadata;
    cached = { entries, names, metadata };
  }
  return cached;
}

export function lookupVisa(passport: string, destination: string): VisaEntry | null {
  return getDataset().entries.get(key(passport, destination)) ?? null;
}

export function countryNameFor(code: string | null): string | null {
  return code ? (getDataset().names.get(code.toUpperCase()) ?? null) : null;
}

export function isSupportedCountry(code: string): boolean {
  return getDataset().names.has(code.toUpperCase());
}

/** Every country the dataset covers, sorted by name, for a passport picker. */
export function listPassportOptions(): PassportOption[] {
  return [...getDataset().names.entries()]
    .map(([code, name]) => ({ code, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getDatasetMetadata(): DatasetMetadata {
  return getDataset().metadata;
}
