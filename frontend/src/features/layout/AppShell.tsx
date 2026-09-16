import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-page">
      <Sidebar />
      <div className="pl-[72px]">
        <Topbar />
        <main className="px-8 pb-10">{children}</main>
      </div>
    </div>
  );
}
