import localFont from "next/font/local";

// Self-hosted (no runtime CDN dependency) — files vendored from the
// google/fonts OFL repo under src/assets/fonts. See that folder's OFL.txt
// for license. Variable fonts, so a single file covers the weight range.
export const fraunces = localFont({
  src: [
    { path: "../assets/fonts/Fraunces-Variable.ttf", style: "normal" },
    { path: "../assets/fonts/Fraunces-Italic-Variable.ttf", style: "italic" },
  ],
  variable: "--font-fraunces",
  display: "swap",
});

export const generalSans = localFont({
  src: [
    { path: "../assets/fonts/PlusJakartaSans-Variable.ttf", style: "normal" },
    { path: "../assets/fonts/PlusJakartaSans-Italic-Variable.ttf", style: "italic" },
  ],
  variable: "--font-general-sans",
  display: "swap",
});
