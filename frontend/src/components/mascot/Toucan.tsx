/**
 * The Wayfarer mascot — now the same illustrated artwork used for the app
 * logo/icon (public/brand/toucan-mark.png), rather than a separate
 * hand-drawn SVG, so the brand mark and the persistent corner guide are
 * visibly the same character. Idle animation is applied by the parent
 * (MascotGuide, motion-reduce-aware) via a transform on this element.
 */
export function Toucan({ className = "h-14 w-14" }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- small static local asset
    <img src="/brand/toucan-mark.png" alt="" className={`rounded-xl object-contain ${className}`} />
  );
}
