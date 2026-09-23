"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/features/auth/AuthContext";
import { AppShell } from "@/features/layout/AppShell";
import { PageLoading } from "@/components/ui/PageLoading";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-page">
        <PageLoading />
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}
