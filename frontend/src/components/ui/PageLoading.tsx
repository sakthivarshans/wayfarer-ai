import { LogoMark } from "./Logo";

/**
 * Branded loading state — the animated compass mark, replacing the
 * generic border-spinner ring wherever a page (or a full section of one)
 * is waiting on data. Respects prefers-reduced-motion via LogoMark itself.
 */
export function PageLoading({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-3" role="status" aria-live="polite">
      <LogoMark className="h-12 w-12" animated />
      <span className="sr-only">Loading</span>
      {label && <p className="text-sm text-text-muted">{label}</p>}
    </div>
  );
}
