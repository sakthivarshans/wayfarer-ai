import { Coffee, Sandwich, Wine, Croissant, UtensilsCrossed, Sparkles } from "lucide-react";
import { MapPin } from "lucide-react";
// Reused from the Places feature: a generic "fetch a representative photo
// for this name via Wikipedia" hook with no restaurant-specific logic in
// it, so it works unchanged here rather than duplicating its ~70 lines of
// caching/dedup logic for a second entity type.
import { usePlacePhoto } from "@/features/places/usePlacePhoto";
import { RESTAURANT_CATEGORY_LABELS, type RestaurantCategory } from "./types";

const CATEGORY_ICON: Record<RestaurantCategory, typeof UtensilsCrossed> = {
  restaurant: UtensilsCrossed,
  cafe: Coffee,
  fastFood: Sandwich,
  bar: Wine,
  bakery: Croissant,
  other: Sparkles,
};

// Same deterministic "polaroid tilt" treatment as PlacePhoto, for a
// consistent grid feel between the two tabs.
function tiltFor(seed: string): string {
  const n = seed.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const bucket = n % 3;
  if (bucket === 0) return "";
  return bucket === 1 ? "rotate-[-1.5deg]" : "rotate-[1.5deg]";
}

export function RestaurantPhoto({
  restaurantId,
  name,
  region,
  category,
  className = "",
  showCaption = true,
}: {
  restaurantId: string;
  name: string;
  region?: string;
  category: RestaurantCategory;
  className?: string;
  showCaption?: boolean;
}) {
  const { photoUrl, loading } = usePlacePhoto(name);
  const Icon = CATEGORY_ICON[category];
  const tilt = tiltFor(restaurantId || name);

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
                  {region ?? RESTAURANT_CATEGORY_LABELS[category]}
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
