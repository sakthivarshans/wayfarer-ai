"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Send, User } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/features/auth/AuthContext";

function SectionHeading({ icon: Icon, title }: { icon: typeof User; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sand-100 text-sand-800">
        <Icon className="h-5 w-5" strokeWidth={2} />
      </div>
      <h2 className="font-display text-lg font-medium text-text-heading">{title}</h2>
    </div>
  );
}

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
        <SectionHeading icon={User} title="Account" />
        <p className="mt-4 text-sm text-text-body">Signed in as</p>
        <p className="mt-1 text-sm font-medium text-text-heading">{user?.email}</p>
        <button
          type="button"
          onClick={handleSignOut}
          className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-surface-border px-4 py-2 text-sm font-medium text-text-body transition-colors hover:border-ink-700 hover:text-ink-700"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </button>
      </Card>

      <Card className="max-w-md">
        <SectionHeading icon={Send} title="Connections" />
        <p className="mt-4 text-sm text-text-body">
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
