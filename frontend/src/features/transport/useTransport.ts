"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/AuthContext";
import { ApiClientError } from "@/lib/apiClient";
import { getTransport } from "./api";
import type { TransportSummary } from "./types";

interface UseTransportResult {
  transport: TransportSummary | null;
  loading: boolean;
  error: string | null;
}

export function useTransport(tripId: string): UseTransportResult {
  const { getIdToken } = useAuth();
  const [transport, setTransport] = useState<TransportSummary | null>(null);
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
        const result = await getTransport(token, tripId);
        if (!cancelled) {
          setTransport(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiClientError ? err.message : "Couldn't load transport options.");
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

  return { transport, loading, error };
}
