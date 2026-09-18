"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/features/auth/AuthContext";
import { ApiClientError } from "@/lib/apiClient";
import { connectTelegram as requestConnectTelegram, getTelegramStatus } from "./api";
import type { TelegramConnectionStatus } from "./types";

interface UseTelegramConnectionResult {
  status: TelegramConnectionStatus | null;
  loading: boolean;
  error: string | null;
  connecting: boolean;
  connectError: string | null;
  /** Returns true on success, false on failure (see `connectError`). */
  connect: (botToken: string) => Promise<boolean>;
}

export function useTelegramConnection(): UseTelegramConnectionResult {
  const { getIdToken } = useAuth();
  const [status, setStatus] = useState<TelegramConnectionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);

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
        const result = await getTelegramStatus(token);
        if (!cancelled) {
          setStatus(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiClientError ? err.message : "Couldn't load your Telegram connection.");
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
  }, []);

  const connect = useCallback(
    async (botToken: string): Promise<boolean> => {
      setConnecting(true);
      setConnectError(null);
      try {
        const token = await getIdToken();
        if (!token) {
          throw new ApiClientError(401, "UNAUTHORIZED", "Your session expired. Please sign in again.");
        }
        const result = await requestConnectTelegram(token, botToken);
        setStatus(result);
        return true;
      } catch (err) {
        setConnectError(err instanceof ApiClientError ? err.message : "Couldn't connect your bot.");
        return false;
      } finally {
        setConnecting(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return { status, loading, error, connecting, connectError, connect };
}
