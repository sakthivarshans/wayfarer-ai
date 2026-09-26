import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { MobileBottomNav } from "./MobileBottomNav";
import { MascotGuide } from "@/components/mascot/MascotGuide";
import { MascotNudgeProvider } from "@/components/mascot/MascotNudgeContext";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <MascotNudgeProvider>
      <div className="min-h-screen bg-surface-page">
        <Sidebar />
        <div className="md:pl-[72px]">
          <Topbar />
          <main className="px-4 pb-20 sm:px-8 md:pb-10">{children}</main>
        </div>
        <MobileBottomNav />
        <MascotGuide />
      </div>
    </MascotNudgeProvider>
  );
}
