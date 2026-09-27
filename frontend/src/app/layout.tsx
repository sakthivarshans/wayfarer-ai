import type { Metadata } from "next";
import "./globals.css";
import { site } from "@/config/site";
import { Providers } from "./providers";
import { fraunces, generalSans } from "@/config/fonts";

export const metadata: Metadata = {
  title: site.name,
  description: site.description,
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${generalSans.variable}`}>
      <body className="min-h-screen bg-surface-page font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
