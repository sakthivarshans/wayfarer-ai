import { Church, Landmark, MapPin, Ticket, Trees, Building2, Sparkles } from "lucide-react";
import { usePlacePhoto } from "./usePlacePhoto";
import { PLACE_CATEGORY_LABELS, type PlaceCategory } from "./types";

const CATEGORY_ICON: Record<PlaceCategory, typeof Landmark> = {
  sights: Landmark,
  museum: Building2,
  nature: Trees,
  religion: Church,
  entertainment: Ticket,
  other: Sparkles,
};

// Deterministic per-place tilt so the grid has some of the reference
// image's "one card rotated like a polaroid" life to it, without random
// values causing layout shift between renders. Most cards sit flat; every
// third card gets a small tilt, alternating direction.
function tiltFor(seed: string): string {
  const n = seed.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const bucket = n % 3;
  if (bucket === 0) return "";
  return bucket === 1 ? "rotate-[-1.5deg]" : "rotate-[1.5deg]";
}

export function PlacePhoto({
  placeId,
  name,
  region,
  category,
  className = "",
  showCaption = true,
}: {
  placeId: string;
  name: string;
  /** Short caption under the pin, e.g. the destination city/country. */
  region?: string;
  category: PlaceCategory;
  className?: string;
  /** Set false for small/compact uses (e.g. an itinerary row thumbnail)
   * where the name is already shown alongside the photo. */
  showCaption?: boolean;
}) {
  const { photoUrl, loading } = usePlacePhoto(name);
  const Icon = CATEGORY_ICON[category];
  const tilt = tiltFor(placeId || name);

  return (
    <div
      className={`relative aspect-[4/3] w-full overflow-hidden rounded-card shadow-card transition-transform ${tilt} ${className}`}
    >
      {loading && <div className="h-full w-full animate-pulse bg-ink-100" />}

      {!loading && photoUrl && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element -- external, unpredictable-domain photo source; not worth next/image's remote-pattern config for a best-effort decorative image */}
          <img src={photoUrl} alt="" className="h-full w-full object-cover" />
          {showCaption && (
            <>
              <div className="absolute inset-0 bg-gradient-to-t from-ink-900/80 via-ink-900/0 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-3">
                <p className="flex items-center gap-1 text-xs font-medium text-sand-100">
                  <MapPin className="h-3 w-3 shrink-0" />
                  {region ?? PLACE_CATEGORY_LABELS[category]}
                </p>
                <p className="mt-0.5 truncate font-display text-base font-medium text-white">{name}</p>
              </div>
            </>
          )}
        </>
      )}

      {!loading && !photoUrl && (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-sand-100 to-sand-300">
          <Icon className={showCaption ? "h-8 w-8 text-ink-700" : "h-4 w-4 text-ink-700"} strokeWidth={1.5} />
          {showCaption && (
            <p className="px-3 text-center font-display text-sm font-medium text-text-heading">{name}</p>
          )}
        </div>
      )}
    </div>
  );
}
