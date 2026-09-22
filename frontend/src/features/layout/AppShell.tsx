import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { MascotGuide } from "@/components/mascot/MascotGuide";
import { MascotNudgeProvider } from "@/components/mascot/MascotNudgeContext";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <MascotNudgeProvider>
      <div className="min-h-screen bg-surface-page">
        <Sidebar />
        <div className="pl-[72px]">
          <Topbar />
          <main className="px-8 pb-10">{children}</main>
        </div>
        <MascotGuide />
      </div>
    </MascotNudgeProvider>
  );
}
