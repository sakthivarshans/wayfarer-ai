"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardHeader } from "@/components/ui/Card";
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

      <Card className="max-w-md">
        <CardHeader title="Connections" />
        <p className="text-sm text-text-body">
          Wayfarer AI doesn&apos;t store any provider API keys per-user — those live in the backend&apos;s own
          configuration. The one thing you connect yourself is your Telegram bot.
        </p>
        <Link
          href="/telegram"
          className="mt-4 inline-block rounded-full border border-surface-border px-4 py-2 text-sm font-medium text-text-body transition-colors hover:border-ink-700 hover:text-ink-700"
        >
          Manage Telegram bot →
        </Link>
      </Card>
    </div>
  );
}
