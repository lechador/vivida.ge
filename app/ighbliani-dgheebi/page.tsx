import type { Metadata } from "next";
import { AstrologyCalendarHub } from "@/components/seo/astrology-calendar-pages";
import {
  AstrologyCalendarHubEn,
  CALENDAR_META_EN,
} from "@/components/seo/astrology-calendar-pages-en";
import {
  AstrologyCalendarHubAm,
  CALENDAR_META_AM,
} from "@/components/seo/astrology-calendar-pages-am";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { ARMENIAN_SITE_URL, DEFAULT_OG_IMAGE, localizedAlternates } from "@/lib/seo/locales";

const title = "იღბლიანი დღეები — უახლოესი ხელსაყრელი თარიღები";
const description =
  "ნახე მომდევნო 90 დღის იღბლიანი და ხელსაყრელი თარიღები პლანეტარული ასპექტების მიხედვით — საქმეებისთვის, სიყვარულისა და ახალი დასაწყისისთვის.";

export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const path = "/ighbliani-dgheebi";

  if (locale === "am") {
    const am = CALENDAR_META_AM.lucky;
    return {
      title: { absolute: `${am.title} — Vivida` },
      description: am.description,
      alternates: localizedAlternates(`/am${path}`, path, "am"),
      openGraph: {
        images: [DEFAULT_OG_IMAGE],
        type: "website",
        url: `${ARMENIAN_SITE_URL}${path}`,
        title: am.title,
        description: am.description,
        locale: "hy_AM",
        siteName: "Vivida",
      },
      twitter: { card: "summary_large_image", title: am.title, description: am.description },
    };
  }

  if (locale === "en") {
    const en = CALENDAR_META_EN.lucky;
    return {
      title: { absolute: en.title },
      description: en.description,
      alternates: localizedAlternates(path, path, "en"),
      openGraph: {
        images: [DEFAULT_OG_IMAGE],
        type: "website",
        url: `https://www.vividaastro.com${path}`,
        title: en.title,
        description: en.description,
        locale: "en_US",
        siteName: "Vivida",
      },
      twitter: { card: "summary_large_image", title: en.title, description: en.description },
    };
  }

  return {
    title: { absolute: title },
    description,
    keywords: ["იღბლიანი დღეები", "იღბლიანი დღე", "ხელსაყრელი დღეები", "კარგი დღე დასაწყისისთვის"],
    alternates: localizedAlternates(path, path, "ka"),
    openGraph: {
      images: [DEFAULT_OG_IMAGE],
      type: "website",
      url: `https://www.vivida.ge${path}`,
      title,
      description,
      locale: "ka_GE",
      siteName: "Vivida",
    },
  };
}

export default async function Page() {
  const locale = await getRequestLocale();
  if (locale === "am") return <AstrologyCalendarHubAm filter="lucky" />;
  if (locale === "en") return <AstrologyCalendarHubEn filter="lucky" />;
  return <AstrologyCalendarHub filter="lucky" />;
}
