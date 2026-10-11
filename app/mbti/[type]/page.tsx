import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import { MbtiProfileSections } from "@/components/mbti/mbti-profile-sections";
import { MbtiFamousPeople } from "@/components/mbti/mbti-famous-people";
import { MbtiEnglishTypeDetails } from "@/components/mbti/mbti-english-type-details";

import { mbtiCharacterSrc } from "@/lib/mbti-characters";
import {
  getMbtiLibraryEntries,
  getTypeSections,
  mbtiTypeKey,
  MBTI_TYPES,
} from "@/lib/mbti-library";
import {
  ALL_MBTI_SLUGS,
  buildMbtiSeo,
  buildMbtiSeoEn,
  mbtiCodeFromSlug,
} from "@/lib/seo/mbti-seo";
import { articleLd, breadcrumbLd, faqLd, serializeLd } from "@/lib/seo/jsonld";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import {
  ENGLISH_SITE_URL,
  GEORGIAN_SITE_URL,
  localizedAlternates,
} from "@/lib/seo/locales";

// Library-backed content is stable; refresh daily so admin edits propagate.
export const revalidate = 86400;

export function generateStaticParams() {
  return ALL_MBTI_SLUGS.map((type) => ({ type }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string }>;
}): Promise<Metadata> {
  const { type } = await params;
  const code = mbtiCodeFromSlug(type);
  if (!code) return {};
  const locale = await getRequestLocale();
  const seoKa = buildMbtiSeo(code);
  const seoEn = buildMbtiSeoEn(code);

  const en = locale === "en";
  const siteUrl = en ? ENGLISH_SITE_URL : GEORGIAN_SITE_URL;
  const title = en ? seoEn.pageTitle : seoKa.pageTitle;
  const description = en ? seoEn.metaDescription : seoKa.metaDescription;
  const archetype = en ? seoEn.archetype : seoKa.archetypeKa;
  const og = `${siteUrl}/api/og/page?t=${encodeURIComponent(`${code} · ${archetype}`)}&k=${encodeURIComponent(en ? "Personality type" : "პიროვნების ტიპი")}&a=${encodeURIComponent("#a78bfa")}`;
  const url = `${siteUrl}/mbti/${seoKa.slug}`;
  return {
    title: { absolute: title },
    description,
    keywords: en ? seoEn.queries : seoKa.queries,
    alternates: localizedAlternates(
      `/mbti/${seoKa.slug}`,
      `/mbti/${seoKa.slug}`,
      en ? "en" : "ka",
    ),
    openGraph: {
      type: "article",
      url,
      title,
      description,
      siteName: "Vivida",
      locale: en ? "en_US" : "ka_GE",
      images: [{ url: og, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [og],
    },
  };
}

function paragraphs(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export default async function MbtiTypePage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  const code = mbtiCodeFromSlug(type);
  if (!code) notFound();
  const locale = await getRequestLocale();
  const en = locale === "en";
  const seoKa = buildMbtiSeo(code);
  const seoEn = buildMbtiSeoEn(code);
  const siteUrl = en ? ENGLISH_SITE_URL : GEORGIAN_SITE_URL;
  const url = `${siteUrl}/mbti/${seoKa.slug}`;
  const archetype = en ? seoEn.archetype : seoKa.archetypeKa;
  const tagline = en ? seoEn.tagline : seoKa.taglineKa;
  const pageTitle = en ? seoEn.pageTitle : seoKa.pageTitle;
  const metaDescription = en ? seoEn.metaDescription : seoKa.metaDescription;
  const faq = en ? seoEn.faq : seoKa.faq;

  const library = en
    ? null
    : await Promise.all([
        getMbtiLibraryEntries([mbtiTypeKey(code)]),
        getTypeSections(code),
      ]);
  const portrait = library?.[0].get(mbtiTypeKey(code))?.body ?? "";
  const sections = library?.[1] ?? [];

  // Sibling types for internal linking (the other 15).
  const others = (MBTI_TYPES as readonly string[]).filter((t) => t !== code);

  const ld = [
    articleLd({
      url,
      headline: pageTitle,
      description: metaDescription,
      about: {
        "@type": "Thing",
        name: `${code} — ${archetype}`,
        description: tagline,
      },
    }),
    faqLd(faq),
    breadcrumbLd([
      { name: en ? "Home" : "მთავარი", url: siteUrl },
      { name: en ? "Tests" : "ტესტები", url: `${siteUrl}/tests` },
      {
        name: en ? "Personality types" : "პიროვნების ტიპები",
        url: `${siteUrl}/mbti`,
      },
      { name: code, url },
    ]),
  ];

  return (
    <main
      lang={locale}
      className="relative isolate flex min-h-screen flex-col overflow-hidden"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_220/0.45),transparent_70%)]"
      />
      <Starfield count={120} shooting={2} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeLd(ld) }}
      />

      <SmartHeader
        active="tests"
        locale={locale}
        georgianPath={`/mbti/${seoKa.slug}`}
      />

      <section className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-16 pt-6 sm:px-6 sm:pt-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <Link href={"/tests"} className="hover:text-foreground">
            {en ? "Tests" : "ტესტები"}
          </Link>
          <span>/</span>
          <Link href={"/mbti"} className="hover:text-foreground">
            {en ? "Personality types" : "პიროვნების ტიპები"}
          </Link>
          <span>/</span>
          <span className="text-foreground">{code}</span>
        </nav>

        {/* Hero */}
        <header className="rounded-3xl border border-[var(--vivida-violet)]/40 bg-gradient-to-br from-[var(--vivida-violet)]/15 via-card/60 to-[var(--vivida-cyan)]/10 p-8 text-center ring-1 ring-foreground/5 backdrop-blur-xl sm:p-10">
          <Image
            src={mbtiCharacterSrc(code)}
            alt={`${code} — ${archetype}`}
            width={220}
            height={220}
            priority
            className="mx-auto mb-5 h-40 w-40 object-contain drop-shadow-[0_8px_30px_rgba(167,139,250,0.35)] sm:h-52 sm:w-52"
          />
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {en ? seoEn.group.labelEn : seoKa.group.labelKa}
          </div>
          <h1 className="mt-1 text-5xl font-bold tracking-[0.12em] sm:text-7xl">
            <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
              {code}
            </span>
          </h1>
          <div className="mt-2 text-lg font-medium text-foreground/90 sm:text-xl">
            {archetype}
          </div>
          <p className="mx-auto mt-3 max-w-md text-pretty text-sm text-foreground/80 sm:text-base">
            {tagline}
          </p>
          <Button asChild variant="mystic" size="lg" className="mt-6">
            <Link href={en ? "/personality-test" : "/pirovnebis-testi"}>
              <Sparkles className="size-4" />
              {en
                ? "Discover your type — take the test"
                : "გაიგე შენი ტიპი — გაიარე ტესტი"}
            </Link>
          </Button>
        </header>

        {/* Portrait */}
        {!en && portrait && (
          <article className="mt-8 space-y-4 rounded-2xl border border-border bg-card/50 p-6 text-[15px] leading-relaxed text-foreground/90 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-8">
            <h2 className="text-lg font-semibold tracking-tight">
              {code} ({seoKa.archetypeKa}) — ვინ არის ეს ტიპი
            </h2>
            {paragraphs(portrait).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </article>
        )}

        {/* Strengths/weaknesses + life-domain sections */}
        {en ? (
          <MbtiEnglishTypeDetails type={code} />
        ) : (
          <MbtiProfileSections sections={sections} />
        )}

        {/* Famous people */}
        <div className="mt-4">
          <MbtiFamousPeople type={code} locale={locale} />
        </div>

        {/* FAQ */}
        <section className="mt-10">
          <h2 className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {en ? "Frequently asked questions" : "ხშირად დასმული კითხვები"}
          </h2>
          <div className="space-y-3">
            {faq.map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl border border-border bg-card/50 ring-1 ring-foreground/5 backdrop-blur-xl"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 font-medium [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span className="text-muted-foreground transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="px-5 pb-5 text-[15px] leading-relaxed text-foreground/85">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="mt-10 rounded-2xl border border-[var(--vivida-violet)]/40 bg-gradient-to-br from-[var(--vivida-violet)]/15 via-card/60 to-[var(--vivida-cyan)]/10 p-6 text-center ring-1 ring-foreground/5 backdrop-blur-xl sm:p-8">
          <h2 className="text-lg font-semibold tracking-tight sm:text-xl">
            {en ? "Which personality type are you?" : "რომელი ტიპი ხარ შენ?"}
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            {en
              ? "Take the free 60-question personality test and discover your preferences in about seven minutes."
              : "გაიარე უფასო Astro-MBTI ტესტი და აღმოაჩინე შენი ზუსტი ტიპი — 60 კითხვა, 7 წუთი."}
          </p>
          <Button asChild variant="mystic" size="lg" className="mt-5">
            <Link href={en ? "/personality-test" : "/pirovnebis-testi"}>
              {en ? "Start the test" : "დაიწყე ტესტი"}
            </Link>
          </Button>
        </div>

        {/* Internal links — the other 15 types */}
        <section className="mt-10">
          <h2 className="mb-4 text-sm font-semibold tracking-tight">
            {en ? "The 16 personality types" : "16 პიროვნების ტიპი"}
          </h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {others.map((t) => (
              <Link
                key={t}
                href={`/mbti/${t.toLowerCase()}`}
                className="flex flex-col rounded-xl border border-border/60 bg-card/40 px-3 py-2.5 transition-colors hover:border-[var(--vivida-violet)]/50 hover:bg-card/60"
              >
                <span className="text-sm font-semibold">{t}</span>
                <span className="text-xs text-muted-foreground">
                  {en
                    ? buildMbtiSeoEn(t).archetype
                    : buildMbtiSeo(t).archetypeKa}
                </span>
              </Link>
            ))}
          </div>
          <div className="mt-4">
            <Link
              href={"/mbti"}
              className="inline-flex items-center gap-1 text-sm text-[var(--vivida-cyan)] hover:underline"
            >
              {en ? "View all types" : "ყველა ტიპი"}{" "}
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </section>
      </section>

      <SiteFooter locale={locale} />
    </main>
  );
}
