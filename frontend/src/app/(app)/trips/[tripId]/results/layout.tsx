"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Car, MapPin, Plane, Hotel, UtensilsCrossed, Luggage } from "lucide-react";

const subTabs = [
  { segment: "places", label: "Places", icon: MapPin },
  { segment: "restaurants", label: "Restaurants", icon: UtensilsCrossed },
  { segment: "transport", label: "Transport", icon: Plane },
  { segment: "hotels", label: "Hotels", icon: Hotel },
  { segment: "getting-around", label: "Getting around", icon: Car },
  { segment: "travel-essentials", label: "Essentials", icon: Luggage },
];

export default function TripResultsLayout({ children }: { children: ReactNode }) {
  const { tripId } = useParams<{ tripId: string }>();
  const pathname = usePathname();

  return (
    <div>
      <div className="mb-6 flex w-fit max-w-full gap-1 overflow-x-auto rounded-full border border-surface-border bg-white/60 p-1">
        {subTabs.map((tab) => {
          const href = `/trips/${tripId}/results/${tab.segment}`;
          const active = pathname === href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.segment}
              href={href}
              className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                active ? "bg-ink-700 text-white" : "text-text-body hover:text-ink-700"
              }`}
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={2} />
              {tab.label}
            </Link>
          );
        })}
      </div>
      {children}
    </div>
  );
}
