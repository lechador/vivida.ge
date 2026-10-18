import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { auth } from "@/auth";
import { CREDIT_COST } from "@/lib/credits-config";
import { AppHeader } from "@/components/nav/app-header";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import { TarotReader } from "@/components/tarot/tarot-reader";
import { TarotConversionLanding } from "@/components/tarot/tarot-conversion-landing";
import { SiteFooter } from "@/components/site-footer";
import { Accent } from "@/components/en/editorial";
import { Button } from "@/components/ui/button";
import { tarotDetailDeck, type TarotDetailCard } from "@/lib/tarot/detail";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import {
  DEFAULT_OG_IMAGE,
  ENGLISH_SITE_URL,
  GEORGIAN_SITE_URL,
  localizedAlternates,
} from "@/lib/seo/locales";
import { articleLd, breadcrumbLd, faqLd, serializeLd } from "@/lib/seo/jsonld";
import { localizedHref } from "@/lib/seo/public-paths";
import { getBillingIdentity, isPremiumUser } from "@/lib/premium";

export const dynamic = "force-dynamic";

const TITLE_KA = "ტარო ქართულად, ტაროზე მკითხაობა და ონლაინ გაშლა";
const DESCRIPTION_KA =
  "ტაროზე მკითხაობა ონლაინ, ქართულად: დაუსვი კითხვა და მიიღე ცოცხალი, პერსონალური პასუხი. ტაროს გაშლა სრული 78-კარტიანი დასტით, პირველი კითხვა უფასოა და პასუხისთვის სწრაფი ანგარიშია საჭირო.";
const TITLE_EN = "Free Online Tarot Reading, Three-Card Spread";
const DESCRIPTION_EN =
  "Ask a question and receive a personal three-card tarot reading. Explore clear upright and reversed meanings for all 78 cards of the full deck.";

const FAQ_KA = [
  {
    q: "როგორ მუშაობს ონლაინ ტარო Vivida-ზე?",
    a: "დაწერე შენი კითხვა, ჩვენ კი შემთხვევითად ვშლით 3-კარტიან განლაგებას (ფესვი, აწმყო, გზა) და AI ტაროლოგი წერს პერსონალურ პასუხს ქართულად, სამივე კარტს შენს კითხვასთან აკავშირებს.",
  },
  {
    q: "რამდენი ღირს ტარო კითხვა?",
    a: `პირველი კითხვა სრულიად უფასოა. ყოველი შემდეგი კითხვა ${CREDIT_COST.tarot} კრედიტი ღირს. საწყის კრედიტებს რეგისტრაციისას იღებ; დამატებითი კრედიტების მიღება შეგიძლია თვის ბონუსით ან შესაბამისი აქტივობით, ასევე ბალანსის შევსებით.`,
  },
  {
    q: "ტარო მართლა წინასწარმეტყველებს მომავალს?",
    a: "ტარო წინასწარმეტყველება კი არა, ხედვის ინსტრუმენტია, ის გეხმარება საკუთარი სიტუაცია სხვა კუთხიდან დაინახო და უკეთესი გადაწყვეტილება მიიღო. მომავალი შენს ხელთაა.",
  },
  {
    q: "რომელ კარტებს იყენებთ?",
    a: "სრულ 78-კარტიან დასტას, 22 დიდ არკანსა და 56 მცირე არკანას (თასები, ხმლები, კვერთხები, მონეტები). თითო კარტს აქვს პირდაპირი და შებრუნებული მნიშვნელობა.",
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
      url: `${siteUrl}${localizedHref("/taro", locale)}`,
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
      url: `${siteUrl}${localizedHref("/taro", locale)}`,
      headline: title,
      description,
      datePublished: "2026-07-14T00:00:00.000Z",
    }),
    breadcrumbLd([
      { name: en ? "Home" : "მთავარი", url: siteUrl },
      {
        name: en ? "Tarot" : "ტარო",
        url: `${siteUrl}${localizedHref("/taro", locale)}`,
      },
    ]),
    faqLd(faq),
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: tarotDetailDeck(en ? "en" : "ka").map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${siteUrl}${localizedHref(`/taro/${c.slug}`, locale)}`,
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
      className="relative isolate flex min-h-screen flex-col overflow-hidden bg-background"
    >
      <Starfield count={48} />
      {authed ? (
        <AppHeader authed active="tarot" />
      ) : (
        <SmartHeader active="taro" locale={locale} georgianPath="/taro" />
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeLd(ld) }}
      />

      <section className="relative z-10 mx-auto w-full max-w-4xl px-4 pb-16 pt-8 sm:px-6 sm:pb-24 sm:pt-12">
        <nav className="mb-8 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            {en ? "Home" : "მთავარი"}
          </Link>
          <span>/</span>
          <span className="text-foreground/80">{en ? "Tarot" : "ტარო"}</span>
        </nav>

        <header className="mb-8 border-b border-border pb-8">
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
            {en
              ? "Online Tarot · Three-Card Spread"
              : "ონლაინ ტარო · ტაროზე მკითხაობა"}
          </div>
          <h1 className="font-display mt-2 text-balance text-4xl font-normal leading-[1.06] tracking-[-0.02em] sm:text-5xl">
            {en ? "Read the " : "ტარო"}{" "}
            <Accent>{en ? "cards" : "ქართულად"}</Accent>
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground sm:text-base">
            {en ? (
              <>
                Ask a question and receive a thoughtful, personal three-card
                reading. {!premium && "Your first reading is free."}
              </>
            ) : (
              <>
                ტაროზე მკითხაობა ონლაინ, დაუსვი კითხვა კარტებს და მიიღე ცოცხალი,
                პერსონალური პასუხი. {!premium && "პირველი კითხვა უფასოა."}
              </>
            )}
          </p>
        </header>

        <TarotReader
          authed={authed}
          cost={CREDIT_COST.tarot}
          locale={locale}
          countryCode={billingIdentity?.countryCode ?? "GB"}
          premium={premium}
        />

        {/* All cards, internal linking + SEO cluster */}
        <section className="mt-16">
          <div className="mb-4 flex items-baseline justify-between gap-4">
            <h2 className="font-display text-2xl font-normal tracking-tight">
              {en
                ? "The full tarot deck · 78 cards"
                : "ტაროს სრული დასტა · 78 კარტი"}
            </h2>
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              78 Cards
            </span>
          </div>
          <p className="mb-5 text-sm text-muted-foreground">
            {en
              ? "Explore the upright and reversed meaning of every card."
              : "აღმოაჩინე თითო კარტის მნიშვნელობა, პირდაპირი და შებრუნებული."}
          </p>
          <div className="grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {tarotDetailDeck(en ? "en" : "ka").map((c: TarotDetailCard) => {
              const name = c.name;
              const keywords = c.keywords;
              return (
                <Link
                  key={c.slug}
                  href={localizedHref(`/taro/${c.slug}`, locale)}
                  className="flex items-center gap-3 bg-card px-4 py-3 text-sm transition-colors hover:bg-secondary/45"
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-sm border border-border bg-background/60 text-base">
                    {c.glyph}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-foreground">
                      {name}
                    </span>
                    <span className="block truncate font-mono text-[11px] text-muted-foreground">
                      {keywords.slice(0, 2).join(" · ")}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-16">
          <h2 className="mb-4 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            {en ? "Frequently asked questions" : "ხშირად დასმული კითხვები"}
          </h2>
          <div className="divide-y divide-border overflow-hidden rounded-md border border-border bg-card">
            {faq.map((item) => (
              <details key={item.q} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 font-medium text-foreground transition-colors hover:bg-secondary/30 [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span className="font-mono text-sm text-muted-foreground transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="border-t border-border/60 bg-background/40 px-5 py-4 text-[15px] leading-relaxed text-muted-foreground">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA → natal chart (logged-out visitors only) */}
        {!authed && (
          <div className="mt-16 flex flex-col justify-between gap-6 rounded-md border border-border bg-card p-6 sm:flex-row sm:items-center sm:p-8">
            <div className="max-w-xl">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
                {en ? "Natal Ephemeris" : "ნატალური ასტროლოგია"}
              </p>
              <h2 className="font-display mt-2 text-balance text-2xl font-normal tracking-tight sm:text-3xl">
                {en ? "Cards and stars, together" : "ტაროც და ვარსკვლავებიც"}
              </h2>
              <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
                {en
                  ? "Your natal chart adds a deeper, lasting picture: the Moon, Venus, the planets and all twelve houses. Create yours for free."
                  : "შენი ნატალური რუკა ტაროზე ღრმა და მუდმივ სურათს ხატავს, მთვარე, ვენერა, ცის 12 სახლი. შექმენი უფასოდ."}
              </p>
            </div>
            <Button asChild size="lg" className="shrink-0">
              <Link href={en ? "/natal-chart" : "/nataluri-ruka"}>
                {en ? "Create my natal chart" : "ჩემი ნატალური რუკა"}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        )}
      </section>

      <SiteFooter locale={locale} />
    </main>
  );
}
