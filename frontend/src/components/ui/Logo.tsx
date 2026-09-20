/**
 * Brand mark: a compass needle rendered as two triangles (a "wayfinding"
 * arrow split into a light/dark half, echoing the sand + ink palette) with
 * a small pivot dot. Same shape as public/favicon.svg, kept in sync by hand
 * since the favicon needs to be a static file.
 */
export function LogoMark({ className = "h-8 w-8", animated = false }: { className?: string; animated?: boolean }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
      <circle cx="32" cy="32" r="30" className="fill-ink-900" />
      <g className={animated ? "origin-center animate-[spin_8s_linear_infinite]" : undefined}>
        <path d="M32 12 L40 32 L32 32 Z" className="fill-sand-300" />
        <path d="M32 52 L24 32 L32 32 Z" className="fill-ink-500" />
        <path d="M32 12 L24 32 L32 32 Z" className="fill-sand-500" />
        <path d="M32 52 L40 32 L32 32 Z" className="fill-ink-300" />
      </g>
      <circle cx="32" cy="32" r="3.5" className="fill-text-heading" />
    </svg>
  );
}

/** Full lockup: mark + "Wayfarer" wordmark in the display serif. */
export function Logo({
  className = "",
  markClassName = "h-8 w-8",
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
