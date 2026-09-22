"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

interface MascotNudgeContextValue {
  nudge: string | null;
  /** Show a one-off message in the mascot's bubble, replacing any
   * first-visit page tip until dismissed or the route changes. */
  sendNudge: (message: string) => void;
  clearNudge: () => void;
}

const MascotNudgeContext = createContext<MascotNudgeContextValue | null>(null);

export function MascotNudgeProvider({ children }: { children: ReactNode }) {
  const [nudge, setNudge] = useState<string | null>(null);

  const sendNudge = useCallback((message: string) => setNudge(message), []);
  const clearNudge = useCallback(() => setNudge(null), []);

  return (
    <MascotNudgeContext.Provider value={{ nudge, sendNudge, clearNudge }}>
      {children}
    </MascotNudgeContext.Provider>
  );
}

/**
 * Lets a page trigger a contextual mascot message — an empty-state nudge,
 * a generation celebration, etc. — without the mascot needing to know
 * about each page's data-fetching state itself. Purely additive UI
 * feedback; never touches the calling page's own loading/error logic.
 */
export function useMascotNudge() {
  const ctx = useContext(MascotNudgeContext);
  if (!ctx) {
    throw new Error("useMascotNudge must be used within MascotNudgeProvider");
  }
  return ctx;
}

/** Internal: MascotGuide's own read of the current nudge state. */
export function useMascotNudgeState() {
  return useContext(MascotNudgeContext);
}
