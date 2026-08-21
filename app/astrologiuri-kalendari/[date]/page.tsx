import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AstrologyCalendarDetail } from "@/components/seo/astrology-calendar-pages";
import { AstrologyCalendarDetailEn } from "@/components/seo/astrology-calendar-pages-en";
import { AstrologyCalendarDetailAm } from "@/components/seo/astrology-calendar-pages-am";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import {
  calendarDateLabel,
  calendarWindow,
  parseCalendarDate,
} from "@/lib/seo/astrology-calendar";
import { calendarDaySeoEn } from "@/lib/seo/astrology-calendar-en";
import { calendarDateLabelAm } from "@/lib/seo/astrology-calendar-am";
import { ARMENIAN_SITE_URL, DEFAULT_OG_IMAGE, localizedAlternates } from "@/lib/seo/locales";
import { internationalPublicPath } from "@/lib/seo/public-paths";

type Props = { params: Promise<{ date: string }> };
export const revalidate = 86400;

export function generateStaticParams() {
  return calendarWindow().map((day) => ({ date: day.iso }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { date: value } = await params;
  const date = parseCalendarDate(value);
  if (!date) return {};
  const locale = await getRequestLocale();
  const path = `/astrologiuri-kalendari/${value}`;

  if (locale === "am") {
    const label = calendarDateLabelAm(date);
    const title = `${label} — Աստղաբանական կանխատեսում`;
    const description = `${label}. օրվա մոլորակային ասպեկտները, էներգիայի ինդեքսը, բարենպաստ թեմաներն ու գործնական աստղաբանական խորհուրդները:`;
    return {
      title: { absolute: `${title} — Vivida` },
      description,
      alternates: localizedAlternates(`/am${path}`, path, "am"),
      openGraph: {
        images: [DEFAULT_OG_IMAGE],
        type: "article",
        url: `${ARMENIAN_SITE_URL}${internationalPublicPath(path)}`,
        title,
        description,
        locale: "hy_AM",
        siteName: "Vivida",
      },
      twitter: { card: "summary_large_image", title, description },
    };
  }

  if (locale === "en") {
    const { title, description } = calendarDaySeoEn(date);
    return {
      title: { absolute: title },
      description,
      alternates: localizedAlternates(path, path, "en"),
      openGraph: {
        images: [DEFAULT_OG_IMAGE],
        type: "article",
        url: `https://www.vividaastro.com${internationalPublicPath(path)}`,
        title,
        description,
        locale: "en_US",
        siteName: "Vivida",
      },
      twitter: { card: "summary_large_image", title, description },
    };
  }

  const label = calendarDateLabel(date);
  const title = `${label} — დღის ასტროლოგიური პროგნოზი`;
  const description = `${label}: დღის პლანეტარული ასპექტები, იღბლის ინდექსი, ხელსაყრელი და ფრთხილი თემები და პრაქტიკული ასტროლოგიური რჩევები.`;
  const url = `https://www.vivida.ge${path}`;
  return {
    title: { absolute: title },
    description,
    alternates: localizedAlternates(path, path, "ka"),
    openGraph: {
      images: [DEFAULT_OG_IMAGE],
      type: "article",
      url,
      title,
      description,
      locale: "ka_GE",
      siteName: "Vivida",
    },
  };
}

export default async function Page({ params }: Props) {
  const { date: value } = await params;
  const date = parseCalendarDate(value);
  if (!date) notFound();
  const locale = await getRequestLocale();
  if (locale === "am") return <AstrologyCalendarDetailAm date={date} />;
  if (locale === "en") return <AstrologyCalendarDetailEn date={date} />;
  return <AstrologyCalendarDetail date={date} />;
}
