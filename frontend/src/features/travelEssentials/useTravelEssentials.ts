"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/AuthContext";
import { ApiClientError } from "@/lib/apiClient";
import { getTravelEssentials } from "./api";
import type { TravelEssentials } from "./types";

interface UseTravelEssentialsResult {
  travelEssentials: TravelEssentials | null;
  loading: boolean;
  error: string | null;
  /** Re-fetches with a different passport country (e.g. from a picker). */
  setPassport: (code: string) => void;
}

export function useTravelEssentials(tripId: string): UseTravelEssentialsResult {
  const { getIdToken } = useAuth();
  const [passport, setPassport] = useState<string | undefined>(undefined);
  const [travelEssentials, setTravelEssentials] = useState<TravelEssentials | null>(null);
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
        const result = await getTravelEssentials(token, tripId, passport);
        if (!cancelled) {
          setTravelEssentials(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiClientError ? err.message : "Couldn't load travel essentials.");
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
  }, [tripId, passport]);

  return { travelEssentials, loading, error, setPassport };
}
