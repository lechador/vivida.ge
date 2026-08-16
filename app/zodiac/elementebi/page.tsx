import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PopularSearches } from "@/components/seo/popular-searches";
import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import {
  ELEMENTS_HUB_CONTENT,
  SIGNS_CONTENT,
  paragraphs,
} from "@/lib/seo/zodiac-content";
import {
  ALL_ELEMENT_SLUGS,
  ELEMENT_LABEL_KA,
  SIGNS_BY_ELEMENT,
  signMetaBySlug,
  type ElementSlug,
} from "@/lib/seo/zodiac-dates";
import { ELEMENTS_HUB_LATIN_QUERIES } from "@/lib/seo/transliteration";
import { signColor } from "@/lib/zodiac";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { ZodiacElementsHubEn } from "@/components/seo/zodiac-elements-en";
import { DEFAULT_OG_IMAGE, localizedAlternates } from "@/lib/seo/locales";

const SITE_URL = "https://www.vivida.ge";
const PATH = "/zodiac/elementebi";

const ELEMENT_ACCENT: Record<ElementSlug, string> = {
  fire: "oklch(0.72 0.22 30)",
  earth: "oklch(0.65 0.13 130)",
  air: "oklch(0.78 0.16 220)",
  water: "oklch(0.65 0.20 285)",
};

const ELEMENT_GLYPH: Record<ElementSlug, string> = {
  fire: "△",
  earth: "▽",
  air: "△",
  water: "▽",
};

const BLURB_KEY: Record<ElementSlug, "fireBlurb" | "earthBlurb" | "airBlurb" | "waterBlurb"> = {
  fire: "fireBlurb",
  earth: "earthBlurb",
  air: "airBlurb",
  water: "waterBlurb",
};

export async function generateMetadata(): Promise<Metadata> {
  if ((await getRequestLocale()) === "en") {
    const title = "The Four Zodiac Elements: Fire, Earth, Air and Water";
    const description = "Understand the four zodiac elements and their signs, personality traits, strengths, challenges, love style, career patterns, and compatibility.";
    return { title: { absolute: title }, description, alternates: localizedAlternates(PATH, PATH, "en"), openGraph: { images: [DEFAULT_OG_IMAGE], type: "website", url: "https://www.vividaastro.com/zodiac/elementebi", title, description, siteName: "Vivida", locale: "en_US" }, twitter: { card: "summary_large_image", title, description } };
  }
  return ELEMENTS_HUB_CONTENT ? {
      title: { absolute: ELEMENTS_HUB_CONTENT.pageTitle },
      description: ELEMENTS_HUB_CONTENT.metaDescription,
      alternates: localizedAlternates(PATH, PATH, "ka"),
      openGraph: {
        images: [DEFAULT_OG_IMAGE],
        type: "website",
        url: `${SITE_URL}${PATH}`,
        title: ELEMENTS_HUB_CONTENT.pageTitle,
        description: ELEMENTS_HUB_CONTENT.metaDescription,
        siteName: "Vivida",
        locale: "ka_GE",
      },
      twitter: {
        card: "summary_large_image",
        title: ELEMENTS_HUB_CONTENT.pageTitle,
        description: ELEMENTS_HUB_CONTENT.metaDescription,
      },
    } : {};
}

export default async function ElementsHubPage() {
  if ((await getRequestLocale()) === "en") return <ZodiacElementsHubEn />;
  if (!ELEMENTS_HUB_CONTENT) notFound();
  const c = ELEMENTS_HUB_CONTENT;

  const hubLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: c.pageTitle,
    description: c.metaDescription,
    url: `${SITE_URL}${PATH}`,
    inLanguage: "ka-GE",
    mainEntity: {
      "@type": "ItemList",
      itemListElement: ALL_ELEMENT_SLUGS.map((el, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}${PATH}/${el}`,
        name: ELEMENT_LABEL_KA[el],
      })),
    },
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: c.faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ცის ნიშნები", item: `${SITE_URL}/zodiac` },
      { "@type": "ListItem", position: 2, name: "ელემენტები", item: `${SITE_URL}${PATH}` },
    ],
  };

  return (
    <main className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_220/0.45),transparent_70%),radial-gradient(40%_30%_at_15%_70%,oklch(0.34_0.16_350/0.4),transparent_70%)]"
      />
      <Starfield count={130} shooting={3} />
      <SmartHeader />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(hubLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <section className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-12">
        <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/zodiac" className="hover:text-foreground">ცის ნიშნები</Link>
          <span>/</span>
          <span className="text-foreground/80">ელემენტები</span>
        </nav>

        <div className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          ცის ელემენტები
        </div>
        <h1 className="mb-4 text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
          {c.h1}
        </h1>
        <p className="max-w-2xl text-pretty text-lg text-muted-foreground">
          {c.tagline}
        </p>

        <div className="mt-12 max-w-3xl space-y-4 text-pretty text-base leading-relaxed text-foreground/90 sm:text-lg">
          {paragraphs(c.intro).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        {/* Element cards */}
        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {ALL_ELEMENT_SLUGS.map((el) => {
            const accent = ELEMENT_ACCENT[el];
            const blurb = c[BLURB_KEY[el]];
            const signs = SIGNS_BY_ELEMENT[el];
            return (
              <Link
                key={el}
                href={`${PATH}/${el}`}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card/65 p-6 ring-1 ring-foreground/5 backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:bg-card/80 hover:ring-foreground/15"
              >
                <div
                  aria-hidden
                  className="absolute -right-16 -top-16 size-48 rounded-full opacity-30 blur-3xl transition-opacity group-hover:opacity-50"
                  style={{
                    background: `radial-gradient(circle, ${accent} 0%, transparent 70%)`,
                  }}
                />
                <div className="relative flex items-center gap-3">
                  <span
                    className="grid size-10 place-items-center rounded-xl text-xl"
                    style={{
                      background: `color-mix(in oklch, ${accent} 18%, transparent)`,
                      boxShadow: `inset 0 0 0 1px color-mix(in oklch, ${accent} 35%, transparent)`,
                      color: accent,
                    }}
                  >
                    {ELEMENT_GLYPH[el]}
                  </span>
                  <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                    {ELEMENT_LABEL_KA[el]}
                  </h2>
                </div>
                <p className="relative mt-4 text-pretty text-sm leading-relaxed text-foreground/85 sm:text-base">
                  {blurb}
                </p>
                <div className="relative mt-4 flex flex-wrap gap-2">
                  {signs.map((slug) => {
                    const sc = SIGNS_CONTENT[slug];
                    const meta = signMetaBySlug(slug);
                    const sa = meta ? signColor(meta) : accent;
                    return (
                      <span
                        key={slug}
                        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/40 px-2.5 py-1 text-xs"
                      >
                        <span style={{ color: sa }}>{sc.symbol}</span>
                        {sc.labelKa}
                      </span>
                    );
                  })}
                </div>
              </Link>
            );
          })}
        </div>

        {/* FAQ */}
        <section className="mt-16 max-w-3xl">
          <h2 className="mb-5 text-2xl font-semibold tracking-tight sm:text-3xl">
            ხშირად დასმული კითხვები
          </h2>
          <div className="space-y-3">
            {c.faq.map((item, i) => (
              <details
                key={i}
                className="group rounded-2xl border border-border bg-card/55 p-4 ring-1 ring-foreground/5 backdrop-blur-xl transition-colors open:bg-card/80 sm:p-5"
              >
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-base font-medium text-foreground">
                  <span>{item.q}</span>
                  <span aria-hidden className="mt-1 shrink-0 text-xs text-muted-foreground transition-transform group-open:rotate-45">✦</span>
                </summary>
                <p className="mt-3 text-pretty text-sm leading-relaxed text-foreground/85 sm:text-base">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <div className="mt-16 rounded-2xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/12 via-card/60 to-[var(--vivida-cyan)]/12 p-7 text-center ring-1 ring-foreground/5 backdrop-blur-xl sm:p-10">
          <Sparkles className="mx-auto mb-3 size-7 text-[var(--vivida-violet)]" />
          <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            ნახე შენი ელემენტი ცოცხალ რუკაში
          </h2>
          <p className="mx-auto mt-3 max-w-md text-pretty text-base text-muted-foreground">
            შენი ელემენტური ბალანსი — ცეცხლი, მიწა, ჰაერი, წყალი — ნატალურ
            რუკაშია. ერთი წუთში დაიწყე უფასოდ.
          </p>
          <Button asChild variant="mystic" size="lg" className="mt-6">
            <Link href="/signup">დაიწყე უფასოდ</Link>
          </Button>
        </div>

        <PopularSearches queries={ELEMENTS_HUB_LATIN_QUERIES} />
      </section>

      <SiteFooter />
    </main>
  );
}
