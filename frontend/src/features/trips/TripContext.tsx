"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/features/auth/AuthContext";
import { ApiClientError } from "@/lib/apiClient";
import { getTrip } from "./api";
import type { Trip } from "./types";

interface TripContextValue {
  trip: Trip | null;
  loading: boolean;
  error: string | null;
}

const TripContext = createContext<TripContextValue | undefined>(undefined);

export function TripProvider({ tripId, children }: { tripId: string; children: ReactNode }) {
  const { getIdToken } = useAuth();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const token = await getIdToken();
        if (!token) {
          throw new ApiClientError(401, "UNAUTHORIZED", "Your session expired. Please sign in again.");
        }
        const result = await getTrip(token, tripId);
        if (!cancelled) {
          setTrip(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiClientError && err.status === 404
              ? "Trip not found."
              : err instanceof ApiClientError
                ? err.message
                : "Couldn't load this trip."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);

  return <TripContext.Provider value={{ trip, loading, error }}>{children}</TripContext.Provider>;
}

export function useTrip(): TripContextValue {
  const ctx = useContext(TripContext);
  if (!ctx) {
    throw new Error("useTrip must be used within a TripProvider");
  }
  return ctx;
}
