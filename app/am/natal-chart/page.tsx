import type { Metadata } from "next";

import { NatalChartPageAm } from "@/components/seo/natal-chart-page-am";
import {
  DEFAULT_OG_IMAGE,
  ARMENIAN_SITE_URL,
  localizedAlternates,
} from "@/lib/seo/locales";

const PATH = "/am/natal-chart";
const URL = `${ARMENIAN_SITE_URL}/natal-chart`;
const TITLE = "Ի՞նչ է նատալ քարտեզը. Ծննդյան քարտեզի ուղեցույց սկսնակների համար";
const DESCRIPTION =
  "Իմացեք, թե ինչ է ցույց տալիս նատալ քարտեզը, ինչու է կարևոր ծննդյան ժամը, և ինչպես են մոլորակները, նշանները, տներն ու ասպեկտները միավորվում ծննդյան քարտեզում:";

export const metadata: Metadata = {
  title: { absolute: `${TITLE} — Vivida` },
  description: DESCRIPTION,
  alternates: localizedAlternates(PATH, "/nataluri-ruka", "am"),
  openGraph: {
    images: [DEFAULT_OG_IMAGE],
    title: TITLE,
    description: DESCRIPTION,
    url: URL,
    locale: "hy_AM",
    alternateLocale: ["ka_GE", "en_US"],
  },
};

export default function ArmenianNatalChartPage() {
  return <NatalChartPageAm />;
}
