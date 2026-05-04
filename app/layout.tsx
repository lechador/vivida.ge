import type { Metadata } from "next";
import { Noto_Sans_Georgian } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import NextTopLoader from "nextjs-toploader";
import { ChatShell } from "@/components/chat/chat-shell";
import "./globals.css";

const notoGeorgian = Noto_Sans_Georgian({
  variable: "--font-sans",
  subsets: ["georgian", "latin"],
  display: "swap",
});

// Vercel routes vivida.ge → www.vivida.ge with a 307. Using www as the
// canonical here so OG cards and emails skip the redirect hop.
const SITE_URL = "https://www.vivida.ge";

export const metadata: Metadata = {
  title: "Vivida — შენი კოსმიური რუკა",
  description:
    "პერსონალური ასტროლოგია, ყოველდღიური ჰოროსკოპი და ნატალური რუკა შენი დაბადების ზუსტი მომენტის მიხედვით. გაიგე, რას ამბობენ შენზე ვარსკვლავები.",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: "Vivida — შენი კოსმიური რუკა",
    description:
      "პერსონალური ასტროლოგია, ყოველდღიური ჰოროსკოპი და ნატალური რუკა შენი დაბადების ზუსტი მომენტის მიხედვით.",
    url: SITE_URL,
    siteName: "Vivida",
    type: "website",
    locale: "ka_GE",
  },
};

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
// Only load GA in production builds — keeps dev / preview / Storybook out
// of the analytics pipeline (otherwise our own page reloads pollute the
// real numbers). Vercel preview deploys ship as NODE_ENV=production, so
// gate additionally on whether this is the canonical host. Cheap & safe.
const GA_ENABLED =
  !!GA_ID && process.env.NODE_ENV === "production";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ka"
      className={`dark ${notoGeorgian.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <NextTopLoader
          color="oklch(0.78 0.18 305)"
          height={2.5}
          showSpinner={false}
          shadow="0 0 12px oklch(0.78 0.18 305 / 0.6), 0 0 6px oklch(0.78 0.18 305 / 0.4)"
          easing="cubic-bezier(0.22, 1, 0.36, 1)"
          speed={400}
        />
        {children}
        <ChatShell />
      </body>
      {GA_ENABLED && <GoogleAnalytics gaId={GA_ID!} />}
    </html>
  );
}
