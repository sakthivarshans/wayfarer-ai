"use client";

import { usePathname, useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { useAuth } from "@/features/auth/AuthContext";
import { getPageTitle } from "./nav-items";

function initialsFrom(email: string): string {
  return email.slice(0, 2).toUpperCase();
}

export function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOutUser } = useAuth();
  const title = getPageTitle(pathname);

  async function handleSignOut() {
    await signOutUser();
    router.push("/login");
  }

  return (
    <header className="flex h-[72px] items-center justify-between px-8">
      <h1 className="text-xl font-bold text-text-heading">{title}</h1>

      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label="Notifications"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-text-body shadow-card transition-colors hover:text-ink-700"
        >
          <Bell className="h-4 w-4" strokeWidth={2} />
        </button>

        {user && (
          <div className="flex items-center gap-3">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-ink-100 text-sm font-semibold text-ink-900">
              {initialsFrom(user.email ?? "?")}
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-surface-page bg-status-success" />
            </div>
            <div className="hidden flex-col leading-tight sm:flex">
              <span className="text-sm font-medium text-text-heading">{user.email}</span>
              <button
                type="button"
                onClick={handleSignOut}
                className="text-left text-xs text-text-muted hover:text-ink-700 hover:underline"
              >
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
