import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { MoonPhaseDetail } from "@/components/seo/moon-event-pages";
import { moonEventForDate, moonEvents } from "@/lib/seo/moon-events";
import { MoonPhaseDetailEn } from "@/components/seo/moon-event-pages-en";

import { getRequestLocale } from "@/lib/i18n/request-locale";

import {
  englishSiteHref,
  DEFAULT_OG_IMAGE,
  localizedAlternates,
} from "@/lib/seo/locales";

type Props = { params: Promise<{ date: string }> };
export const revalidate = 86400;

export function generateStaticParams() {
  return moonEvents("full").map((e) => ({ date: e.iso }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { date } = await params;
  const e = moonEventForDate("full", date);
  if (!e) return {};
  const path = `/savse-mtvare/${date}`;
  const locale = await getRequestLocale();

  if (locale === "en") {
    const label = new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Tbilisi",
    }).format(e.date);
    const title = `Full Moon on ${label}: Time and Zodiac Sign`;
    const description = `${label} Full Moon in ${e.snapshot.signEn}: exact Tbilisi time, illumination, astronomical data, and astrological meaning.`;
    return {
      title: { absolute: title },
      description,
      alternates: localizedAlternates(path, path, "en"),
      openGraph: {
        images: [DEFAULT_OG_IMAGE],
        title,
        description,
        url: englishSiteHref(path, false),
        type: "article",
        locale: "en_US",
        siteName: "Vivida",
      },
      twitter: { card: "summary_large_image", title, description },
    };
  }
  const title = `სავსე მთვარე ${e.label} — დრო და ნიშანი`;
  const description = `${e.label} სავსე მთვარე ${e.snapshot.signKa}-ში: ზუსტი თბილისის დრო, განათება, ასტრონომიული მონაცემები და ასტროლოგიური მნიშვნელობა.`;
  return {
    title: { absolute: title },
    description,
    alternates: localizedAlternates(path, path, "ka"),
  };
}

export default async function Page({ params }: Props) {
  const { date } = await params;
  const e = moonEventForDate("full", date);
  if (!e) notFound();
  const locale = await getRequestLocale();
  if (locale === "en") return <MoonPhaseDetailEn event={e} />;
  return <MoonPhaseDetail event={e} />;
}
