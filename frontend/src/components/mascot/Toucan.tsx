/**
 * The Wayfarer mascot: a toucan wearing a small compass pendant (matching
 * the LogoMark's ink/sand facets, on a sand-colored cord). Idle animation
 * is applied by the parent (motion-reduce-aware) — this component is a
 * static illustration.
 */
export function Toucan({ className = "h-14 w-14" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className} aria-hidden="true">
      {/* body */}
      <ellipse cx="46" cy="62" rx="22" ry="26" className="fill-ink-900" />
      {/* belly */}
      <ellipse cx="42" cy="68" rx="13" ry="17" className="fill-white" />
      {/* wing */}
      <path d="M60 46 Q74 56 62 78 Q54 76 54 62 Q54 50 60 46Z" className="fill-ink-700" />
      {/* head */}
      <circle cx="42" cy="34" r="17" className="fill-ink-900" />
      {/* eye patch */}
      <circle cx="42" cy="34" r="17" className="fill-white" opacity="0.06" />
      <circle cx="47" cy="30" r="3.2" className="fill-white" />
      <circle cx="48" cy="30" r="1.6" className="fill-ink-950" />
      {/* beak */}
      <path
        d="M58 30 C74 26 86 32 90 38 C86 42 74 45 58 40 Z"
        className="fill-coral-500"
      />
      <path d="M58 30 C74 26 86 32 90 38" className="stroke-coral-600" strokeWidth="1.2" fill="none" />
      <path d="M62 33.5 C74 31 83 34 87 38" className="stroke-coral-600" strokeWidth="1" fill="none" opacity="0.6" />
      {/* feet */}
      <path d="M36 86 L33 93 M36 86 L40 93" className="stroke-coral-500" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M52 86 L49 93 M52 86 L56 93" className="stroke-coral-500" strokeWidth="2.5" strokeLinecap="round" />
      {/* compass pendant cord */}
      <path d="M38 50 Q44 58 50 50" className="stroke-sand-500" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* compass pendant */}
      <circle cx="44" cy="58" r="7" className="fill-sand-100" stroke="#B87A3D" strokeWidth="1.5" />
      <path d="M44 53 L47 58 L44 63 L41 58 Z" className="fill-ink-700" />
    </svg>
  );
}
