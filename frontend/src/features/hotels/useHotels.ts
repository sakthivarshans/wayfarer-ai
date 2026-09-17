"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/AuthContext";
import { ApiClientError } from "@/lib/apiClient";
import { getHotels } from "./api";
import type { HotelSummary } from "./types";

interface UseHotelsResult {
  hotels: HotelSummary | null;
  loading: boolean;
  error: string | null;
}

export function useHotels(tripId: string): UseHotelsResult {
  const { getIdToken } = useAuth();
  const [hotels, setHotels] = useState<HotelSummary | null>(null);
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
        const result = await getHotels(token, tripId);
        if (!cancelled) {
          setHotels(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiClientError ? err.message : "Couldn't load hotel options.");
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

  return { hotels, loading, error };
}
