import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import { PopularSearches } from "@/components/seo/popular-searches";
import {
  FORTUNE_METHODS,
  MKITXAOBA_FAQ,
  MKITXAOBA_KEYWORDS_KA,
  MKITXAOBA_LATIN_QUERIES,
} from "@/lib/seo/fortune-telling";
import { articleLd, breadcrumbLd, faqLd, serializeLd } from "@/lib/seo/jsonld";
import { DEFAULT_OG_IMAGE } from "@/lib/seo/locales";

const SITE_URL = "https://www.vivida.ge";

const TITLE = "მკითხაობა ონლაინ უფასოდ — ტაროზე მკითხაობა ქართულად";
const DESCRIPTION =
  "ონლაინ მკითხაობა ქართულად და უფასოდ: ტაროზე მკითხაობა კითხვა-პასუხით, დღის ჰოროსკოპი, ნატალური რუკა, სიყვარულის თავსებადობა და ბედის რიცხვი. რეგისტრაციის გარეშე იწყება — აირჩიე მეთოდი და დაუსვი შენი კითხვა.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  keywords: MKITXAOBA_KEYWORDS_KA,
  alternates: { canonical: `${SITE_URL}/mkitxaoba` },
  openGraph: {
    images: [DEFAULT_OG_IMAGE],
    type: "website",
    url: `${SITE_URL}/mkitxaoba`,
    title: TITLE,
    description: DESCRIPTION,
    siteName: "Vivida",
    locale: "ka_GE",
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

/**
 * Hub for the bare-keyword "მკითხაობა" family. Deliberately a directory
 * page rather than another reader UI: the query intent is "where can I
 * get a reading", so the fastest useful answer is a labelled menu of the
 * methods we actually run, each linking straight into the working tool.
 */
export default function MkitxaobaPage() {
  const ld = [
    articleLd({
      url: `${SITE_URL}/mkitxaoba`,
      headline: TITLE,
      description: DESCRIPTION,
      datePublished: "2026-07-29T00:00:00.000Z",
      about: {
        "@type": "Thing",
        name: "მკითხაობა",
        alternateName: [
          "ტაროზე მკითხაობა",
          "ონლაინ მკითხაობა",
          "mkitxaoba",
          "taroze mkitxaoba",
        ],
      },
    }),
    breadcrumbLd([
      { name: "მთავარი", url: SITE_URL },
      { name: "მკითხაობა", url: `${SITE_URL}/mkitxaoba` },
    ]),
    faqLd(MKITXAOBA_FAQ),
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "მკითხაობის მეთოდები Vivida-ზე",
      itemListElement: FORTUNE_METHODS.map((m, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}${m.href}`,
        name: m.titleKa,
      })),
    },
  ];

  return (
    <main className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_220/0.45),transparent_70%)]"
      />
      <Starfield count={120} shooting={2} />
      <SmartHeader />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeLd(ld) }}
      />

      <section className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-10">
        <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            მთავარი
          </Link>
          <span>/</span>
          <span className="text-foreground/80">მკითხაობა</span>
        </nav>

        <header className="mb-8 text-center">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            ონლაინ მკითხაობა
          </div>
          <h1 className="mt-1 text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
            მკითხაობა{" "}
            <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
              ონლაინ უფასოდ
            </span>
          </h1>
          <p className="mx-auto mt-3.5 max-w-xl text-pretty text-sm leading-relaxed text-foreground/80 sm:text-base">
            ტაროზე მკითხაობა, ჰოროსკოპი, ნატალური რუკა და ბედის რიცხვი — ერთ
            ადგილას, ქართულად. აირჩიე მეთოდი, დაუსვი კითხვა და პასუხს იმავე
            წუთს მიიღებ. დასაწყებად რეგისტრაცია არ გჭირდება.
          </p>
        </header>

        {/* Primary CTA — tarot is the method the query usually means. */}
        <Link
          href="/taro"
          className="group flex items-center gap-4 rounded-2xl border border-[var(--vivida-violet)]/35 bg-gradient-to-br from-[var(--vivida-violet)]/15 via-card/60 to-[var(--vivida-pink)]/12 p-5 ring-1 ring-foreground/5 backdrop-blur-xl transition-colors hover:from-[var(--vivida-violet)]/22 sm:p-6"
        >
          <span className="text-3xl sm:text-4xl">🃏</span>
          <span className="min-w-0 flex-1">
            <span className="block text-lg font-semibold tracking-tight sm:text-xl">
              დაიწყე ტაროზე მკითხაობით
            </span>
            <span className="mt-0.5 block text-sm text-muted-foreground">
              დაწერე შენი კითხვა და გაშალე 3 კარტი — პირველი გაშლა უფასოა
            </span>
          </span>
          <ArrowRight className="size-5 shrink-0 text-[var(--vivida-violet)] transition-transform group-hover:translate-x-0.5" />
        </Link>

        {/* Method directory — the body of the page. */}
        <section className="mt-10">
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
            მკითხაობის მეთოდები
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            თითოეული მუშაობს ბრაუზერში, ქართულად. ფასი გვერდზევე წერია.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {FORTUNE_METHODS.map((m) => (
              <Link
                key={m.href}
                href={m.href}
                className="group flex flex-col rounded-2xl border border-border bg-card/45 p-5 ring-1 ring-foreground/5 backdrop-blur-xl transition-colors hover:bg-card/70"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{m.glyph}</span>
                  <div className="min-w-0">
                    <h3 className="font-semibold tracking-tight text-foreground/95">
                      {m.titleKa}
                    </h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {m.taglineKa}
                    </p>
                  </div>
                </div>
                <p className="mt-3 flex-1 text-[14px] leading-relaxed text-foreground/85">
                  {m.bodyKa}
                </p>
                <span className="mt-3.5 inline-flex w-fit items-center rounded-full border border-[var(--vivida-cyan)]/35 bg-[var(--vivida-cyan)]/10 px-2.5 py-0.5 text-[11px] font-medium text-[var(--vivida-cyan)]">
                  {m.costKa}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Editorial section — gives the page real substance for the
            bare-keyword query instead of being a bare link list. */}
        <section className="mt-12 rounded-3xl border border-border bg-card/40 p-6 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-8">
          <h2 className="text-xl font-semibold tracking-tight">
            რა არის მკითხაობა და როგორ დავსვათ სწორი კითხვა
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-foreground/85">
            მკითხაობა — ტაროზე, კარტებზე თუ ვარსკვლავებზე — არსებითად ერთ რამეს
            აკეთებს: სიმბოლოების ენაზე გაძლევს სიტუაციის სხვა კუთხით დანახვის
            საშუალებას. სწორედ ამიტომ არის კითხვის ფორმულირება იმაზე
            მნიშვნელოვანი, ვიდრე თავად მეთოდი.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-[var(--vivida-cyan)]/25 bg-[var(--vivida-cyan)]/8 px-4 py-3.5">
              <div className="text-sm font-semibold text-[var(--vivida-cyan)]">
                კარგი კითხვა
              </div>
              <p className="mt-1 text-[13px] leading-relaxed text-foreground/85">
                „რას უნდა მივაქციო ყურადღება ამ ურთიერთობაში?“ — ღიაა, შენზეა
                ორიენტირებული და პასუხისგან რჩევას ელოდები.
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--vivida-pink)]/25 bg-[var(--vivida-pink)]/8 px-4 py-3.5">
              <div className="text-sm font-semibold text-[var(--vivida-pink)]">
                სუსტი კითხვა
              </div>
              <p className="mt-1 text-[13px] leading-relaxed text-foreground/85">
                „დამირეკავს თუ არა ხვალ?“ — დახურულია და მხოლოდ დიახ/არას
                ითხოვს; პასუხიც ისეთივე ცარიელი დაბრუნდება.
              </p>
            </div>
          </div>
          <p className="mt-5 text-[15px] leading-relaxed text-foreground/85">
            და მთავარი: არცერთი მკითხაობა არ არის მომავლის გარანტია. თუ პასუხი
            გაფრთხილებაა, ის შენს გადაწყვეტილებას კი არ ცვლის, არამედ
            გაფიქრებინებს — არჩევანი ბოლომდე შენს ხელშია.
          </p>
        </section>

        {/* FAQ */}
        <section className="mt-12">
          <h2 className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            ხშირად დასმული კითხვები
          </h2>
          <div className="space-y-3">
            {MKITXAOBA_FAQ.map((item) => (
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

        <div className="mt-14 rounded-2xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/12 via-card/60 to-[var(--vivida-cyan)]/12 p-7 text-center ring-1 ring-foreground/5 backdrop-blur-xl sm:p-10">
          <Sparkles className="mx-auto mb-3 size-7 text-[var(--vivida-violet)]" />
          <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            ერთი გაშლა ერთი დღეა — რუკა მთელი ცხოვრებაა
          </h2>
          <p className="mx-auto mt-3 max-w-md text-pretty text-base text-muted-foreground">
            თუ გინდა პასუხი არა მხოლოდ „ახლა რა ხდება“, არამედ „რატომ ვარ
            ასეთი“ — დაიწყე შენი ნატალური რუკით. უფასოა.
          </p>
          <Link
            href="/nataluri-ruka"
            className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-[linear-gradient(135deg,var(--vivida-violet),var(--vivida-pink))] px-5 py-2.5 text-sm font-semibold text-white"
          >
            ჩემი ნატალური რუკა
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <PopularSearches queries={MKITXAOBA_LATIN_QUERIES} />
      </section>

      <SiteFooter />
    </main>
  );
}
