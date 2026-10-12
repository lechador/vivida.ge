import Link from "next/link";
import type { Metadata } from "next";

import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import { ChineseYearFinder } from "@/components/calculator/chinese-year-finder";
import {
  CHINESE_HUB_EN,
  ChineseZodiacHubEn,
} from "@/components/seo/chinese-zodiac-en";

import { ensureChineseZodiacHub } from "@/actions/chinese-zodiac";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { CHINESE_ANIMALS, yearsForAnimal } from "@/lib/seo/chinese-zodiac";
import {
  englishSiteHref,
  DEFAULT_OG_IMAGE,
  localizedAlternates,
} from "@/lib/seo/locales";
import { paragraphs } from "@/lib/seo/zodiac-content";

const SITE_URL = "https://www.vivida.ge";
const URL = `${SITE_URL}/chinuri-horoskopi`;

const FALLBACK_TITLE = "ჩინური ჰოროსკოპი, ზოდიაქოს ნიშნები წლების მიხედვით";
const FALLBACK_DESC =
  "ჩინური ჰოროსკოპი ქართულად, გაიგე შენი ცხოველი დაბადების წლის მიხედვით. 12 ნიშანი: ვირთხა, ხარი, ვეფხვი, კურდღელი, დრაკონი, გველი, ცხენი, თხა, მაიმუნი, მამალი, ძაღლი, ღორი.";

export const revalidate = 604800;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  if (locale === "en") {
    const path = "/chinuri-horoskopi";
    return {
      title: { absolute: CHINESE_HUB_EN.title },
      description: CHINESE_HUB_EN.description,
      keywords: [
        "Chinese zodiac",
        "Chinese zodiac signs",
        "Chinese zodiac by year",
        "Chinese horoscope animals",
      ],
      alternates: localizedAlternates(path, path, "en"),
      openGraph: {
        images: [DEFAULT_OG_IMAGE],
        type: "website",
        url: englishSiteHref(path, false),
        title: CHINESE_HUB_EN.title,
        description: CHINESE_HUB_EN.description,
        siteName: "Vivida",
        locale: "en_US",
      },
      twitter: {
        card: "summary_large_image",
        title: CHINESE_HUB_EN.title,
        description: CHINESE_HUB_EN.description,
      },
    };
  }
  const hub = await ensureChineseZodiacHub();
  const title = hub?.pageTitle ?? FALLBACK_TITLE;
  const description = hub?.metaDescription ?? FALLBACK_DESC;
  return {
    title: { absolute: title },
    description,
    alternates: localizedAlternates(
      "/chinuri-horoskopi",
      "/chinuri-horoskopi",
      "ka",
    ),
    openGraph: {
      images: [DEFAULT_OG_IMAGE],
      type: "website",
      url: URL,
      title,
      description,
      siteName: "Vivida",
      locale: "ka_GE",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}


export default async function ChineseZodiacHubPage() {
  const locale = await getRequestLocale();
  if (locale === "en") return <ChineseZodiacHubEn />;

  const hub = await ensureChineseZodiacHub();

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "ჩინური ჰოროსკოპის ნიშნები",
    numberOfItems: CHINESE_ANIMALS.length,
    itemListElement: CHINESE_ANIMALS.map((a, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: a.nameKa,
      url: `${SITE_URL}/chinuri-horoskopi/${a.slug}`,
    })),
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "მთავარი", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "ჩინური ჰოროსკოპი", item: URL },
    ],
  };
  const faqLd =
    hub?.faq && hub.faq.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: hub.faq.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }
      : null;

  return (
    <main className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_220/0.45),transparent_70%),radial-gradient(40%_30%_at_15%_70%,oklch(0.34_0.16_350/0.4),transparent_70%)]"
      />
      <Starfield count={140} shooting={3} />
      <SmartHeader />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      {faqLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      )}

      <section className="relative z-10 mx-auto w-full max-w-4xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-12">
        <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            მთავარი
          </Link>
          <span>/</span>
          <span className="text-foreground/80">ჩინური ჰოროსკოპი</span>
        </nav>

        <header className="text-center">
          <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
            ჩინური{" "}
            <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
              ჰოროსკოპი
            </span>
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-pretty text-base text-foreground/80 sm:text-lg">
            ზოდიაქოს ნიშნები წლების მიხედვით, გაიგე შენი ცხოველი დაბადების წლით
            და აღმოაჩინე მისი ხასიათი, თავსებადობა და მეტი.
          </p>
        </header>

        {/* Year finder */}
        <div className="mx-auto mt-8 max-w-md">
          <ChineseYearFinder />
        </div>

        {/* 12 animals */}
        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {CHINESE_ANIMALS.map((a) => {
            const recent = yearsForAnimal(a.slug).slice(0, 3);
            return (
              <Link
                key={a.slug}
                href={`/chinuri-horoskopi/${a.slug}`}
                className="group flex flex-col items-center gap-2 rounded-2xl border border-border bg-card/55 p-5 text-center ring-1 ring-foreground/5 backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:bg-card/80"
              >
                <span className="text-4xl" aria-hidden>
                  {a.emoji}
                </span>
                <span className="font-semibold tracking-tight">{a.nameKa}</span>
                <span className="text-[11px] tabular-nums text-muted-foreground">
                  {recent.join(" · ")}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Intro / what is it */}
        {hub?.intro && (
          <article className="mt-14 max-w-3xl space-y-4 text-pretty text-base leading-relaxed text-foreground/90 sm:text-lg">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              რა არის ჩინური ჰოროსკოპი
            </h2>
            {paragraphs(hub.intro).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </article>
        )}

        {/* FAQ */}
        {hub?.faq && hub.faq.length > 0 && (
          <section className="mt-12 max-w-3xl">
            <h2 className="mb-5 text-2xl font-semibold tracking-tight sm:text-3xl">
              ხშირად დასმული კითხვები
            </h2>
            <div className="space-y-3">
              {hub.faq.map((item, i) => (
                <details
                  key={i}
                  className="group rounded-2xl border border-border bg-card/55 p-4 ring-1 ring-foreground/5 backdrop-blur-xl transition-colors open:bg-card/80 sm:p-5"
                >
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-base font-medium text-foreground">
                    <span>{item.q}</span>
                    <span
                      aria-hidden
                      className="mt-1 shrink-0 text-xs text-muted-foreground transition-transform group-open:rotate-45"
                    >
                      ✦
                    </span>
                  </summary>
                  <p className="mt-3 text-pretty text-sm leading-relaxed text-foreground/85 sm:text-base">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </section>
        )}

      </section>

      <SiteFooter />
    </main>
  );
}
