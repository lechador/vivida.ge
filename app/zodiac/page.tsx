import Link from "next/link";
import type { Metadata } from "next";
import { Calendar, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import {
  HUB_CONTENT,
  SIGNS_CONTENT,
  paragraphs,
} from "@/lib/seo/zodiac-content";
import {
  ALL_SLUGS,
  ZODIAC_DATES,
  signMetaBySlug,
} from "@/lib/seo/zodiac-dates";
import { signColor } from "@/lib/zodiac";

const SITE_URL = "https://www.vivida.ge";
const PATH = "/zodiac";

export const metadata: Metadata = {
  title: { absolute: HUB_CONTENT.pageTitle },
  description: HUB_CONTENT.metaDescription,
  alternates: { canonical: `${SITE_URL}${PATH}` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}${PATH}`,
    title: HUB_CONTENT.pageTitle,
    description: HUB_CONTENT.metaDescription,
    siteName: "Vivida",
    locale: "ka_GE",
  },
  twitter: {
    card: "summary_large_image",
    title: HUB_CONTENT.pageTitle,
    description: HUB_CONTENT.metaDescription,
  },
};

const HUB_LD = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: HUB_CONTENT.pageTitle,
  description: HUB_CONTENT.metaDescription,
  url: `${SITE_URL}${PATH}`,
  inLanguage: "ka-GE",
  mainEntity: {
    "@type": "ItemList",
    itemListElement: ALL_SLUGS.map((slug, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}${PATH}/${slug}`,
      name: SIGNS_CONTENT[slug].labelKa,
    })),
  },
};

const FAQ_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: HUB_CONTENT.faq.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

export default function ZodiacHubPage() {
  return (
    <main className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_220/0.45),transparent_70%),radial-gradient(40%_30%_at_15%_70%,oklch(0.34_0.16_350/0.4),transparent_70%)]"
      />
      <div
        aria-hidden
        className="vivida-nebula-drift absolute inset-0 -z-10 opacity-50 bg-[radial-gradient(50%_40%_at_30%_40%,oklch(0.40_0.18_305/0.18),transparent_70%)]"
      />
      <Starfield count={140} shooting={3} />

      <SmartHeader />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(HUB_LD) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_LD) }}
      />

      <section className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-12">
        <div className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          ცის ნიშნები
        </div>
        <h1 className="mb-4 text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
          {HUB_CONTENT.h1.split(":")[0]}
          {HUB_CONTENT.h1.includes(":") ? ":" : ""}{" "}
          <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
            {HUB_CONTENT.h1.split(":").slice(1).join(":").trim() ||
              HUB_CONTENT.h1}
          </span>
        </h1>
        <p className="max-w-2xl text-pretty text-lg text-muted-foreground">
          {HUB_CONTENT.tagline}
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild variant="mystic" size="lg">
            <Link href="/zodiac/datit">
              <Calendar className="size-4" />
              იპოვე შენი ნიშანი
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/signup">
              <Sparkles className="size-4" />
              ჩემი სრული რუკა
            </Link>
          </Button>
        </div>

        {/* Intro */}
        <div className="mt-12 max-w-3xl space-y-4 text-pretty text-base leading-relaxed text-foreground/90 sm:text-lg">
          {paragraphs(HUB_CONTENT.intro).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        {/* 12-sign grid */}
        <h2 className="mb-5 mt-16 text-2xl font-semibold tracking-tight sm:text-3xl">
          12 ცის ნიშანი
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {ALL_SLUGS.map((slug) => {
            const c = SIGNS_CONTENT[slug];
            const meta = signMetaBySlug(slug);
            const accent = meta ? signColor(meta) : "var(--vivida-violet)";
            return (
              <Link
                key={slug}
                href={`/zodiac/${slug}`}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card/65 p-4 ring-1 ring-foreground/5 backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:bg-card/80 hover:ring-foreground/15 sm:p-5"
              >
                <div
                  aria-hidden
                  className="absolute -right-10 -top-10 size-28 rounded-full opacity-25 blur-2xl transition-opacity group-hover:opacity-50"
                  style={{
                    background: `radial-gradient(circle, ${accent} 0%, transparent 70%)`,
                  }}
                />
                <div
                  className="relative text-3xl sm:text-4xl"
                  style={{ color: accent }}
                >
                  {c.symbol}
                </div>
                <div className="relative mt-2 text-base font-semibold tracking-tight sm:text-lg">
                  {c.labelKa}
                </div>
                <div className="relative mt-0.5 text-xs text-muted-foreground">
                  {ZODIAC_DATES[slug].rangeKa}
                </div>
                <div className="relative mt-2 text-xs text-muted-foreground/80">
                  {c.element} · {c.modality}
                </div>
              </Link>
            );
          })}
        </div>

        {/* What is the zodiac */}
        <article className="mt-16 max-w-3xl">
          <h2 className="mb-3 text-2xl font-semibold tracking-tight sm:text-3xl">
            {HUB_CONTENT.whatIsZodiac.title}
          </h2>
          <div className="space-y-4 text-pretty text-base leading-relaxed text-foreground/90">
            {paragraphs(HUB_CONTENT.whatIsZodiac.body).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </article>

        {/* Elements */}
        <article className="mt-12 max-w-3xl">
          <h2 className="mb-3 text-2xl font-semibold tracking-tight sm:text-3xl">
            {HUB_CONTENT.elements.title}
          </h2>
          <div className="space-y-4 text-pretty text-base leading-relaxed text-foreground/90">
            {paragraphs(HUB_CONTENT.elements.body).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </article>

        {/* Modalities */}
        <article className="mt-12 max-w-3xl">
          <h2 className="mb-3 text-2xl font-semibold tracking-tight sm:text-3xl">
            {HUB_CONTENT.modalities.title}
          </h2>
          <div className="space-y-4 text-pretty text-base leading-relaxed text-foreground/90">
            {paragraphs(HUB_CONTENT.modalities.body).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </article>

        {/* FAQ */}
        <section className="mt-16 max-w-3xl">
          <h2 className="mb-5 text-2xl font-semibold tracking-tight sm:text-3xl">
            ხშირად დასმული კითხვები
          </h2>
          <div className="space-y-3">
            {HUB_CONTENT.faq.map((item, i) => (
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

        {/* CTA */}
        <div className="mt-16 rounded-2xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/12 via-card/60 to-[var(--vivida-cyan)]/12 p-7 text-center ring-1 ring-foreground/5 backdrop-blur-xl sm:p-10">
          <Sparkles className="mx-auto mb-3 size-7 text-[var(--vivida-violet)]" />
          <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            შენი ნიშანი ცის რუკის მცირე ნაწილია
          </h2>
          <p className="mx-auto mt-3 max-w-md text-pretty text-base text-muted-foreground">
            მთვარე, ამომავალი, 12 სახლი, ყველა პლანეტა — ცოცხალ რუკაში.
            დაიწყე უფასოდ.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild variant="mystic" size="lg">
              <Link href="/signup">დაიწყე უფასოდ</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/zodiac/datit">იპოვე ნიშანი თარიღით</Link>
            </Button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
