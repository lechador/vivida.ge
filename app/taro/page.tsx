import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { auth } from "@/auth";
import { CREDIT_COST } from "@/lib/credits-config";
import { AppHeader } from "@/components/nav/app-header";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import { TarotReader } from "@/components/tarot/tarot-reader";
import { PopularSearches } from "@/components/seo/popular-searches";
import { SiteFooter } from "@/components/site-footer";
import { TAROT_CARDS } from "@/lib/tarot/deck";
import { TAROT_LATIN_QUERIES } from "@/lib/seo/transliteration";
import { articleLd, breadcrumbLd, faqLd, serializeLd } from "@/lib/seo/jsonld";

export const dynamic = "force-dynamic";

const SITE_URL = "https://www.vivida.ge";
const TITLE = "ტარო ქართულად — ტაროზე მკითხაობა და ონლაინ გაშლა";
const DESCRIPTION =
  "ტაროზე მკითხაობა ონლაინ, ქართულად: დაუსვი კითხვა და მიიღე ცოცხალი, პერსონალური პასუხი. ტაროს გაშლა 22 დიდი არკანით — პირველი კითხვა უფასო, რეგისტრაციის გარეშე.";

const FAQ = [
  {
    q: "როგორ მუშაობს ონლაინ ტარო Vivida-ზე?",
    a: "დაწერე შენი კითხვა, ჩვენ კი შემთხვევითად ვშლით 3-კარტიან განლაგებას (ფესვი, აწმყო, გზა) და AI ტაროლოგი წერს პერსონალურ პასუხს ქართულად — სამივე კარტს შენს კითხვასთან აკავშირებს.",
  },
  {
    q: "რამდენი ღირს ტარო კითხვა?",
    a: `პირველი კითხვა სრულიად უფასოა. ყოველი შემდეგი კითხვა ${CREDIT_COST.tarot} კრედიტი ღირს — კრედიტების უფასოდ დაგროვება კი მარტივია (მეგობრის მოწვევა, ყოველდღიური ვიზიტი, ფიდში პოსტი).`,
  },
  {
    q: "ტარო მართლა წინასწარმეტყველებს მომავალს?",
    a: "ტარო წინასწარმეტყველება კი არა, ხედვის ინსტრუმენტია — ის გეხმარება საკუთარი სიტუაცია სხვა კუთხიდან დაინახო და უკეთესი გადაწყვეტილება მიიღო. მომავალი შენს ხელთაა.",
  },
  {
    q: "რომელ კარტებს იყენებთ?",
    a: "22 დიდ არკანს — ტაროს ყველაზე ძლიერ და სიმბოლურ კარტებს, ბრიყვიდან სამყარომდე. თითო კარტს აქვს პირდაპირი და შებრუნებული მნიშვნელობა.",
  },
];

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  keywords: [
    "ტარო",
    "ტარო ქართულად",
    "ტაროზე მკითხაობა",
    "მკითხაობა ტაროზე ონლაინ",
    "ონლაინ ტარო",
    "ტარო კითხვა",
    "ტაროს გაშლა",
    "ტარო კარტები",
    "კარტებზე მკითხაობა",
    "უფასო ტარო",
    "უფასო მკითხაობა",
    "taro",
    "taro qartulad",
    "onlain taro",
    "taros gashla",
    "taroze mkitxaoba",
    "mkitxaoba",
  ],
  alternates: { canonical: `${SITE_URL}/taro` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/taro`,
    title: TITLE,
    description: DESCRIPTION,
    siteName: "Vivida",
    locale: "ka_GE",
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

export default async function TaroHubPage() {
  const session = await auth();
  const authed = !!session?.user?.id;

  const ld = [
    articleLd({
      url: `${SITE_URL}/taro`,
      headline: TITLE,
      description: DESCRIPTION,
      datePublished: "2026-07-14T00:00:00.000Z",
    }),
    breadcrumbLd([
      { name: "მთავარი", url: SITE_URL },
      { name: "ტარო", url: `${SITE_URL}/taro` },
    ]),
    faqLd(FAQ),
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: TAROT_CARDS.map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}/taro/${c.slug}`,
        name: c.nameKa,
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
      {authed ? <AppHeader authed active="tarot" /> : <SmartHeader />}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeLd(ld) }}
      />

      <section className="relative z-10 mx-auto w-full max-w-2xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-10">
        <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            მთავარი
          </Link>
          <span>/</span>
          <span className="text-foreground/80">ტარო</span>
        </nav>

        <header className="mb-6 text-center">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            ონლაინ ტარო · ტაროზე მკითხაობა
          </div>
          <h1 className="mt-1 text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
            ტარო{" "}
            <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
              ქართულად
            </span>
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-foreground/80 sm:text-base">
            ტაროზე მკითხაობა ონლაინ — დაუსვი კითხვა კარტებს და მიიღე ცოცხალი,
            პერსონალური პასუხი. პირველი კითხვა უფასოა.
          </p>
        </header>

        <TarotReader authed={authed} cost={CREDIT_COST.tarot} />

        {/* All cards — internal linking + SEO cluster */}
        <section className="mt-12">
          <h2 className="text-xl font-semibold tracking-tight">
            ტაროს დიდი არკანა — 22 კარტი
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            აღმოაჩინე თითო კარტის მნიშვნელობა — პირდაპირი და შებრუნებული.
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {TAROT_CARDS.map((c) => (
              <Link
                key={c.slug}
                href={`/taro/${c.slug}`}
                className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/40 px-3.5 py-2.5 text-sm transition-colors hover:bg-card/70"
              >
                <span className="text-lg">{c.glyph}</span>
                <span className="min-w-0">
                  <span className="block truncate font-medium text-foreground/90">
                    {c.nameKa}
                  </span>
                  <span className="block truncate text-[11px] text-muted-foreground">
                    {c.keywordsKa.slice(0, 2).join(" · ")}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-12">
          <h2 className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            ხშირად დასმული კითხვები
          </h2>
          <div className="space-y-3">
            {FAQ.map((item) => (
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

        {/* CTA → natal chart */}
        <div className="mt-14 rounded-2xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/12 via-card/60 to-[var(--vivida-cyan)]/12 p-7 text-center ring-1 ring-foreground/5 backdrop-blur-xl sm:p-10">
          <Sparkles className="mx-auto mb-3 size-7 text-[var(--vivida-violet)]" />
          <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            ტაროც და ვარსკვლავებიც
          </h2>
          <p className="mx-auto mt-3 max-w-md text-pretty text-base text-muted-foreground">
            შენი ნატალური რუკა ტაროზე ღრმა და მუდმივ სურათს ხატავს — მთვარე,
            ვენერა, ცის 12 სახლი. შექმენი უფასოდ.
          </p>
          <Link
            href="/nataluri-ruka"
            className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-[linear-gradient(135deg,var(--vivida-violet),var(--vivida-pink))] px-5 py-2.5 text-sm font-semibold text-white"
          >
            ჩემი ნატალური რუკა
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <PopularSearches queries={TAROT_LATIN_QUERIES} />
      </section>

      <SiteFooter />
    </main>
  );
}
