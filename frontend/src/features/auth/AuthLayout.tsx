import type { ReactNode } from "react";
import { AuthBackdrop } from "./AuthBackdrop";
import { Logo } from "@/components/ui/Logo";

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-12">
      <AuthBackdrop />

      {/* Floating card, riffing on the destination-search sheet treatment:
          near-white, softly blurred, rounded, shadowed — reads as one
          coherent surface floating over the photo, not a boxed form. */}
      <div className="relative w-full max-w-sm rounded-card bg-white/90 p-8 shadow-warm backdrop-blur-md">
        <Logo markClassName="h-9 w-9" textClassName="text-2xl" />
        <h1 className="mt-5 font-display text-2xl font-medium text-text-heading">{title}</h1>
        <p className="mt-1 text-sm text-text-body">{subtitle}</p>
        <div className="mt-6">{children}</div>
        <p className="mt-6 text-center text-sm text-text-muted">{footer}</p>
      </div>
    </main>
  );
}
