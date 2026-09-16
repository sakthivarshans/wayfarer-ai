"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import type { ReactNode } from "react";

const subTabs = [
  { segment: "places", label: "Places" },
  { segment: "transport", label: "Transport" },
  { segment: "hotels", label: "Hotels" },
];

export default function TripResultsLayout({ children }: { children: ReactNode }) {
  const { tripId } = useParams<{ tripId: string }>();
  const pathname = usePathname();

  return (
    <div>
      <div className="mb-6 flex w-fit gap-1 rounded-full border border-surface-border bg-white/60 p-1">
        {subTabs.map((tab) => {
          const href = `/trips/${tripId}/results/${tab.segment}`;
          const active = pathname === href;
          return (
            <Link
              key={tab.segment}
              href={href}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                active ? "bg-ink-700 text-white" : "text-text-body hover:text-ink-700"
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
