import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  /** Set false for cards that manage their own inner spacing (e.g. a
   * photo card that needs the image to bleed to the card's edges). */
  padded?: boolean;
}) {
  return (
    <div className={`rounded-card bg-surface-card shadow-card ${padded ? "p-6" : ""} ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-sm font-semibold text-text-heading">{title}</h2>
      {action}
    </div>
  );
}
