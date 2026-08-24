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
import { internationalPublicPath } from "@/lib/seo/public-paths";

const title = "ფრთხილი დღეები — როდის გვჭირდება მეტი ყურადღება";
const description =
  "მომდევნო 30 დღის ფრთხილი თარიღები დაძაბული პლანეტარული ასპექტების მიხედვით — დაგეგმვის, გადამოწმებისა და მშვიდი რეაგირებისთვის.";

export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const path = "/frtxili-dgheebi";

  if (locale === "am") {
    const am = CALENDAR_META_AM.careful;
    return {
      title: { absolute: `${am.title} — Vivida` },
      description: am.description,
      alternates: localizedAlternates(`/am${path}`, path, "am"),
      openGraph: {
        images: [DEFAULT_OG_IMAGE],
        type: "website",
        url: `${ARMENIAN_SITE_URL}${internationalPublicPath(path)}`,
        title: am.title,
        description: am.description,
        locale: "hy_AM",
        siteName: "Vivida",
      },
      twitter: { card: "summary_large_image", title: am.title, description: am.description },
    };
  }

  if (locale === "en") {
    const en = CALENDAR_META_EN.careful;
    return {
      title: { absolute: en.title },
      description: en.description,
      alternates: localizedAlternates(path, path, "en"),
      openGraph: {
        images: [DEFAULT_OG_IMAGE],
        type: "website",
        url: `https://www.vividaastro.com${internationalPublicPath(path)}`,
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
    keywords: ["ფრთხილი დღეები", "არახელსაყრელი დღეები", "რთული დღეები", "ასტროლოგიური პროგნოზი"],
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
  if (locale === "am") return <AstrologyCalendarHubAm filter="careful" />;
  if (locale === "en") return <AstrologyCalendarHubEn filter="careful" />;
  return <AstrologyCalendarHub filter="careful" />;
}
