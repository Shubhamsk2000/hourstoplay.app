import type { Metadata, Viewport } from "next";
import { Oswald, Inter } from "next/font/google";
import Script from "next/script";
import { notFound } from "next/navigation";
import "../globals.css";
import { LANGS, SITE, type Lang } from "@/lib/site";

const oswald = Oswald({ weight: ["500", "700"], subsets: ["latin"], variable: "--font-oswald", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  applicationName: SITE.name,
  authors: [{ name: SITE.name }],
  formatDetection: { telephone: false },
  appleWebApp: { title: SITE.name, statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#0b0b10",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}
export const dynamicParams = false;

const PLAUSIBLE = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!(LANGS as string[]).includes(lang)) notFound();
  return (
    <html lang={lang as Lang} className={`${oswald.variable} ${inter.variable}`}>
      <body className="antialiased">
        {children}
        {PLAUSIBLE && (
          <Script
            defer
            data-domain={PLAUSIBLE}
            src="https://plausible.io/js/script.tagged-events.outbound-links.js"
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
