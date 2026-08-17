import type { Metadata } from "next";

import { ZodiacHubAm } from "@/components/seo/zodiac-hub-am";
import {
  DEFAULT_OG_IMAGE,
  ARMENIAN_SITE_URL,
  localizedAlternates,
} from "@/lib/seo/locales";

const PATH = "/am/zodiac";
const TITLE = "Կենդանակերպի 12 նշանները. Տարերքներ, որակներ և կառավարիչներ";
const DESCRIPTION =
  "Պարզ հայերեն ուղեցույց կենդանակերպի բոլոր 12 նշանների, դրանց ամսաթվերի, տարերքների, որակների և ավանդական կառավարող մոլորակների մասին:";

export const metadata: Metadata = {
  title: { absolute: `${TITLE} — Vivida` },
  description: DESCRIPTION,
  alternates: localizedAlternates(PATH, "/zodiac", "am"),
  openGraph: {
    images: [DEFAULT_OG_IMAGE],
    title: TITLE,
    description: DESCRIPTION,
    url: `${ARMENIAN_SITE_URL}/zodiac`,
    locale: "hy_AM",
    alternateLocale: ["ka_GE", "en_US"],
  },
};

export default function ArmenianZodiacPage() {
  return <ZodiacHubAm />;
}
