"use client";

/**
 * Full-bleed looping video background for the login/signup pages only —
 * intentionally not used app-wide, to protect page-load performance on the
 * free hosting tier (see docs/DESIGN.md redesign addendum).
 *
 * Source: Mixkit "Palm tree on a sunny day" (11s, 720p, 3.68MB), free for
 * commercial use under the Mixkit Stock Video Free License, no attribution
 * or account required: https://mixkit.co/free-stock-video/palm-tree-on-a-sunny-day-4645/
 *
 * Respects prefers-reduced-motion: the poster frame is always rendered as
 * the base layer; the <video> itself is hidden via the `motion-reduce:`
 * Tailwind variant, so reduced-motion users see a static image, never
 * autoplaying motion.
 */
export function AuthBackdrop() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-ink-900" aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element -- static poster, no next/image benefit for a full-bleed absolutely-positioned background */}
      <img
        src="https://assets.mixkit.co/videos/4645/4645-thumb-720-0.jpg"
        alt=""
        className="h-full w-full object-cover"
      />
      <video
        className="absolute inset-0 h-full w-full object-cover motion-reduce:hidden"
        autoPlay
        muted
        loop
        playsInline
        poster="https://assets.mixkit.co/videos/4645/4645-thumb-720-0.jpg"
      >
        <source src="https://assets.mixkit.co/videos/4645/4645-720.mp4" type="video/mp4" />
      </video>
      {/* Warm scrim so the floating card and header text stay legible over any part of the clip */}
      <div className="absolute inset-0 bg-gradient-to-b from-ink-900/50 via-ink-900/20 to-sand-700/40" />
    </div>
  );
}
