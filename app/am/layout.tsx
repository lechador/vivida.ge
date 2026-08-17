import type { Metadata } from "next";

import { ARMENIAN_SITE_URL } from "@/lib/seo/locales";

export const metadata: Metadata = {
  metadataBase: new URL(ARMENIAN_SITE_URL),
  title: {
    default: "Vivida հայերեն — Նատալ քարտեզներ և աստղաբանություն",
    template: "%s · Vivida",
  },
  description:
    "Բացահայտեք նատալ քարտեզները, կենդանակերպի նշանները, հորոսկոպները, համատեղելիությունը և ինքնաճանաչման գործիքները Vivida-ի հայերեն ուղեցույցներով:",
  openGraph: {
    siteName: "Vivida",
    locale: "hy_AM",
    alternateLocale: ["ka_GE", "en_US"],
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

/**
 * No `lang` patching here on purpose.
 *
 * The root layout resolves the locale server-side and emits `lang="hy"` in the
 * delivered HTML. An inline script only rewrote it after parse, which every
 * crawler and social scraper that doesn't run JS never saw — the same defect
 * that was removed from the English side on 2026-08-14.
 */
export default function ArmenianLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
