"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/AuthContext";
import { ApiClientError } from "@/lib/apiClient";
import { getLocalGuides } from "./api";
import type { LocalGuide } from "./types";

interface UseLocalGuidesResult {
  guides: LocalGuide[];
  loading: boolean;
  error: string | null;
}

export function useLocalGuides(tripId: string): UseLocalGuidesResult {
  const { getIdToken } = useAuth();
  const [guides, setGuides] = useState<LocalGuide[]>([]);
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
        const result = await getLocalGuides(token, tripId);
        if (!cancelled) {
          setGuides(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiClientError ? err.message : "Couldn't load local guides.");
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

  return { guides, loading, error };
}
