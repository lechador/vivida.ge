import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import { Button } from "@/components/ui/button";
import { ChineseAnimalPageEn } from "@/components/seo/chinese-zodiac-en";

import { ensureChineseZodiac } from "@/actions/chinese-zodiac";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import {
  ALL_CHINESE_SLUGS,
  CHINESE_ANIMALS,
  chineseAnimalBySlug,
  yearsForAnimal,
} from "@/lib/seo/chinese-zodiac";
import { chineseZodiacContentEnBySlug } from "@/lib/seo/chinese-zodiac-en";

import {
  englishSiteHref,
  ENGLISH_SITE_URL,
  localizedAlternates,
} from "@/lib/seo/locales";
import { paragraphs } from "@/lib/seo/zodiac-content";

const SITE_URL = "https://www.vivida.ge";
const LEVEL_COLOR: Record<string, string> = {
  ძლიერი: "var(--vivida-cyan)",
  ჰარმონიული: "var(--vivida-violet)",
  გამომწვევი: "var(--vivida-pink)",
};

export const revalidate = 604800;

export function generateStaticParams() {
  return ALL_CHINESE_SLUGS.map((animal) => ({ animal }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ animal: string }>;
}): Promise<Metadata> {
  const { animal: slug } = await params;
  const animal = chineseAnimalBySlug(slug);
  if (!animal) return {};
  const locale = await getRequestLocale();

  if (locale === "en") {
    const content = chineseZodiacContentEnBySlug(slug);
    if (!content) return {};
    const path = `/chinuri-horoskopi/${slug}`;
    const title = `${animal.nameEn} Chinese Zodiac: Years, Personality and Compatibility`;
    const description = `${content.headline}. Discover ${animal.nameEn} birth years, personality traits, strengths, love compatibility, and career style.`;
    const ogEn = `${ENGLISH_SITE_URL}/api/og/page?t=${encodeURIComponent(animal.nameEn)}&k=${encodeURIComponent("Chinese zodiac")}`;
    return {
      title: { absolute: title },
      description,
      alternates: localizedAlternates(path, path, "en"),
      openGraph: {
        type: "article",
        url: englishSiteHref(path, false),
        title,
        description,
        siteName: "Vivida",
        locale: "en_US",
        images: [{ url: ogEn, width: 1200, height: 630 }],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [ogEn],
      },
    };
  }
  const content = await ensureChineseZodiac(slug);
  const url = `${SITE_URL}/chinuri-horoskopi/${slug}`;
  const title = content?.pageTitle ?? `${animal.nameKa} — ჩინური ჰოროსკოპი`;
  const description =
    content?.metaDescription ??
    `${animal.nameKa} ჩინური ჰოროსკოპის ნიშანი — ხასიათი, დაბადების წლები და თავსებადობა, ქართულად.`;
  const og = `${SITE_URL}/api/og/page?t=${encodeURIComponent(animal.nameKa)}&k=${encodeURIComponent("ჩინური ჰოროსკოპი")}`;
  return {
    title: { absolute: title },
    description,
    alternates: localizedAlternates(
      `/chinuri-horoskopi/${slug}`,
      `/chinuri-horoskopi/${slug}`,
      "ka",
    ),
    openGraph: {
      type: "article",
      url,
      title,
      description,
      siteName: "Vivida",
      locale: "ka_GE",
      images: [{ url: og, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title, description, images: [og] },
  };
}

export default async function ChineseAnimalPage({
  params,
}: {
  params: Promise<{ animal: string }>;
}) {
  const { animal: slug } = await params;
  const animal = chineseAnimalBySlug(slug);
  if (!animal) notFound();

  const locale = await getRequestLocale();
  if (locale === "en") {
    const content = chineseZodiacContentEnBySlug(slug);
    if (!content) notFound();
    return <ChineseAnimalPageEn animal={animal} content={content} />;
  }

  const c = await ensureChineseZodiac(slug);
  const years = yearsForAnimal(slug);

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: c?.pageTitle ?? `${animal.nameKa} — ჩინური ჰოროსკოპი`,
    description: c?.metaDescription ?? "",
    inLanguage: "ka-GE",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/chinuri-horoskopi/${slug}`,
    },
    author: { "@type": "Organization", name: "Vivida", url: SITE_URL },
    publisher: { "@type": "Organization", name: "Vivida", url: SITE_URL },
  };
  const faqLd =
    c?.faq && c.faq.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: c.faq.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }
      : null;
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "მთავარი", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "ჩინური ჰოროსკოპი",
        item: `${SITE_URL}/chinuri-horoskopi`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: animal.nameKa,
        item: `${SITE_URL}/chinuri-horoskopi/${slug}`,
      },
    ],
  };

  return (
    <main className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_220/0.45),transparent_70%),radial-gradient(40%_30%_at_15%_70%,oklch(0.34_0.16_350/0.4),transparent_70%)]"
      />
      <Starfield count={120} shooting={3} />
      <SmartHeader />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      {faqLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <section className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-12">
        <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/chinuri-horoskopi" className="hover:text-foreground">
            ჩინური ჰოროსკოპი
          </Link>
          <span>/</span>
          <span className="text-foreground/80">{animal.nameKa}</span>
        </nav>

        {/* Hero */}
        <article className="relative overflow-hidden rounded-3xl border border-border bg-card/65 p-6 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-10">
          <div
            aria-hidden
            className="absolute -right-20 -top-20 size-72 rounded-full bg-[radial-gradient(circle,var(--vivida-violet)/0.3,transparent_70%)] opacity-40 blur-3xl"
          />
          <div className="relative flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <div className="grid size-20 shrink-0 place-items-center rounded-3xl bg-[var(--vivida-violet)]/12 text-6xl ring-1 ring-[var(--vivida-violet)]/30">
              {animal.emoji}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                ჩინური ჰოროსკოპი · {animal.element} · {animal.polarity}
              </div>
              <h1 className="mt-1 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
                {animal.nameKa}
              </h1>
              {c?.headline && (
                <p className="mt-3 max-w-xl text-pretty text-base text-foreground/85 sm:text-lg">
                  {c.headline}
                </p>
              )}
            </div>
          </div>
        </article>

        {/* Years */}
        <section className="mt-8">
          <div className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            დაბადების წლები
          </div>
          <div className="flex flex-wrap gap-2">
            {years.map((y) => (
              <span
                key={y}
                className="inline-flex items-center rounded-full border border-border bg-card/55 px-3 py-1 text-sm tabular-nums text-foreground/85"
              >
                {y}
              </span>
            ))}
          </div>
        </section>

        {/* Intro / personality */}
        {c?.intro && <Prose className="mt-8" body={c.intro} />}
        {c?.personality && <Section title="ხასიათი" body={c.personality} />}

        {/* Strengths / weaknesses */}
        {c?.strengths?.length || c?.weaknesses?.length ? (
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {c?.strengths && c.strengths.length > 0 && (
              <Traits
                title="ძლიერი მხარეები"
                items={c.strengths}
                color="var(--vivida-cyan)"
              />
            )}
            {c?.weaknesses && c.weaknesses.length > 0 && (
              <Traits
                title="გამოწვევები"
                items={c.weaknesses}
                color="var(--vivida-pink)"
              />
            )}
          </div>
        ) : null}

        {c?.love && <Section title="სიყვარული და ურთიერთობები" body={c.love} />}
        {c?.career && <Section title="კარიერა და ფული" body={c.career} />}

        {/* Compatibility */}
        {c?.compatibility && c.compatibility.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-4 text-2xl font-semibold tracking-tight sm:text-3xl">
              თავსებადობა
            </h2>
            <ul className="space-y-3">
              {c.compatibility.map((item, i) => {
                const other = chineseAnimalBySlug(item.slug);
                if (!other) return null;
                const color = LEVEL_COLOR[item.level] ?? "var(--vivida-violet)";
                return (
                  <li key={i}>
                    <Link
                      href={`/chinuri-horoskopi/${item.slug}`}
                      className="flex items-start gap-3 rounded-2xl border border-border bg-card/55 p-4 ring-1 ring-foreground/5 backdrop-blur-xl transition-colors hover:bg-card/80"
                    >
                      <span className="text-2xl" aria-hidden>
                        {other.emoji}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{other.nameKa}</span>
                          <span
                            className="rounded-full px-2 py-0.5 text-[11px] font-medium"
                            style={{
                              color,
                              background: `color-mix(in oklch, ${color} 15%, transparent)`,
                            }}
                          >
                            {item.level}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-foreground/80">
                          {item.note}
                        </p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {/* FAQ */}
        {c?.faq && c.faq.length > 0 && (
          <section className="mt-12">
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

        {/* CTA → natal calculator */}
        <div className="mt-14 rounded-2xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/12 via-card/60 to-[var(--vivida-cyan)]/12 p-7 text-center ring-1 ring-foreground/5 backdrop-blur-xl sm:p-10">
          <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            იცი შენი დასავლური ნიშანიც?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-pretty text-base text-muted-foreground">
            ჩინური ნიშანი წელს ეფუძნება — დასავლური ნატალური რუკა კი დაბადების
            ზუსტ წამს. გამოთვალე შენი რუკა უფასოდ.
          </p>
          <Button asChild variant="mystic" size="lg" className="mt-6">
            <Link href="/nataluri-ruka">ჩემი ნატალური რუკა</Link>
          </Button>
        </div>

        {/* Other animals */}
        <section className="mt-14">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
            სხვა ცხოველები
          </h2>
          <div className="flex flex-wrap gap-2">
            {CHINESE_ANIMALS.filter((a) => a.slug !== slug).map((a) => (
              <Link
                key={a.slug}
                href={`/chinuri-horoskopi/${a.slug}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/55 px-3 py-1.5 text-sm transition-colors hover:bg-card/80"
              >
                <span aria-hidden>{a.emoji}</span>
                {a.nameKa}
              </Link>
            ))}
          </div>
        </section>

      </section>

      <SiteFooter />
    </main>
  );
}

function Prose({ body, className }: { body: string; className?: string }) {
  return (
    <div
      className={`max-w-3xl space-y-4 text-pretty text-base leading-relaxed text-foreground/90 sm:text-lg ${className ?? ""}`}
    >
      {paragraphs(body).map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  );
}

function Section({ title, body }: { title: string; body: string }) {
  return (
    <section className="mt-12 max-w-3xl">
      <h2 className="mb-3 text-2xl font-semibold tracking-tight sm:text-3xl">
        {title}
      </h2>
      <Prose body={body} />
    </section>
  );
}

function Traits({
  title,
  items,
  color,
}: {
  title: string;
  items: string[];
  color: string;
}) {
  return (
    <article className="rounded-2xl border border-border bg-card/55 p-5 ring-1 ring-foreground/5 backdrop-blur-xl">
      <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {title}
      </div>
      <ul className="mt-3 space-y-2">
        {items.map((it, i) => (
          <li
            key={i}
            className="flex items-start gap-2 text-sm text-foreground/85"
          >
            <span aria-hidden style={{ color }}>
              ◆
            </span>
            {it}
          </li>
        ))}
      </ul>
    </article>
  );
}
