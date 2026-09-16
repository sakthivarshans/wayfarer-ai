import type { Metadata } from "next";
import "./globals.css";
import { site } from "@/config/site";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: site.name,
  description: site.description,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-surface-page antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
