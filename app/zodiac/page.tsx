import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Calendar } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ReportPromo } from "@/components/report/report-promo";
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
import { DEFAULT_OG_IMAGE, localizedAlternates } from "@/lib/seo/locales";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { ZodiacHubEn } from "@/components/seo/zodiac-hub-en";

const SITE_URL = "https://www.vivida.ge";
const PATH = "/zodiac";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const en = locale !== "ka";
  const title = en
    ? "The 12 Zodiac Signs, Dates, Traits and Meanings"
    : HUB_CONTENT.pageTitle;
  const description = en
    ? "Explore all 12 zodiac signs, their dates, symbols, elements, modalities, personality traits, and compatibility. Find your sign and calculate your full birth chart."
    : HUB_CONTENT.metaDescription;
  return {
    title: { absolute: title },
    description,
    alternates: localizedAlternates(PATH, "/en/zodiac", en ? "en" : "ka"),
    openGraph: {
      images: [DEFAULT_OG_IMAGE],
      type: "website",
      url: `${en ? "https://www.vividaastro.com" : SITE_URL}${PATH}`,
      title,
      description,
      siteName: "Vivida",
      locale: en ? "en_US" : "ka_GE",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

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

export default async function ZodiacHubPage() {
  if ((await getRequestLocale()) !== "ka") return <ZodiacHubEn />;
  return (
    <main className="relative isolate flex min-h-screen flex-col overflow-x-clip bg-background">
      <Starfield count={48} />

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
        <header className="border-b border-border pb-8">
          <div className="mb-2 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--vivida-gold)]">
            ცის ნიშნები · ZODIAC ALMANAC
          </div>
          <h1 className="mb-4 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
            {HUB_CONTENT.h1.split(":")[0]}
            {HUB_CONTENT.h1.includes(":") ? ":" : ""}{" "}
            <span className="text-primary">
              {HUB_CONTENT.h1.split(":").slice(1).join(":").trim() ||
                HUB_CONTENT.h1}
            </span>
          </h1>
          <p className="max-w-2xl text-pretty text-lg text-muted-foreground">
            {HUB_CONTENT.tagline}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/zodiac/datit">
                <Calendar className="size-4" />
                იპოვე შენი ნიშანი
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/nataluri-ruka">
                ნატალური რუკა ონლაინ
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </header>

        {/* Intro */}
        <div className="mt-10 max-w-3xl space-y-4 text-pretty text-base leading-relaxed text-foreground/90 sm:text-lg">
          {paragraphs(HUB_CONTENT.intro).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        {/* 12-sign outlined cards grid */}
        <h2 className="mb-4 mt-14 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          12 ცის ნიშანი
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {ALL_SLUGS.map((slug) => {
            const c = SIGNS_CONTENT[slug];
            const meta = signMetaBySlug(slug);
            const accent = meta ? signColor(meta) : "var(--primary)";
            return (
              <Link
                key={slug}
                href={`/zodiac/${slug}`}
                className="group flex flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-sm transition-all duration-150 hover:border-primary/45 hover:bg-secondary/50"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      className="grid size-10 place-items-center rounded-lg border border-border bg-background/80 text-2xl"
                      style={{ color: accent }}
                    >
                      {c.symbol}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                      {c.element}
                    </span>
                  </div>
                  <div className="mt-4 text-base font-semibold tracking-tight text-foreground group-hover:text-primary sm:text-lg">
                    {c.labelKa}
                  </div>
                  <div className="mt-0.5 font-mono text-xs tabular-nums text-muted-foreground">
                    {ZODIAC_DATES[slug].rangeKa}
                  </div>
                </div>
                <div className="mt-4 border-t border-border/70 pt-2.5 text-[11px] text-muted-foreground">
                  {c.element} · {c.modality}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Editorial Reference Columns */}
        <div className="mt-16 grid gap-4 lg:grid-cols-3">
          <article className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-7">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--vivida-gold)]">
              01 · საფუძველი
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
              {HUB_CONTENT.whatIsZodiac.title}
            </h2>
            <div className="mt-3 space-y-3 text-pretty text-sm leading-relaxed text-foreground/85">
              {paragraphs(HUB_CONTENT.whatIsZodiac.body).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </article>

          <article className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-7">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--vivida-cyan)]">
              02 · სტიქიები
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
              {HUB_CONTENT.elements.title}
            </h2>
            <div className="mt-3 space-y-3 text-pretty text-sm leading-relaxed text-foreground/85">
              {paragraphs(HUB_CONTENT.elements.body).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </article>

          <article className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-7">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
              03 · მოდალობა
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
              {HUB_CONTENT.modalities.title}
            </h2>
            <div className="mt-3 space-y-3 text-pretty text-sm leading-relaxed text-foreground/85">
              {paragraphs(HUB_CONTENT.modalities.body).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </article>
        </div>

        {/* More to explore */}
        <section className="mt-16">
          <h2 className="mb-4 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            ჩაუღრმავდი
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                href: "/zodiac/mtvare",
                eyebrow: "მთვარის ნიშანი",
                title: "შენი ემოციური ბირთვი",
                body: "მზის ნიშნის ქვეშ მდებარე შინაგანი სამყარო.",
                accent: "text-[var(--vivida-cyan)]",
              },
              {
                href: "/zodiac/amomavali",
                eyebrow: "ამომავალი",
                title: "ნიღაბი, რომელსაც სამყარო ხედავს",
                body: "ასცენდენტი, როგორ შედიხარ ოთახში.",
                accent: "text-primary",
              },
              {
                href: "/zodiac/elementebi",
                eyebrow: "ცის ელემენტები",
                title: "ცეცხლი · მიწა · ჰაერი · წყალი",
                body: "გაიგე, როგორ აყალიბებს ოთხი ელემენტი ცის ნიშნების ხასიათს.",
                accent: "text-[var(--vivida-gold)]",
              },
              {
                href: "/zodiac/tavsebadoba",
                eyebrow: "თავსებადობა",
                title: "ყველა წყვილი · 78 კავშირი",
                body: "ნახე სრული ცხრილი, ვერძი ლომთან, ქალწული თხის რქასთან.",
                accent: "text-[var(--vivida-pink)]",
              },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex flex-col justify-between rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-150 hover:border-primary/45 hover:bg-secondary/50"
              >
                <div>
                  <div
                    className={`font-mono text-[11px] font-semibold uppercase tracking-[0.18em] ${item.accent}`}
                  >
                    {item.eyebrow}
                  </div>
                  <h3 className="mt-2 text-lg font-semibold tracking-tight text-foreground group-hover:text-primary">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.body}
                  </p>
                </div>
                <span className="mt-4 font-mono text-xs text-muted-foreground group-hover:text-primary">
                  გადასვლა →
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* FAQ & Additional Guides */}
        <section className="mt-16 max-w-3xl">
          <h2 className="mb-4 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            ხშირად დასმული კითხვები
          </h2>
          <div className="space-y-3">
            {HUB_CONTENT.faq.map((item, i) => (
              <details
                key={i}
                className="group overflow-hidden rounded-xl border border-border bg-card shadow-2xs open:border-primary/45"
              >
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 p-5 text-base font-medium text-foreground transition-colors hover:bg-secondary/30 [&::-webkit-details-marker]:hidden">
                  <span>{item.q}</span>
                  <span
                    aria-hidden
                    className="mt-0.5 shrink-0 font-mono text-sm text-muted-foreground transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="border-t border-border/70 bg-background/55 px-5 py-4 text-pretty text-sm leading-relaxed text-foreground/85 sm:text-base">
                  {item.a}
                </p>
              </details>
            ))}
          </div>

          <div className="mt-8 space-y-3.5">
            <Link
              href="/zodiac/reitingebi"
              className="group flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/45 hover:bg-secondary/45"
            >
              <div className="min-w-0">
                <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--vivida-gold)]">
                  რეიტინგები
                </div>
                <h3 className="mt-1 text-lg font-semibold tracking-tight text-foreground group-hover:text-primary sm:text-xl">
                  ყველაზე ჭკვიანი, ეჭვიანი, რომანტიული ნიშნები
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  12-ვე ნიშანი დალაგებული თვისებების მიხედვით — ნახე, სად დგას
                  შენი.
                </p>
              </div>
              <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
            </Link>

            <Link
              href="/chinuri-horoskopi"
              className="group flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/45 hover:bg-secondary/45"
            >
              <div className="min-w-0">
                <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--vivida-cyan)]">
                  ჩინური ჰოროსკოპი
                </div>
                <h3 className="mt-1 text-lg font-semibold tracking-tight text-foreground group-hover:text-primary sm:text-xl">
                  ზოდიაქოს ნიშნები წლების მიხედვით
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  გაიგე შენი ჩინური ცხოველი დაბადების წლით — ვირთხა, დრაკონი,
                  ვეფხვი…
                </p>
              </div>
              <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
            </Link>

            <Link
              href="/taro"
              className="group flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/45 hover:bg-secondary/45"
            >
              <div className="min-w-0">
                <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                  ონლაინ ტარო
                </div>
                <h3 className="mt-1 text-lg font-semibold tracking-tight text-foreground group-hover:text-primary sm:text-xl">
                  ტარო ქართულად — დაუსვი კითხვა კარტებს
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  გაშალე 3-კარტიანი განლაგება და მიიღე ცოცხალი პასუხი. პირველი
                  კითხვა უფასოა.
                </p>
              </div>
              <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
            </Link>
          </div>
        </section>

        <ReportPromo className="mt-16" />

        {/* CTA */}
        <div className="mt-16 rounded-2xl border border-primary/45 bg-gradient-to-br from-primary/15 via-card to-[var(--vivida-cyan)]/10 p-7 shadow-md sm:p-10">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div className="max-w-xl">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--vivida-gold)]">
                ნატალური რუკა
              </p>
              <h2 className="mt-2 text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                შენი ნიშანი ცის რუკის მცირე ნაწილია
              </h2>
              <p className="mt-2 text-pretty text-sm text-muted-foreground sm:text-base">
                მთვარე, ამომავალი, 12 სახლი და ყველა პლანეტა — ერთ ცოცხალ
                რუკაში. დაიწყე უფასოდ.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/signup">დაიწყე უფასოდ</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/zodiac/datit">იპოვე ნიშანი თარიღით</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
