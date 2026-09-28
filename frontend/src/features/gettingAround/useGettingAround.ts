"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/AuthContext";
import { ApiClientError } from "@/lib/apiClient";
import { getGettingAround } from "./api";
import type { GettingAroundSummary } from "./types";

interface UseGettingAroundResult {
  gettingAround: GettingAroundSummary | null;
  loading: boolean;
  error: string | null;
}

export function useGettingAround(tripId: string): UseGettingAroundResult {
  const { getIdToken } = useAuth();
  const [gettingAround, setGettingAround] = useState<GettingAroundSummary | null>(null);
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
        const result = await getGettingAround(token, tripId);
        if (!cancelled) {
          setGettingAround(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiClientError ? err.message : "Couldn't load local transport options.");
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

  return { gettingAround, loading, error };
}
