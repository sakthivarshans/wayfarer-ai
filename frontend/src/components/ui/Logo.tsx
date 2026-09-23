/**
 * Brand mark: the illustrated toucan-with-compass-pendant artwork
 * (public/brand/toucan-mark.png), matching the app icon shared for the
 * project. A raster asset, so unlike the earlier placeholder SVG this
 * can't be recolored per-context — the artwork's own purple gradient
 * badge is used as-is everywhere (sidebar, auth pages, favicon, loading
 * state, and the corner mascot in MascotGuide/Toucan.tsx).
 */
export function LogoMark({
  className = "h-8 w-8",
  animated = false,
}: {
  className?: string;
  animated?: boolean;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- small static local asset, not worth next/image's config for a fixed-size icon used in many contexts
    <img
      src="/brand/toucan-mark.png"
      alt=""
      className={`rounded-xl object-contain ${
        animated ? "animate-[logo-pulse_1.6s_ease-in-out_infinite] motion-reduce:animate-none" : ""
      } ${className}`}
    />
  );
}

/** Full lockup: mark + "Wayfarer" wordmark in the display serif. */
export function Logo({
  className = "",
  markClassName = "h-9 w-9",
  textClassName = "text-xl",
  light = false,
}: {
  className?: string;
  markClassName?: string;
  textClassName?: string;
  /** Use on dark/photo backgrounds (auth pages) — swaps wordmark to white. */
  light?: boolean;
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark className={markClassName} />
      <span
        className={`font-display font-medium tracking-tight ${textClassName} ${
          light ? "text-white" : "text-text-heading"
        }`}
      >
        Wayfarer
      </span>
    </span>
  );
}
