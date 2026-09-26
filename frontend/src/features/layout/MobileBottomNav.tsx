"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isNavItemActive, navItems } from "./nav-items";

/**
 * Mobile counterpart to `Sidebar` — the fixed left icon rail doesn't work
 * on a narrow viewport (it eats a large fraction of the available width),
 * so below the `md` breakpoint navigation moves to a bottom tab bar
 * instead, a standard mobile-web pattern. Same `navItems` source of truth,
 * so the two never drift apart.
 */
export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 flex justify-between border-t border-surface-border bg-surface-card px-1 pt-1.5 md:hidden"
      style={{ paddingBottom: "max(0.375rem, env(safe-area-inset-bottom, 0px))" }}
    >
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = isNavItemActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            aria-current={active ? "page" : undefined}
            className={`flex flex-1 flex-col items-center gap-0.5 rounded-lg px-1 py-1.5 text-[10px] font-medium transition-colors ${
              active ? "text-ink-700" : "text-text-muted"
            }`}
          >
            <Icon className="h-5 w-5" strokeWidth={2} />
            <span className="truncate">{label.split(" ")[0]}</span>
          </Link>
        );
      })}
    </nav>
  );
}
