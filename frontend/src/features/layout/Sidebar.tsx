"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass } from "lucide-react";
import { isNavItemActive, navItems } from "./nav-items";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex w-[72px] flex-col items-center rounded-br-card bg-ink-900 py-6">
      <Link
        href="/"
        aria-label="Wayfarer AI home"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white"
      >
        <Compass className="h-5 w-5" strokeWidth={2} />
      </Link>

      <nav className="mt-8 flex flex-1 flex-col items-center gap-6">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = isNavItemActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              aria-current={active ? "page" : undefined}
              title={label}
              className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
                active ? "bg-ink-800 text-white" : "text-ink-100 hover:bg-ink-800/60 hover:text-white"
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={2} />
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
