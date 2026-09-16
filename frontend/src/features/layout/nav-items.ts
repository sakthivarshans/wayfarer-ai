import { CalendarDays, Compass, Luggage, Map, Send, Settings } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

/**
 * Single source of truth for the sidebar icon rail. `href` values are exact
 * matches or path prefixes checked by the Sidebar to highlight the active
 * item — keep them as top-level segments.
 */
export const navItems: NavItem[] = [
  { href: "/", label: "Trip Planner", icon: Compass },
  { href: "/results", label: "Results", icon: Map },
  { href: "/itinerary", label: "Itinerary", icon: CalendarDays },
  { href: "/telegram", label: "Telegram Bot", icon: Send },
  { href: "/trips", label: "My Trips", icon: Luggage },
  { href: "/settings", label: "Settings", icon: Settings },
];

/** "/" only matches exactly; every other item matches its own subtree. */
export function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** The sidebar label for whichever nav item the current route falls under. */
export function getPageTitle(pathname: string): string {
  const match = navItems.find((item) => isNavItemActive(pathname, item.href));
  return match?.label ?? "Wayfarer AI";
}
