import type { Metadata, Viewport } from "next";
import { Noto_Sans_Georgian } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import NextTopLoader from "nextjs-toploader";
import { ChatShell } from "@/components/chat/chat-shell";
import { AudioPlayerProvider } from "@/components/audio/audio-provider";
import { NowPlayingBar } from "@/components/audio/now-playing-bar";
import { BfcacheRefresher } from "@/components/system/bfcache-refresher";
import { RefCapture } from "@/components/ref-capture";
import { FbPixel } from "@/components/fb-pixel";
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

/**
 * Site-wide metadata defaults. Per-page `metadata` exports override these
 * surgically — e.g. /report sets its own `title` while inheriting OG/Twitter.
 *
 * `title.template` lets per-page titles be just the page name; the framework
 * appends "· Vivida" for us. The home page is the lone exception (uses
 * `title.default` directly via `title.absolute` in app/page.tsx) so the
 * brand reads as the primary name in Google's results.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s · Vivida",
  },
  description: DESCRIPTION,
  applicationName: "Vivida",
  authors: [{ name: "Vivida" }],
  creator: "Vivida",
  publisher: "Vivida",
  other: {
    "google-adsense-account": "ca-pub-2236599310864557",
  },
  // Keywords are mostly ignored by Google but Yandex / Bing still weight
  // them, and the Georgian search ecosystem leans on Yandex more than the
  // English one. Cheap to include; pick the queries we actually want to win.
  keywords: [
    "ნატალური რუკა",
    "ჰოროსკოპი",
    "ჰოროსკოპი ქართულად",
    "ასტროლოგია",
    "კოსმიური რუკა",
    "თავსებადობა",
    "სინასტრია",
    "ზოდიაქო",
    "მზის ნიშანი",
    "მთვარის ნიშანი",
    "ამომავალი ნიშანი",
    "vivida",
  ],
  alternates: {
    canonical: SITE_URL,
    languages: { "ka-GE": SITE_URL },
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "Vivida",
    type: "website",
    locale: "ka_GE",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
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
// Only load GA in production builds — keeps dev / preview / Storybook out
// of the analytics pipeline (otherwise our own page reloads pollute the
// real numbers). Vercel preview deploys ship as NODE_ENV=production, so
// gate additionally on whether this is the canonical host. Cheap & safe.
const GA_ENABLED =
  !!GA_ID && process.env.NODE_ENV === "production";

// Same gate for the Meta Pixel — dev page-reloads would otherwise pollute
// the audience and conversion data the FB ad algorithm trains on.
const FB_PIXEL_ENABLED = process.env.NODE_ENV === "production";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ka"
      data-scroll-behavior="smooth"
      className={`dark scroll-smooth ${notoGeorgian.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* The same deployment serves two language domains. Keep the root
            layout static, but set the document language before the body is
            parsed so shared/authenticated routes on .com are announced as
            English without a hydration flash. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              'if(/(^|\\.)vividaastro\\.com$/i.test(location.hostname)){document.documentElement.lang="en"}',
          }}
        />
      </head>
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
        {FB_PIXEL_ENABLED && <FbPixel />}
        <AudioPlayerProvider>
          <div
            id="main-content"
            tabIndex={-1}
            className="flex min-h-0 flex-1 flex-col focus:outline-none"
          >
            {children}
          </div>
          <ChatShell />
          <NowPlayingBar />
        </AudioPlayerProvider>
      </body>
      {GA_ENABLED && <GoogleAnalytics gaId={GA_ID!} />}
    </html>
  );
}
