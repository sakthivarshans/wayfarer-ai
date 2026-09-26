import Link from "next/link";

const NAV_LINKS = [
  { href: "/", label: "Trip Planner" },
  { href: "/results/places", label: "Places" },
  { href: "/results/transport", label: "Transport" },
  { href: "/results/hotels", label: "Hotels" },
  { href: "/itinerary", label: "Itinerary" },
  { href: "/telegram-bot-setup", label: "Telegram Bot" },
  { href: "/settings", label: "Settings" },
] as const;

/**
 * Top-level navigation shell. Phase 1 wires this up to real active-tab
 * styling and auth-aware links; for now it's plain navigation between the
 * app's screens.
 */
export function NavBar(): JSX.Element {
  return (
    <header className="border-b border-slate-200 bg-white">
      <nav className="mx-auto flex max-w-5xl flex-wrap items-center gap-4 px-4 py-3">
        <span className="mr-2 text-lg font-semibold text-slate-900">
          Wayfarer AI
        </span>
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
