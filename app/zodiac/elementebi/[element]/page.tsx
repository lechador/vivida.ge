import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import {
  ELEMENTS_CONTENT,
  SIGNS_CONTENT,
  paragraphs,
} from "@/lib/seo/zodiac-content";
import {
  ALL_ELEMENT_SLUGS,
  ELEMENT_LABEL_KA,
  signMetaBySlug,
  type ElementSlug,
} from "@/lib/seo/zodiac-dates";
import { signColor } from "@/lib/zodiac";

const SITE_URL = "https://www.vivida.ge";

type Params = { element: string };

export async function generateStaticParams() {
  return ALL_ELEMENT_SLUGS.map((element) => ({ element }));
}

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

function isElement(s: string): s is ElementSlug {
  return (ALL_ELEMENT_SLUGS as string[]).includes(s);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { element } = await params;
  if (!isElement(element) || !ELEMENTS_CONTENT) return {};
  const c = ELEMENTS_CONTENT[element];
  if (!c) return {};
  return {
    title: { absolute: c.pageTitle },
    description: c.metaDescription,
    alternates: { canonical: `${SITE_URL}/zodiac/elementebi/${element}` },
    openGraph: {
      type: "article",
      url: `${SITE_URL}/zodiac/elementebi/${element}`,
      title: c.pageTitle,
      description: c.metaDescription,
      siteName: "Vivida",
      locale: "ka_GE",
    },
    twitter: {
      card: "summary_large_image",
      title: c.pageTitle,
      description: c.metaDescription,
    },
  };
}

export default async function ElementDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { element } = await params;
  if (!isElement(element) || !ELEMENTS_CONTENT) notFound();
  const c = ELEMENTS_CONTENT[element];
  if (!c) notFound();

  const accent = ELEMENT_ACCENT[element];
  const labelKa = ELEMENT_LABEL_KA[element];

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: c.pageTitle,
    description: c.metaDescription,
    inLanguage: "ka-GE",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/zodiac/elementebi/${element}`,
    },
    author: { "@type": "Organization", name: "Vivida", url: SITE_URL },
    publisher: { "@type": "Organization", name: "Vivida", url: SITE_URL },
    about: { "@type": "Thing", name: labelKa },
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
      { "@type": "ListItem", position: 2, name: "ელემენტები", item: `${SITE_URL}/zodiac/elementebi` },
      { "@type": "ListItem", position: 3, name: labelKa, item: `${SITE_URL}/zodiac/elementebi/${element}` },
    ],
  };

  return (
    <main className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_220/0.45),transparent_70%)]"
      />
      <Starfield count={130} shooting={3} />
      <SmartHeader />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <section className="relative z-10 mx-auto w-full max-w-4xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-12">
        <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/zodiac" className="hover:text-foreground">ცის ნიშნები</Link>
          <span>/</span>
          <Link href="/zodiac/elementebi" className="hover:text-foreground">ელემენტები</Link>
          <span>/</span>
          <span className="text-foreground/80">{labelKa}</span>
        </nav>

        {/* Hero */}
        <article className="relative overflow-hidden rounded-3xl border border-border bg-card/65 p-6 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-10">
          <div
            aria-hidden
            className="absolute -right-20 -top-20 size-72 rounded-full opacity-30 blur-3xl"
            style={{ background: `radial-gradient(circle, ${accent} 0%, transparent 70%)` }}
          />
          <div className="relative flex items-center gap-5">
            <div
              className="grid size-20 shrink-0 place-items-center rounded-3xl text-4xl"
              style={{
                background: `color-mix(in oklch, ${accent} 18%, transparent)`,
                boxShadow: `inset 0 0 0 1px color-mix(in oklch, ${accent} 35%, transparent), 0 0 60px -12px ${accent}`,
                color: accent,
              }}
            >
              {ELEMENT_GLYPH[element]}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                ცის ელემენტი
              </div>
              <h1 className="mt-1 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
                {labelKa}
              </h1>
              <p className="mt-2 max-w-xl text-pretty text-base text-foreground/85 sm:text-lg">
                {c.tagline}
              </p>
            </div>
          </div>

          {/* Signs */}
          <div className="relative mt-6 flex flex-wrap gap-2">
            {c.signs.map((slug) => {
              const sc = SIGNS_CONTENT[slug];
              const meta = signMetaBySlug(slug);
              const sa = meta ? signColor(meta) : accent;
              return (
                <Link
                  key={slug}
                  href={`/zodiac/${slug}`}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card/55 px-3 py-1.5 text-sm transition-colors hover:bg-card/80"
                >
                  <span style={{ color: sa }}>{sc.symbol}</span>
                  <span>{sc.labelKa}</span>
                </Link>
              );
            })}
          </div>
        </article>

        {/* Intro */}
        <section className="mt-12 max-w-3xl space-y-4 text-pretty text-base leading-relaxed text-foreground/90 sm:text-lg">
          {paragraphs(c.intro).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </section>

        {/* Personality */}
        <Section title={`${labelKa}-ის ნიშნების ხასიათი`}>
          {paragraphs(c.personality).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </Section>

        {/* Strengths × weaknesses */}
        <section className="mt-12 grid gap-6 sm:grid-cols-2">
          <article className="rounded-2xl border border-border bg-card/55 p-5 ring-1 ring-foreground/5 backdrop-blur-xl">
            <h2 className="mb-3 text-lg font-semibold tracking-tight">ძლიერი მხარეები</h2>
            <ul className="space-y-2 text-sm leading-relaxed">
              {c.strengths.map((s, i) => (
                <li key={i} className="flex gap-2">
                  <span style={{ color: accent }}>✦</span>
                  <span className="text-foreground/90">{s}</span>
                </li>
              ))}
            </ul>
          </article>
          <article className="rounded-2xl border border-border bg-card/55 p-5 ring-1 ring-foreground/5 backdrop-blur-xl">
            <h2 className="mb-3 text-lg font-semibold tracking-tight">გამოწვევები</h2>
            <ul className="space-y-2 text-sm leading-relaxed">
              {c.weaknesses.map((w, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-muted-foreground">·</span>
                  <span className="text-foreground/85">{w}</span>
                </li>
              ))}
            </ul>
          </article>
        </section>

        <Section title="სიყვარულში">
          {paragraphs(c.love).map((p, i) => <p key={i}>{p}</p>)}
        </Section>
        <Section title="კარიერაში">
          {paragraphs(c.career).map((p, i) => <p key={i}>{p}</p>)}
        </Section>
        <Section title="თავსებადობა სხვა ელემენტებთან">
          {paragraphs(c.compatibility).map((p, i) => <p key={i}>{p}</p>)}
        </Section>

        {/* FAQ */}
        <section className="mt-12 max-w-3xl">
          <h2 className="mb-5 text-2xl font-semibold tracking-tight sm:text-3xl">
            ხშირად დასმული კითხვები
          </h2>
          <div className="space-y-3">
            {c.faq.map((item, i) => (
              <details key={i} className="group rounded-2xl border border-border bg-card/55 p-4 ring-1 ring-foreground/5 backdrop-blur-xl transition-colors open:bg-card/80 sm:p-5">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-base font-medium text-foreground">
                  <span>{item.q}</span>
                  <span aria-hidden className="mt-1 shrink-0 text-xs text-muted-foreground transition-transform group-open:rotate-45">✦</span>
                </summary>
                <p className="mt-3 text-pretty text-sm leading-relaxed text-foreground/85 sm:text-base">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Other elements */}
        <section className="mt-14">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">სხვა ელემენტები</h2>
          <div className="flex flex-wrap gap-2">
            {ALL_ELEMENT_SLUGS.filter((e) => e !== element).map((e) => (
              <Link
                key={e}
                href={`/zodiac/elementebi/${e}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/55 px-3 py-1.5 text-sm transition-colors hover:bg-card/80"
              >
                <span style={{ color: ELEMENT_ACCENT[e] }}>{ELEMENT_GLYPH[e]}</span>
                {ELEMENT_LABEL_KA[e]}
              </Link>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="mt-14 rounded-2xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/12 via-card/60 to-[var(--vivida-cyan)]/12 p-7 text-center ring-1 ring-foreground/5 backdrop-blur-xl sm:p-10">
          <Sparkles className="mx-auto mb-3 size-7 text-[var(--vivida-violet)]" />
          <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            შენი {labelKa}-ის ბალანსი
          </h2>
          <p className="mx-auto mt-3 max-w-md text-pretty text-base text-muted-foreground">
            ნატალური რუკა გიჩვენებს, რამდენი ცეცხლი, მიწა, ჰაერი და წყალი
            გაქვს — ეს უკეთ გაგარკვევს, რა გიხერხდება ბუნებრივად.
          </p>
          <Button asChild variant="mystic" size="lg" className="mt-6">
            <Link href="/signup">ჩემი სრული რუკა</Link>
          </Button>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-12 max-w-3xl">
      <h2 className="mb-3 text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
      <div className="space-y-4 text-pretty text-base leading-relaxed text-foreground/90">
        {children}
      </div>
    </section>
  );
}
