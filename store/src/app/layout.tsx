import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { INTRO_DECIDE_SCRIPT } from "@/lib/intro";
import { getSettings } from "@/lib/settings";
import { siteUrl } from "@/lib/utils";
import "./globals.css";

// Fonts are self-hosted from npm packages: no runtime or build-time requests to Google.
const manrope = localFont({
  src: "../../node_modules/@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2",
  weight: "200 800",
  variable: "--font-manrope",
  display: "swap",
});
const cormorant = localFont({
  src: [
    { path: "../../node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-300-normal.woff2", weight: "300", style: "normal" },
    { path: "../../node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-300-italic.woff2", weight: "300", style: "italic" },
    { path: "../../node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../../node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-400-italic.woff2", weight: "400", style: "italic" },
    { path: "../../node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../../node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-500-italic.woff2", weight: "500", style: "italic" },
  ],
  variable: "--font-cormorant",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const description = "Premium men's crossbody, shoulder and hand-carry bags. Delivery across Lebanon, Cash on Delivery or Wish Money.";
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: `${s.storeName} — ${s.tagline}`, template: `%s — ${s.storeName}` },
    description,
    applicationName: s.storeName,
    openGraph: { type: "website", siteName: s.storeName, locale: "en_LB", description },
    twitter: { card: "summary_large_image" },
    icons: s.logoUrl ? { icon: s.logoUrl } : undefined,
  };
}

export const viewport: Viewport = {
  themeColor: "#0e0e0d",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: the pre-paint script below adds data-* attributes to <html>
    <html lang="en" className={`${manrope.variable} ${cormorant.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: INTRO_DECIDE_SCRIPT }} />
      </head>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
