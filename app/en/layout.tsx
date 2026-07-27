import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Vivida in English — Natal Charts and Astrology",
    template: "%s · Vivida",
  },
  description:
    "Explore natal charts, zodiac signs, horoscopes, compatibility and self-discovery tools with Vivida's English guides.",
  openGraph: {
    siteName: "Vivida",
    locale: "en_US",
    alternateLocale: ["ka_GE"],
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export default function EnglishLayout({ children }: { children: React.ReactNode }) {
  return children;
}
