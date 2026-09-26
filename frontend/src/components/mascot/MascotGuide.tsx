"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { X, ChevronDown } from "lucide-react";
import { Toucan } from "./Toucan";
import { useMascotNudgeState } from "./MascotNudgeContext";

const SEEN_KEY = "wayfarer:mascot-seen-tips";

/** One tip per top-level route, shown the first time that page is visited. */
const TIPS: Record<string, string> = {
  "/": "Tell me your budget and days, and I'll help line up the rest of the trip.",
  "/results": "Flip between Places, Transport, and Hotels — I'll flag the best-value picks.",
  "/itinerary": "This is your day-by-day plan — change a pick upstream and regenerate anytime.",
  "/telegram": "Connect your own bot here, then ask it anything about this trip later on.",
  "/trips": "Every trip you've planned lives here — tap one to pick up where you left off.",
  "/settings": "Manage your saved preferences and connections here.",
};

function tipKeyFor(pathname: string): string | null {
  if (pathname === "/") return "/";
  const match = Object.keys(TIPS).find((key) => key !== "/" && pathname.startsWith(key));
  return match ?? null;
}

function getSeenTips(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(SEEN_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function markTipSeen(key: string) {
  try {
    const seen = getSeenTips();
    seen.add(key);
    window.localStorage.setItem(SEEN_KEY, JSON.stringify([...seen]));
  } catch {
    // localStorage unavailable (private mode etc.) — tip just reappears next visit, harmless
  }
}

/**
 * Persistent, collapsible mascot living in the bottom-right corner across
 * every authenticated page (mounted once in AppShell, so its collapsed/
 * expanded state survives client-side navigation). Offers a one-line,
 * first-visit tip per page; never blocks content and is fully dismissible.
 */
export function MascotGuide() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [tip, setTip] = useState<string | null>(null);
  const nudgeState = useMascotNudgeState();

  useEffect(() => {
    const key = tipKeyFor(pathname);
    if (!key || collapsed) {
      setTip(null);
      return;
    }
    const seen = getSeenTips();
    if (!seen.has(key)) {
      setTip(TIPS[key] ?? null);
      markTipSeen(key);
    } else {
      setTip(null);
    }
    // A route change also retires any page-specific nudge from the
    // previous page (e.g. an empty-state message shouldn't linger after
    // navigating away).
    nudgeState?.clearNudge();
    // Re-check whenever the route changes; `collapsed` intentionally excluded
    // so re-expanding doesn't replay an already-seen tip.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // A nudge (empty-state hint, generation celebration) takes priority over
  // the generic first-visit tip while it's active.
  const message = nudgeState?.nudge ?? tip;
  const dismissMessage = () => {
    if (nudgeState?.nudge) {
      nudgeState.clearNudge();
    } else {
      setTip(null);
    }
  };

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={() => setCollapsed(false)}
        aria-label="Show Wayfarer guide"
        className="fixed bottom-20 right-4 md:bottom-4 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-ink-900 text-white shadow-warm motion-reduce:animate-none"
      >
        <Toucan className="h-7 w-7 animate-mascot-idle motion-reduce:animate-none" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-20 right-4 md:bottom-4 z-30 flex max-w-[min(280px,calc(100vw-2rem))] flex-col items-end gap-2">
      {message && (
        <div className="animate-tip-in rounded-card rounded-br-md bg-white px-4 py-3 text-sm text-text-body shadow-warm">
          <div className="flex items-start justify-between gap-3">
            <p>{message}</p>
            <button
              type="button"
              onClick={dismissMessage}
              aria-label="Dismiss tip"
              className="mt-0.5 shrink-0 text-text-muted hover:text-text-body"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
      <div className="flex items-center gap-1.5 rounded-full bg-ink-900 py-1.5 pl-2 pr-1.5 shadow-warm">
        <Toucan className="h-9 w-9 animate-mascot-idle motion-reduce:animate-none" />
        <button
          type="button"
          onClick={() => setCollapsed(true)}
          aria-label="Collapse guide"
          className="flex h-6 w-6 items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
