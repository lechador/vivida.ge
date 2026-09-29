import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";

import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import { AngelNumberPageEn } from "@/components/seo/angel-numbers-en";

import { getRequestLocale } from "@/lib/i18n/request-locale";
import {
  ALL_ANGEL_SLUGS,
  ANGEL_BY_SLUG,
  ANGEL_NUMBERS,
  isAngelSlug,
} from "@/lib/seo/angel-numbers";
import { ANGEL_EN_BY_SLUG } from "@/lib/seo/angel-numbers-en";

import { articleLd, breadcrumbLd, faqLd, serializeLd } from "@/lib/seo/jsonld";
import {
  englishSiteHref,
  DEFAULT_OG_IMAGE,
  localizedAlternates,
} from "@/lib/seo/locales";

const SITE_URL = "https://www.vivida.ge";

type Params = { number: string };

export function generateStaticParams() {
  return ALL_ANGEL_SLUGS.map((number) => ({ number }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { number } = await params;
  if (!isAngelSlug(number)) return {};
  const a = ANGEL_BY_SLUG[number];
  const locale = await getRequestLocale();

  if (locale === "en") {
    const content = ANGEL_EN_BY_SLUG[number];
    if (!content) return {};
    const path = `/angeluri-ricxvebi/${number}`;
    const title = `${content.title}: Meaning in Love, Career and Life`;
    const description = `${content.essence} Explore the modern symbolic meaning of ${number}, relationship and career themes, and a grounded action prompt.`;
    return {
      title: { absolute: title },
      description,
      alternates: localizedAlternates(path, path, "en"),
      openGraph: {
        images: [DEFAULT_OG_IMAGE],
        type: "article",
        url: englishSiteHref(path, false),
        title,
        description,
        siteName: "Vivida",
        locale: "en_US",
      },
      twitter: { card: "summary_large_image", title, description },
    };
  }
  const url = `${SITE_URL}/angeluri-ricxvebi/${a.slug}`;
  const clock = a.clockKa ? ` და ${a.clockKa}` : "";
  const title = `${a.slug}${clock} — რას ნიშნავს ანგელოზური რიცხვი`;
  const description = `${a.essenceKa} ${a.meaningKa.slice(0, 120)}… ნახე, რას ნიშნავს ${a.slug} სიყვარულში, საქმეში და რა ნაბიჯი გადადგა.`;

  return {
    title: { absolute: title },
    description,
    keywords: [
      ...a.keywordsKa,
      `${a.slug} რას ნიშნავს`,
      `რიცხვი ${a.slug}`,
      "ანგელოზური რიცხვები",
      "ერთნაირი ციფრები საათზე",
      `${a.slug} mnishvneloba`,
      "angeluri ricxvebi",
    ],
    alternates: localizedAlternates(
      `/angeluri-ricxvebi/${number}`,
      `/angeluri-ricxvebi/${number}`,
      "ka",
    ),
    openGraph: {
      images: [DEFAULT_OG_IMAGE],
      type: "article",
      url,
      title,
      description,
      siteName: "Vivida",
      locale: "ka_GE",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function AngelNumberPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { number } = await params;
  if (!isAngelSlug(number)) notFound();
  const a = ANGEL_BY_SLUG[number];
  const locale = await getRequestLocale();
  if (locale === "en") {
    const content = ANGEL_EN_BY_SLUG[number];
    if (!content) notFound();
    return <AngelNumberPageEn base={a} content={content} />;
  }
  const url = `${SITE_URL}/angeluri-ricxvebi/${a.slug}`;

  const faq = [
    { q: `რას ნიშნავს ${a.slug}?`, a: a.meaningKa },
    { q: `${a.slug} სიყვარულში — რას ნიშნავს?`, a: a.loveKa },
    { q: `რა უნდა გავაკეთო, როცა ${a.slug}-ს ვხედავ?`, a: a.actionKa },
  ];

  const ld = [
    articleLd({
      url,
      headline: a.titleKa,
      description: a.essenceKa,
      datePublished: "2026-07-29T00:00:00.000Z",
      about: {
        "@type": "Thing",
        name: `ანგელოზური რიცხვი ${a.slug}`,
        alternateName: a.clockKa ? [a.clockKa, a.slug] : [a.slug],
      },
    }),
    breadcrumbLd([
      { name: "მთავარი", url: SITE_URL },
      { name: "ანგელოზური რიცხვები", url: `${SITE_URL}/angeluri-ricxvebi` },
      { name: a.slug, url },
    ]),
    faqLd(faq),
  ];

  const sections = [
    {
      title: "სიყვარული და ურთიერთობები",
      body: a.loveKa,
      accent: "var(--vivida-pink)",
    },
    { title: "საქმე და ფული", body: a.careerKa, accent: "var(--vivida-cyan)" },
  ];

  return (
    <main className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_220/0.45),transparent_70%)]"
      />
      <Starfield count={110} shooting={2} />
      <SmartHeader />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeLd(ld) }}
      />

      <section className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-10">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            მთავარი
          </Link>
          <span>/</span>
          <Link href="/angeluri-ricxvebi" className="hover:text-foreground">
            ანგელოზური რიცხვები
          </Link>
          <span>/</span>
          <span className="text-foreground/80">{a.slug}</span>
        </nav>

        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-6xl">
              {a.slug}
            </span>
            {a.clockKa && (
              <span className="rounded-full border border-border bg-card/60 px-3 py-1 text-sm text-muted-foreground">
                {a.clockKa}
              </span>
            )}
          </div>
          <h1 className="mt-3 text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            {a.titleKa}
          </h1>
          <p className="mt-3 text-pretty text-lg leading-relaxed text-foreground/90">
            {a.essenceKa}
          </p>
        </header>

        <section className="rounded-2xl border border-border bg-card/50 p-5 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--vivida-violet)]">
            რას ნიშნავს {a.slug}
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed text-foreground/90">
            {a.meaningKa}
          </p>
        </section>

        <div className="mt-4 space-y-4">
          {sections.map((s) => (
            <section
              key={s.title}
              className="rounded-2xl border border-border bg-card/50 p-5 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-6"
            >
              <h2
                className="text-sm font-semibold uppercase tracking-[0.14em]"
                style={{ color: s.accent }}
              >
                {s.title}
              </h2>
              <p className="mt-2 text-[15px] leading-relaxed text-foreground/90">
                {s.body}
              </p>
            </section>
          ))}

          <section className="rounded-2xl border border-[var(--vivida-violet)]/30 bg-[var(--vivida-violet)]/8 p-5 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--vivida-violet)]">
              რა გავაკეთო, როცა {a.slug}-ს ვხედავ
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-foreground/90">
              {a.actionKa}
            </p>
          </section>
        </div>

        <section className="mt-10">
          <h2 className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            სხვა ანგელოზური რიცხვები
          </h2>
          <div className="flex flex-wrap gap-2">
            {ANGEL_NUMBERS.filter((x) => x.slug !== a.slug).map((x) => (
              <Link
                key={x.slug}
                href={`/angeluri-ricxvebi/${x.slug}`}
                className="rounded-xl border border-border bg-card/55 px-3.5 py-2 text-sm font-semibold text-foreground/85 transition-colors hover:bg-card/85 hover:text-foreground"
              >
                {x.slug}
              </Link>
            ))}
          </div>
        </section>

        <div className="mt-12 rounded-2xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/12 via-card/60 to-[var(--vivida-cyan)]/12 p-7 text-center ring-1 ring-foreground/5 backdrop-blur-xl sm:p-9">
          <Sparkles className="mx-auto mb-3 size-6 text-[var(--vivida-violet)]" />
          <h2 className="text-balance text-xl font-semibold tracking-tight sm:text-2xl">
            გამოთვალე შენი ბედის რიცხვი
          </h2>
          <p className="mx-auto mt-2 max-w-md text-pretty text-sm text-muted-foreground sm:text-base">
            {a.slug} მომენტზე მიანიშნებს — ბედის რიცხვი კი მთელ შენს ხასიათს
            აღწერს. უფასო კალკულატორი დაბადების თარიღით.
          </p>
          <Link
            href="/numerologia"
            className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-[linear-gradient(135deg,var(--vivida-violet),var(--vivida-pink))] px-5 py-2.5 text-sm font-semibold text-white"
          >
            ჩემი ბედის რიცხვი
            <ArrowRight className="size-4" />
          </Link>
        </div>

      </section>

      <SiteFooter />
    </main>
  );
}
