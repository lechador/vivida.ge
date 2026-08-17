import type { Metadata } from "next";
import { EclipseHub } from "@/components/seo/moon-event-pages";
import { ECLIPSE_META_EN, EclipseHubEn } from "@/components/seo/moon-event-pages-en";
import { ECLIPSE_META_AM, EclipseHubAm } from "@/components/seo/moon-event-pages-am";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { ARMENIAN_SITE_URL, DEFAULT_OG_IMAGE, localizedAlternates } from "@/lib/seo/locales";

export async function generateMetadata(): Promise<Metadata> {
  const path = "/dabnelebebi";
  const locale = await getRequestLocale();

  if (locale === "am") {
    const { title, description } = ECLIPSE_META_AM;
    return {
      title: { absolute: `${title} — Vivida` },
      description,
      keywords: ["խավարումների օրացույց", "արեգակի խավարում", "լուսնի խավարում", "հաջորդ խավարում"],
      alternates: localizedAlternates(`/am${path}`, path, "am"),
      openGraph: {
        images: [DEFAULT_OG_IMAGE],
        title,
        description,
        url: `${ARMENIAN_SITE_URL}${path}`,
        type: "website",
        locale: "hy_AM",
        siteName: "Vivida",
      },
      twitter: { card: "summary_large_image", title, description },
    };
  }

  if (locale === "en") {
    const { title, description } = ECLIPSE_META_EN;
    return {
      title: { absolute: title },
      description,
      keywords: ["eclipse calendar", "solar eclipse", "lunar eclipse", "next eclipse"],
      alternates: localizedAlternates(path, path, "en"),
      openGraph: {
        images: [DEFAULT_OG_IMAGE],
        title,
        description,
        url: `https://www.vividaastro.com${path}`,
        type: "website",
        locale: "en_US",
        siteName: "Vivida",
      },
      twitter: { card: "summary_large_image", title, description },
    };
  }

  const title = "მზისა და მთვარის დაბნელებები — 2026–2028";
  const description =
    "მზისა და მთვარის დაბნელებების თარიღები, ტიპები, ხილვადობა და ცალკეული გზამკვლევები 2026–2028 წლებში NASA-ს მონაცემებით.";
  return {
    title: { absolute: title },
    description,
    alternates: localizedAlternates(path, path, "ka"),
    keywords: ["დაბნელება", "მზის დაბნელება", "მთვარის დაბნელება", "შემდეგი დაბნელება"],
  };
}

export default async function Page() {
  const locale = await getRequestLocale();
  if (locale === "am") return <EclipseHubAm />;
  if (locale === "en") return <EclipseHubEn />;
  return <EclipseHub />;
}
