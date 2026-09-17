export const PLACE_CATEGORIES = ["sights", "museum", "nature", "religion", "entertainment", "other"] as const;
export type PlaceCategory = (typeof PLACE_CATEGORIES)[number];

export const PLACE_CATEGORY_LABELS: Record<PlaceCategory, string> = {
  sights: "Sights",
  museum: "Museum",
  nature: "Nature",
  religion: "Religious site",
  entertainment: "Entertainment",
  other: "Other",
};

export interface Place {
  id: string;
  name: string;
  description: string | null;
  category: PlaceCategory;
  /** Rough per-visit cost estimate, or null when there's no basis to estimate it. */
  estimatedCost: number | null;
  lat: number;
  lng: number;
}
