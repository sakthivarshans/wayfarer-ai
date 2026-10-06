"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PageLoading } from "@/components/ui/PageLoading";
import { ErrorState } from "@/components/ui/ErrorState";
import { AnalyticsSummaryCards } from "@/features/admin/AnalyticsSummaryCards";
import { LocalGuideForm } from "@/features/admin/LocalGuideForm";
import { LocalGuideList } from "@/features/admin/LocalGuideList";
import { useAdminSession } from "@/features/admin/useAdminSession";
import { useAnalytics } from "@/features/admin/useAnalytics";
import { useLocalGuidesAdmin } from "@/features/admin/useLocalGuidesAdmin";
import type { LocalGuide } from "@/features/admin/types";

/**
 * Client-side gate only — a UI convenience, not the actual security
 * boundary. Every /api/admin/* call re-checks admin status server-side
 * regardless of what this page renders, so there's no real access gained
 * by bypassing this redirect.
 */
export default function AdminPage() {
  const router = useRouter();
  const { isAdmin, loading: sessionLoading } = useAdminSession();
  const { analytics, loading: analyticsLoading, error: analyticsError } = useAnalytics();
  const { guides, create, update, remove } = useLocalGuidesAdmin();
  const [editingGuide, setEditingGuide] = useState<LocalGuide | null>(null);

  useEffect(() => {
    if (!sessionLoading && isAdmin === false) {
      router.replace("/");
    }
  }, [sessionLoading, isAdmin, router]);

  if (sessionLoading || isAdmin === null) {
    return (
      <div className="flex justify-center pt-10">
        <PageLoading />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="space-y-8 pt-2">
      <section>
        <h2 className="mb-4 font-display text-lg font-medium text-text-heading">Analytics</h2>
        {analyticsLoading && <PageLoading />}
        {analyticsError && <ErrorState message={analyticsError} />}
        {analytics && <AnalyticsSummaryCards analytics={analytics} />}
      </section>

      <section>
        <h2 className="mb-4 font-display text-lg font-medium text-text-heading">Local guides</h2>
        <div className="space-y-4">
          <LocalGuideForm
            editingGuide={editingGuide}
            onCreate={create}
            onUpdate={async (id, input) => {
              await update(id, input);
              setEditingGuide(null);
            }}
            onCancelEdit={() => setEditingGuide(null)}
          />
          <LocalGuideList guides={guides} onEdit={setEditingGuide} onDelete={remove} />
        </div>
      </section>
    </div>
  );
}
