"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const tabs = [
  { href: "/results/places", label: "Places" },
  { href: "/results/transport", label: "Transport" },
  { href: "/results/hotels", label: "Hotels" },
];

export default function ResultsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="pt-2">
      <div className="mb-6 flex w-fit gap-1 rounded-full bg-surface-card p-1 shadow-card">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                active ? "bg-ink-900 text-white" : "text-text-body hover:text-ink-700"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
      {children}
    </div>
  );
}
