import type { Metadata, Viewport } from "next";
import { requestIsEnglish } from "@/lib/i18n/request-locale";
import { ENGLISH_SITE_URL } from "@/lib/seo/locales";
import { Noto_Sans_Georgian } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import { ChatShell } from "@/components/chat/chat-shell";
import { BfcacheRefresher } from "@/components/system/bfcache-refresher";
import { RefCapture } from "@/components/ref-capture";
import { TrackingConsentManager } from "@/components/privacy/tracking-consent-manager";
import "./globals.css";

const notoGeorgian = Noto_Sans_Georgian({
  variable: "--font-sans",
  subsets: ["georgian", "latin"],
  display: "swap",
  // Metric-adjusted fallback (size-adjust/ascent-override) so the system font
  // shown during the swap window occupies the same space as Noto — minimizes
  // the layout shift (CLS) when the web font finishes loading on mobile.
  adjustFontFallback: true,
  fallback: ["system-ui", "-apple-system", "Segoe UI", "sans-serif"],
});

// Vercel routes vivida.ge → www.vivida.ge with a 307. Using www as the
// canonical here so OG cards and emails skip the redirect hop.
const SITE_URL = "https://www.vivida.ge";

const TITLE = "Vivida — შენი კოსმიური რუკა";
const DESCRIPTION =
  "პერსონალური ასტროლოგია, ყოველდღიური ჰოროსკოპი და ნატალური რუკა შენი დაბადების ზუსტი მომენტის მიხედვით. გაიგე, რას ამბობენ შენზე ვარსკვლავები.";

// Fallbacks for the international domain — only surface on pages that set no
// title/description of their own, which would otherwise inherit Georgian.
const TITLE_EN = "Vivida — Natal Charts, Horoscopes and Zodiac Guides";
const DESCRIPTION_EN =
  "Personal astrology, daily horoscopes and a free natal chart built from your exact birth moment. Understand what your chart actually says about you.";

/**
 * Site-wide metadata defaults. Per-page `metadata` exports override these
 * surgically — e.g. /report sets its own `title` while inheriting OG/Twitter.
 *
 * `title.template` lets per-page titles be just the page name; the framework
 * appends "· Vivida" for us. The home page is the lone exception (uses
 * `title.default` directly via `title.absolute` in app/page.tsx) so the
 * brand reads as the primary name in Google's results.
 */
export async function generateMetadata(): Promise<Metadata> {
  const en = await requestIsEnglish();
  const origin = en ? ENGLISH_SITE_URL : SITE_URL;
  const title = en ? TITLE_EN : TITLE;
  const description = en ? DESCRIPTION_EN : DESCRIPTION;

  return {
    // Host-aware so relative canonicals and OG/image URLs in child pages
    // resolve to the domain actually being served, not always vivida.ge.
    metadataBase: new URL(origin),
    title: {
      default: title,
      template: "%s · Vivida",
    },
    description,
    applicationName: "Vivida",
    authors: [{ name: "Vivida" }],
    creator: "Vivida",
    publisher: "Vivida",
    other: {
      "google-adsense-account": "ca-pub-2236599310864557",
    },
    // Deliberately NO `alternates` here. A root-level canonical is inherited
    // by every page that doesn't set its own, which made unrelated pages
    // (e.g. /features, /login) claim to be the Georgian homepage — and on the
    // .com host that pointed the English domain at vivida.ge. Pages own their
    // canonical/hreflang; without one, engines self-canonicalize correctly.
    openGraph: {
      title,
      description,
      url: origin,
      siteName: "Vivida",
      type: "website",
      locale: en ? "en_US" : "ka_GE",
      alternateLocale: en ? ["ka_GE"] : ["en_US"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    category: "lifestyle",
  };
}

/**
 * Viewport + theme color is its own export in Next 16 (split out from
 * `metadata` for clearer typing). The dark theme uses our deep cosmic
 * background — matches `--background` token in globals.css so the
 * Android URL bar and iOS status bar tint blend with the page chrome.
 */
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0b0814" },
    { media: "(prefers-color-scheme: light)", color: "#0b0814" },
  ],
  colorScheme: "dark",
};

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
// Keep analytics and advertising scripts limited to the real production
// deployment. Vercel preview deploys also ship as NODE_ENV=production.
const TRACKING_ENABLED =
  process.env.NODE_ENV === "production" && process.env.VERCEL_ENV === "production";
const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // The same deployment serves two language domains. Resolving the locale on
  // the server puts the correct `lang` in the delivered HTML — the previous
  // inline script only patched it after parse, so crawlers that don't run JS
  // (and every social/AI scraper) saw the English domain declared Georgian.
  const en = await requestIsEnglish();

  return (
    <html
      lang={en ? "en" : "ka"}
      data-scroll-behavior="smooth"
      className={`dark scroll-smooth ${notoGeorgian.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {/* Scroll-reveal sections start opacity:0 and are shown by JS. With
            JS disabled, force them visible so content is never hidden. */}
        <noscript>
          <style>{`.reveal{opacity:1 !important;transform:none !important}`}</style>
        </noscript>
        <a
          href="#main-content"
          className="fixed left-4 top-4 z-[100] -translate-y-24 rounded-xl border border-[var(--vivida-violet)]/60 bg-background px-4 py-2.5 text-sm font-semibold text-foreground shadow-xl transition-transform focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-[var(--vivida-violet)] focus:ring-offset-2 focus:ring-offset-background"
        >
          <span className="locale-ka-only">მთავარ კონტენტზე გადასვლა</span>
          <span className="locale-en-only">Skip to main content</span>
        </a>
        <NextTopLoader
          color="oklch(0.78 0.18 305)"
          height={2.5}
          showSpinner={false}
          shadow="0 0 12px oklch(0.78 0.18 305 / 0.6), 0 0 6px oklch(0.78 0.18 305 / 0.4)"
          easing="cubic-bezier(0.22, 1, 0.36, 1)"
          speed={400}
        />
        <BfcacheRefresher />
        <RefCapture />
        <TrackingConsentManager
          gaId={GA_ID}
          fbPixelId={FB_PIXEL_ID}
          trackingEnabled={TRACKING_ENABLED}
        />
        <div
          id="main-content"
          tabIndex={-1}
          className="flex min-h-0 flex-1 flex-col focus:outline-none"
        >
          {children}
        </div>
        <ChatShell />
      </body>
    </html>
  );
}
