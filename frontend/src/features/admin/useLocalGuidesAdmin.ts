"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/features/auth/AuthContext";
import { ApiClientError } from "@/lib/apiClient";
import * as api from "./api";
import type { LocalGuide, LocalGuideInput } from "./types";

interface UseLocalGuidesAdminResult {
  guides: LocalGuide[];
  loading: boolean;
  error: string | null;
  create: (input: LocalGuideInput) => Promise<void>;
  update: (guideId: string, input: Partial<LocalGuideInput>) => Promise<void>;
  remove: (guideId: string) => Promise<void>;
}

function messageFor(err: unknown): string {
  return err instanceof ApiClientError ? err.message : "Something went wrong. Please try again.";
}

/** Manages the admin-side CRUD for Local Guide profile cards, refetching the list after every mutation. */
export function useLocalGuidesAdmin(): UseLocalGuidesAdminResult {
  const { getIdToken } = useAuth();
  const [guides, setGuides] = useState<LocalGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getIdToken();
      if (!token) {
        throw new ApiClientError(401, "UNAUTHORIZED", "Your session expired. Please sign in again.");
      }
      setGuides(await api.listLocalGuides(token));
    } catch (err) {
      setError(messageFor(err));
    } finally {
      setLoading(false);
    }
  }, [getIdToken]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function withToken<T>(run: (token: string) => Promise<T>): Promise<T> {
    const token = await getIdToken();
    if (!token) {
      throw new ApiClientError(401, "UNAUTHORIZED", "Your session expired. Please sign in again.");
    }
    return run(token);
  }

  async function create(input: LocalGuideInput): Promise<void> {
    await withToken((token) => api.createLocalGuide(token, input));
    await refresh();
  }

  async function update(guideId: string, input: Partial<LocalGuideInput>): Promise<void> {
    await withToken((token) => api.updateLocalGuide(token, guideId, input));
    await refresh();
  }

  async function remove(guideId: string): Promise<void> {
    await withToken((token) => api.deleteLocalGuide(token, guideId));
    await refresh();
  }

  return { guides, loading, error, create, update, remove };
}
