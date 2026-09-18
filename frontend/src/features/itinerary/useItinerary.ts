"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/features/auth/AuthContext";
import { ApiClientError } from "@/lib/apiClient";
import { generateItinerary as requestGenerateItinerary, getItinerary } from "./api";
import type { Itinerary } from "./types";

interface UseItineraryResult {
  itinerary: Itinerary | null;
  loading: boolean;
  error: string | null;
  generating: boolean;
  generateError: string | null;
  generate: () => Promise<void>;
}

export function useItinerary(tripId: string): UseItineraryResult {
  const { getIdToken } = useAuth();
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

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
        const result = await getItinerary(token, tripId);
        if (!cancelled) {
          setItinerary(result);
        }
      } catch (err) {
        if (!cancelled) {
          // A trip with no itinerary yet is expected, not an error state —
          // the page renders a "Generate" prompt for a 404 here instead.
          if (err instanceof ApiClientError && err.status === 404) {
            setItinerary(null);
          } else {
            setError(err instanceof ApiClientError ? err.message : "Couldn't load the itinerary.");
          }
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

  const generate = useCallback(async () => {
    setGenerating(true);
    setGenerateError(null);
    try {
      const token = await getIdToken();
      if (!token) {
        throw new ApiClientError(401, "UNAUTHORIZED", "Your session expired. Please sign in again.");
      }
      const result = await requestGenerateItinerary(token, tripId);
      setItinerary(result);
    } catch (err) {
      setGenerateError(err instanceof ApiClientError ? err.message : "Couldn't generate the itinerary.");
    } finally {
      setGenerating(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);

  return { itinerary, loading, error, generating, generateError, generate };
}
