import Link from "next/link";
import type { Metadata } from "next";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import {
  BY_DATE_CONTENT,
  paragraphs,
  SIGNS_CONTENT,
} from "@/lib/seo/zodiac-content";
import { ALL_SLUGS, ZODIAC_DATES } from "@/lib/seo/zodiac-dates";

import { SignByDatePicker } from "./sign-by-date-picker";

const SITE_URL = "https://www.vivida.ge";
const PATH = "/zodiac/datit";

export const metadata: Metadata = {
  title: { absolute: BY_DATE_CONTENT.pageTitle },
  description: BY_DATE_CONTENT.metaDescription,
  alternates: { canonical: `${SITE_URL}${PATH}` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}${PATH}`,
    title: BY_DATE_CONTENT.pageTitle,
    description: BY_DATE_CONTENT.metaDescription,
    siteName: "Vivida",
    locale: "ka_GE",
  },
  twitter: {
    card: "summary_large_image",
    title: BY_DATE_CONTENT.pageTitle,
    description: BY_DATE_CONTENT.metaDescription,
  },
};

const FAQ_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: BY_DATE_CONTENT.faq.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

const BREADCRUMB_LD = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "ცის ნიშნები",
      item: `${SITE_URL}/zodiac`,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "ნიშანი თარიღით",
      item: `${SITE_URL}${PATH}`,
    },
  ],
};

export default function ZodiacByDatePage() {
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_LD) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(BREADCRUMB_LD) }}
      />

      <section className="relative z-10 mx-auto w-full max-w-4xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-12">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/zodiac" className="hover:text-foreground">
            ცის ნიშნები
          </Link>
          <span>/</span>
          <span className="text-foreground/80">ნიშანი თარიღით</span>
        </nav>

        <div className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          მზის ნიშანი
        </div>
        <h1 className="mb-4 text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
          {BY_DATE_CONTENT.h1}
        </h1>
        <p className="max-w-2xl text-pretty text-lg text-muted-foreground">
          {BY_DATE_CONTENT.tagline}
        </p>

        {/* Picker */}
        <div className="mt-8">
          <SignByDatePicker />
        </div>

        {/* Intro */}
        <section className="mt-12 max-w-3xl space-y-4 text-pretty text-base leading-relaxed text-foreground/90 sm:text-lg">
          {paragraphs(BY_DATE_CONTENT.intro).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </section>

        {/* How it works */}
        <article className="mt-12 max-w-3xl">
          <h2 className="mb-3 text-2xl font-semibold tracking-tight sm:text-3xl">
            {BY_DATE_CONTENT.howItWorks.title}
          </h2>
          <div className="space-y-4 text-pretty text-base leading-relaxed text-foreground/90">
            {paragraphs(BY_DATE_CONTENT.howItWorks.body).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </article>

        {/* Cusp */}
        <article className="mt-10 max-w-3xl">
          <h2 className="mb-3 text-2xl font-semibold tracking-tight sm:text-3xl">
            {BY_DATE_CONTENT.cusp.title}
          </h2>
          <div className="space-y-4 text-pretty text-base leading-relaxed text-foreground/90">
            {paragraphs(BY_DATE_CONTENT.cusp.body).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </article>

        {/* Date table */}
        <section className="mt-12">
          <h2 className="mb-4 text-2xl font-semibold tracking-tight sm:text-3xl">
            ცის ნიშნების თარიღების ცხრილი
          </h2>
          <div className="overflow-hidden rounded-2xl border border-border bg-card/40 ring-1 ring-foreground/5">
            <table className="w-full text-sm">
              <thead className="border-b border-border/60 bg-card/60 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">ნიშანი</th>
                  <th className="px-4 py-3 text-left font-medium">თარიღი</th>
                  <th className="px-4 py-3 text-left font-medium">ელემენტი</th>
                </tr>
              </thead>
              <tbody>
                {ALL_SLUGS.map((slug, i) => {
                  const c = SIGNS_CONTENT[slug];
                  return (
                    <tr
                      key={slug}
                      className={
                        i % 2 === 0
                          ? "border-b border-border/30"
                          : "border-b border-border/30 bg-card/20"
                      }
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/zodiac/${slug}`}
                          className="inline-flex items-center gap-2 text-foreground/90 hover:text-foreground"
                        >
                          <span className="text-base">{c.symbol}</span>
                          <span className="font-medium">{c.labelKa}</span>
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-foreground/80">
                        {ZODIAC_DATES[slug].rangeKa}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {c.element}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Beyond Sun (CTA-ish) */}
        <article className="mt-12 max-w-3xl">
          <h2 className="mb-3 text-2xl font-semibold tracking-tight sm:text-3xl">
            {BY_DATE_CONTENT.beyondSun.title}
          </h2>
          <div className="space-y-4 text-pretty text-base leading-relaxed text-foreground/90">
            {paragraphs(BY_DATE_CONTENT.beyondSun.body).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <Button asChild variant="mystic" size="lg" className="mt-6">
            <Link href="/signup">
              <Sparkles className="size-4" />
              დაიწყე სრული რუკით
            </Link>
          </Button>
        </article>

        {/* FAQ */}
        <section className="mt-14 max-w-3xl">
          <h2 className="mb-5 text-2xl font-semibold tracking-tight sm:text-3xl">
            ხშირად დასმული კითხვები
          </h2>
          <div className="space-y-3">
            {BY_DATE_CONTENT.faq.map((item, i) => (
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
      </section>

      <SiteFooter />
    </main>
  );
}
