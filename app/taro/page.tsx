import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { auth } from "@/auth";
import { CREDIT_COST } from "@/lib/credits-config";
import { AppHeader } from "@/components/nav/app-header";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import { TarotReader } from "@/components/tarot/tarot-reader";
import { TarotConversionLanding } from "@/components/tarot/tarot-conversion-landing";
import { PopularSearches } from "@/components/seo/popular-searches";
import { SiteFooter } from "@/components/site-footer";
import { tarotDetailDeck, type TarotDetailCard } from "@/lib/tarot/detail";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import {
  DEFAULT_OG_IMAGE,
  ENGLISH_SITE_URL,
  GEORGIAN_SITE_URL,
  localizedAlternates,
} from "@/lib/seo/locales";
import { TAROT_LATIN_QUERIES } from "@/lib/seo/transliteration";
import { articleLd, breadcrumbLd, faqLd, serializeLd } from "@/lib/seo/jsonld";
import { getBillingIdentity, isPremiumUser } from "@/lib/premium";

export const dynamic = "force-dynamic";

const TITLE_KA = "ტარო ქართულად — ტაროზე მკითხაობა და ონლაინ გაშლა";
const DESCRIPTION_KA =
  "ტაროზე მკითხაობა ონლაინ, ქართულად: დაუსვი კითხვა და მიიღე ცოცხალი, პერსონალური პასუხი. ტაროს გაშლა სრული 78-კარტიანი დასტით — პირველი კითხვა უფასოა და პასუხისთვის სწრაფი ანგარიშია საჭირო.";
const TITLE_EN = "Free Online Tarot Reading — Three-Card Spread";
const DESCRIPTION_EN =
  "Ask a question and receive a personal three-card tarot reading. Explore clear upright and reversed meanings for all 78 cards of the full deck.";

const FAQ_KA = [
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
    a: "სრულ 78-კარტიან დასტას — 22 დიდ არკანსა და 56 მცირე არკანას (თასები, ხმლები, კვერთხები, მონეტები). თითო კარტს აქვს პირდაპირი და შებრუნებული მნიშვნელობა.",
  },
];

const FAQ_EN = [
  {
    q: "How does Vivida's online tarot reading work?",
    a: "Write your question and we draw a three-card spread for the root, present and path ahead. The reading connects each card and its orientation directly to your situation.",
  },
  {
    q: "How much does a tarot reading cost?",
    a: `Your first question is free. Each additional reading costs ${CREDIT_COST.tarot} credits, which you can earn through activities on Vivida or add to your balance.`,
  },
  {
    q: "Does tarot predict the future?",
    a: "Tarot is best used as a tool for reflection, not a guarantee of future events. It can reveal patterns, questions and possible next steps while your choices remain your own.",
  },
  {
    q: "Which tarot cards does Vivida use?",
    a: "The full 78-card deck: the 22 Major Arcana plus all 56 Minor Arcana across the Cups, Swords, Wands and Pentacles. Every card carries upright and reversed meanings.",
  },
];

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();

  const en = locale === "en";
  const title = en ? TITLE_EN : TITLE_KA;
  const description = en ? DESCRIPTION_EN : DESCRIPTION_KA;
  const siteUrl = en ? ENGLISH_SITE_URL : GEORGIAN_SITE_URL;
  return {
    title: { absolute: title },
    description,
    keywords: en
      ? [
          "online tarot reading",
          "free tarot reading",
          "three card tarot",
          "Major Arcana meanings",
          "tarot card meanings",
        ]
      : [
          "ტარო",
          "ტარო ქართულად",
          "ტაროზე მკითხაობა",
          "ონლაინ ტარო",
          "ტარო კითხვა",
          "ტაროს გაშლა",
          "ტარო კარტები",
          "უფასო ტარო",
        ],
    alternates: localizedAlternates("/taro", "/taro", en ? "en" : "ka"),
    openGraph: {
      images: [DEFAULT_OG_IMAGE],
      type: "website",
      url: `${siteUrl}/taro`,
      title,
      description,
      siteName: "Vivida",
      locale: en ? "en_US" : "ka_GE",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function TaroHubPage() {
  const session = await auth();
  const userId = session?.user?.id;
  const authed = !!userId;
  const [locale, billingIdentity, premium] = await Promise.all([
    getRequestLocale(),
    userId ? getBillingIdentity(userId) : null,
    userId ? isPremiumUser(userId) : false,
  ]);
  const en = locale === "en";
  const siteUrl = en ? ENGLISH_SITE_URL : GEORGIAN_SITE_URL;
  const title = en ? TITLE_EN : TITLE_KA;
  const description = en ? DESCRIPTION_EN : DESCRIPTION_KA;
  const faq = en ? FAQ_EN : FAQ_KA;

  const ld = [
    articleLd({
      url: `${siteUrl}/taro`,
      headline: title,
      description,
      datePublished: "2026-07-14T00:00:00.000Z",
    }),
    breadcrumbLd([
      { name: en ? "Home" : "მთავარი", url: siteUrl },
      { name: en ? "Tarot" : "ტარო", url: `${siteUrl}/taro` },
    ]),
    faqLd(faq),
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: tarotDetailDeck(en ? "en" : "ka").map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${siteUrl}/taro/${c.slug}`,
        name: c.name,
      })),
    },
  ];

  if (locale === "ka") {
    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeLd(ld) }}
        />
        <TarotConversionLanding
          authed={authed}
          countryCode={billingIdentity?.countryCode ?? "GE"}
          premium={premium}
        />
      </>
    );
  }

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
      {authed ? (
        <AppHeader authed active="tarot" />
      ) : (
        <SmartHeader active="taro" locale={locale} georgianPath="/taro" />
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeLd(ld) }}
      />

      <section className="relative z-10 mx-auto w-full max-w-2xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-10">
        <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            {en ? "Home" : "მთავარი"}
          </Link>
          <span>/</span>
          <span className="text-foreground/80">{en ? "Tarot" : "ტარო"}</span>
        </nav>

        <header className="mb-6 text-center">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {en
              ? "Online tarot · three-card reading"
              : "ონლაინ ტარო · ტაროზე მკითხაობა"}
          </div>
          <h1 className="mt-1 text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
            {en ? "Read the " : "ტარო"}{" "}
            <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
              {en ? "cards" : "ქართულად"}
            </span>
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-foreground/80 sm:text-base">
            {en
              ? "Ask a question and receive a thoughtful, personal three-card reading. Your first reading is free."
              : "ტაროზე მკითხაობა ონლაინ — დაუსვი კითხვა კარტებს და მიიღე ცოცხალი, პერსონალური პასუხი. პირველი კითხვა უფასოა."}
          </p>
        </header>

        <TarotReader
          authed={authed}
          cost={CREDIT_COST.tarot}
          locale={locale}
          countryCode={billingIdentity?.countryCode ?? "GB"}
          premium={premium}
        />

        {/* All cards — internal linking + SEO cluster */}
        <section className="mt-12">
          <h2 className="text-xl font-semibold tracking-tight">
            {en
              ? "The full tarot deck — 78 cards"
              : "ტაროს სრული დასტა — 78 კარტი"}
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {en
              ? "Explore the upright and reversed meaning of every card."
              : "აღმოაჩინე თითო კარტის მნიშვნელობა — პირდაპირი და შებრუნებული."}
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {tarotDetailDeck(en ? "en" : "ka").map((c: TarotDetailCard) => {
              const name = c.name;
              const keywords = c.keywords;
              return (
                <Link
                  key={c.slug}
                  href={`/taro/${c.slug}`}
                  className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/40 px-3.5 py-2.5 text-sm transition-colors hover:bg-card/70"
                >
                  <span className="text-lg">{c.glyph}</span>
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-foreground/90">
                      {name}
                    </span>
                    <span className="block truncate text-[11px] text-muted-foreground">
                      {keywords.slice(0, 2).join(" · ")}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-12">
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

        {/* CTA → natal chart (logged-out visitors only) */}
        {!authed && (
          <div className="mt-14 rounded-2xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/12 via-card/60 to-[var(--vivida-cyan)]/12 p-7 text-center ring-1 ring-foreground/5 backdrop-blur-xl sm:p-10">
            <Sparkles className="mx-auto mb-3 size-7 text-[var(--vivida-violet)]" />
            <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
              {en ? "Cards and stars, together" : "ტაროც და ვარსკვლავებიც"}
            </h2>
            <p className="mx-auto mt-3 max-w-md text-pretty text-base text-muted-foreground">
              {en
                ? "Your natal chart adds a deeper, lasting picture: the Moon, Venus, the planets and all twelve houses. Create yours for free."
                : "შენი ნატალური რუკა ტაროზე ღრმა და მუდმივ სურათს ხატავს — მთვარე, ვენერა, ცის 12 სახლი. შექმენი უფასოდ."}
            </p>
            <Link
              href={en ? "/natal-chart" : "/nataluri-ruka"}
              className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-[linear-gradient(135deg,var(--vivida-violet),var(--vivida-pink))] px-5 py-2.5 text-sm font-semibold text-white"
            >
              {en ? "Create my natal chart" : "ჩემი ნატალური რუკა"}
              <ArrowRight className="size-4" />
            </Link>
          </div>
        )}

        {!authed && (
          <PopularSearches
            locale={locale}
            queries={
              en
                ? [
                    "free online tarot reading",
                    "three card tarot spread",
                    "Major Arcana meanings",
                    "upright and reversed tarot cards",
                  ]
                : TAROT_LATIN_QUERIES
            }
          />
        )}
      </section>

      <SiteFooter locale={locale} />
    </main>
  );
}
