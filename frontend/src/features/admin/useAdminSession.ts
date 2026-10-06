"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/AuthContext";
import { getAdminSession } from "./api";

interface UseAdminSessionResult {
  /** `null` while still loading, so callers can tell "unknown yet" from "known false". */
  isAdmin: boolean | null;
  loading: boolean;
}

/**
 * Asks the backend whether the signed-in user is an admin. Used to decide
 * whether to show the Admin link in Settings and to gate the /admin page —
 * the actual enforcement is server-side (every /api/admin/* route re-checks
 * independently), this is purely a UI convenience.
 */
export function useAdminSession(): UseAdminSessionResult {
  const { user, getIdToken } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!user) {
        if (!cancelled) {
          setIsAdmin(false);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      try {
        const token = await getIdToken();
        const session = token ? await getAdminSession(token) : { isAdmin: false };
        if (!cancelled) {
          setIsAdmin(session.isAdmin);
        }
      } catch {
        // A failed check should never grant access — fail closed.
        if (!cancelled) {
          setIsAdmin(false);
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
  }, [user]);

  return { isAdmin, loading };
}
