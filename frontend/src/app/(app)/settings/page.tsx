"use client";

import { useRouter } from "next/navigation";
import { Card, CardHeader } from "@/components/ui/Card";
import { ComingSoonCard } from "@/components/ui/ComingSoonCard";
import { useAuth } from "@/features/auth/AuthContext";

export default function SettingsPage() {
  const { user, signOutUser } = useAuth();
  const router = useRouter();

  async function handleSignOut() {
    await signOutUser();
    router.push("/login");
  }

  return (
    <div className="flex flex-col gap-6 pt-2">
      <Card className="max-w-md">
        <CardHeader title="Account" />
        <p className="text-sm text-text-body">Signed in as</p>
        <p className="mt-1 text-sm font-medium text-text-heading">{user?.email}</p>
        <button
          type="button"
          onClick={handleSignOut}
          className="mt-4 rounded-full border border-surface-border px-4 py-2 text-sm font-medium text-text-body transition-colors hover:border-ink-700 hover:text-ink-700"
        >
          Sign out
        </button>
      </Card>

      <ComingSoonCard
        title="Preferences & saved API keys"
        description="Managing saved provider preferences and any per-user keys lands here as later phases need it."
      />
    </div>
  );
}
