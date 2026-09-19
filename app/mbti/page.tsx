import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

import { PopularSearches } from "@/components/seo/popular-searches";
import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import { Button } from "@/components/ui/button";
import { MBTI_TYPES } from "@/lib/mbti-library";
import { mbtiCharacterSrc } from "@/lib/mbti-characters";
import { buildMbtiSeo, buildMbtiSeoEn, MBTI_GROUP } from "@/lib/seo/mbti-seo";
import { breadcrumbLd, faqLd, serializeLd } from "@/lib/seo/jsonld";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import {
  DEFAULT_OG_IMAGE,
  ENGLISH_SITE_URL,
  GEORGIAN_SITE_URL,
  localizedAlternates,
} from "@/lib/seo/locales";

const TITLE_KA = "16 პიროვნების ტიპი — MBTI ტიპები ქართულად";
const DESCRIPTION_KA =
  "16 პიროვნების ტიპის სრული ჩამონათვალი ქართულად (MBTI / 16Personalities). აღწერა, ძლიერი და სუსტი მხარეები, ურთიერთობები და კარიერა — გაიარე უფასო პიროვნების ტესტი.";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();

  const en = locale === "en";
  if (!en) {
    return {
      title: { absolute: TITLE_KA },
      description: DESCRIPTION_KA,
      keywords: [
        "16 პიროვნების ტიპი",
        "პიროვნების ტიპები",
        "mbti ტიპები",
        "mbti ქართულად",
        "16 personalities ქართულად",
        "პიროვნების ტესტი",
        "ფსიქოლოგიური ტიპები",
      ],
      alternates: localizedAlternates("/mbti", "/mbti", "ka"),
      openGraph: {
        images: [DEFAULT_OG_IMAGE],
        type: "website",
        url: `${GEORGIAN_SITE_URL}/mbti`,
        title: TITLE_KA,
        description: DESCRIPTION_KA,
        siteName: "Vivida",
        locale: "ka_GE",
      },
      twitter: {
        card: "summary_large_image",
        title: TITLE_KA,
        description: DESCRIPTION_KA,
      },
    };
  }

  const title = "16 Personality Types — Explore Every Type";
  const description =
    "Explore all 16 MBTI-style personality types, including preferences, strengths, challenges, relationships, careers and practical growth ideas.";
  return {
    title: { absolute: title },
    description,
    keywords: [
      "16 personality types",
      "MBTI personality types",
      "personality type descriptions",
      "free personality test",
    ],
    alternates: localizedAlternates("/mbti", "/mbti", "en"),
    openGraph: {
      images: [DEFAULT_OG_IMAGE],
      type: "website",
      url: `${ENGLISH_SITE_URL}/mbti`,
      title,
      description,
      siteName: "Vivida",
      locale: "en_US",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

const GROUP_ORDER = [
  "analysts",
  "diplomats",
  "sentinels",
  "explorers",
] as const;
const GROUP_LABEL: Record<
  string,
  {
    labelKa: string;
    blurbKa: string;
    labelEn: string;
    blurbEn: string;
    labelAm: string;
    blurbAm: string;
  }
> = {
  analysts: {
    labelKa: "ანალიტიკოსები",
    blurbKa: "ლოგიკა, სტრატეგია და დამოუკიდებელი აზროვნება.",
    labelEn: "Analysts",
    blurbEn: "Logic, strategy and independent thinking.",
    labelAm: "Անալիտիկներ",
    blurbAm: "Տրամաբանություն, ռազմավարություն և անկախ մտածողություն:",
  },
  diplomats: {
    labelKa: "დიპლომატები",
    blurbKa: "ემპათია, იდეალიზმი და ღრმა ღირებულებები.",
    labelEn: "Diplomats",
    blurbEn: "Empathy, imagination and values-led connection.",
    labelAm: "Դիվանագետներ",
    blurbAm: "Էմպաթիա, իդեալիզմ և խորը արժեքներ:",
  },
  sentinels: {
    labelKa: "მცველები",
    blurbKa: "წესრიგი, საიმედოობა და პრაქტიკულობა.",
    labelEn: "Sentinels",
    blurbEn: "Structure, reliability and practical care.",
    labelAm: "Պահապաններ",
    blurbAm: "Կարգուկանոն, հուսալիություն և գործնականություն:",
  },
  explorers: {
    labelKa: "მკვლევრები",
    blurbKa: "სპონტანურობა, ხელოვნება და მოქმედება.",
    labelEn: "Explorers",
    blurbEn: "Adaptability, direct experience and action.",
    labelAm: "Հետազոտողներ",
    blurbAm: "Ինքնաբուխություն, արվեստ և գործողություն:",
  },
};

export default async function MbtiHubPage() {
  const locale = await getRequestLocale();
  const en = locale === "en";
  const siteUrl = en ? ENGLISH_SITE_URL : GEORGIAN_SITE_URL;
  const byGroup = GROUP_ORDER.map((g) => ({
    group: g,
    ...GROUP_LABEL[g],
    types: (MBTI_TYPES as readonly string[]).filter(
      (t) => MBTI_GROUP[t]?.key === g,
    ),
  }));

  const faq = en
    ? [
        {
          q: "What are the 16 personality types?",
          a: "The framework combines preferences across four paired dimensions: Extraversion or Introversion, Sensing or Intuition, Thinking or Feeling, and Judging or Prospecting. Their combinations form sixteen type codes.",
        },
        {
          q: "How can I find my personality type?",
          a: "Take Vivida’s free 60-question personality test. It takes about seven minutes and gives you a type plus percentages across five dimensions.",
        },
        {
          q: "Is a personality type a diagnosis?",
          a: "No. A type is a vocabulary for recurring preferences, not a diagnosis, fixed identity or measure of ability.",
        },
      ]
    : [
        {
          q: "რა არის 16 პიროვნების ტიპი?",
          a: "16 პიროვნების ტიპი (MBTI / 16Personalities) ხასიათს აღწერს ოთხი ღერძით: ინტროვერსია/ექსტრავერსია, სენსორიკა/ინტუიცია, ლოგიკა/გრძნობა და ორგანიზებულობა/სპონტანურობა. მათი კომბინაცია ქმნის 16 უნიკალურ ტიპს.",
        },
        {
          q: "როგორ გავიგო ჩემი ტიპი?",
          a: "გაიარე უფასო Astro-MBTI ტესტი — 60 კითხვა, დაახლოებით 7 წუთი. მიიღებ შენს ზუსტ ტიპსა და დეტალურ პერსონალურ ანალიზს.",
        },
      ];

  const ld = [
    breadcrumbLd([
      { name: en ? "Home" : "მთავარი", url: siteUrl },
      {
        name: en ? "Tests" : "ტესტები",
        url: `${siteUrl}/tests`,
      },
      {
        name: en ? "Personality types" : "პიროვნების ტიპები",
        url: `${siteUrl}/mbti`,
      },
    ]),
    faqLd(faq),
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: (MBTI_TYPES as readonly string[]).map((t, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${siteUrl}/mbti/${t.toLowerCase()}`,
        name: `${t} — ${en ? buildMbtiSeoEn(t).archetype : buildMbtiSeo(t).archetypeKa}`,
      })),
    },
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

      <SmartHeader active="tests" locale={locale} georgianPath="/mbti" />

      <section className="relative z-10 mx-auto w-full max-w-4xl px-4 pb-16 pt-6 sm:px-6 sm:pt-8">
        <header className="mb-8 text-center sm:mb-10">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            MBTI · 16Personalities
          </div>
          <h1 className="mt-1 text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
            {en ? "16 personality" : "16 პიროვნების"}{" "}
            <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
              {en ? "types" : "ტიპი"}
            </span>
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-pretty text-sm text-foreground/80 sm:text-base">
            {en
              ? "Choose a type to explore its preferences, strengths, relationships and growth—or take the test to discover your own."
              : "აირჩიე ტიპი და წაიკითხე სრული აღწერა ქართულად — ან გაიარე ტესტი და გაიგე შენი ტიპი."}
          </p>
          <Button asChild variant="mystic" size="lg" className="mt-5">
            <Link href={"/pirovnebis-testi"}>
              {en ? "Take the personality test" : "გაიარე ტესტი"}
            </Link>
          </Button>
        </header>

        <div className="space-y-8">
          {byGroup.map((g) => (
            <div key={g.group}>
              <div className="mb-3">
                <h2 className="text-lg font-semibold tracking-tight">
                  {en ? g.labelEn : g.labelKa}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {en ? g.blurbEn : g.blurbKa}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {g.types.map((t) => {
                  const s = en ? buildMbtiSeoEn(t) : buildMbtiSeo(t);
                  const archetype =
                    "archetype" in s ? s.archetype : s.archetypeKa;
                  return (
                    <Link
                      key={t}
                      href={`/mbti/${s.slug}`}
                      className="flex flex-col items-center rounded-2xl border border-border bg-card/50 p-4 text-center ring-1 ring-foreground/5 backdrop-blur-xl transition-colors hover:border-[var(--vivida-violet)]/50 hover:bg-card/70"
                    >
                      <Image
                        src={mbtiCharacterSrc(t)}
                        alt={`${t} — ${archetype}`}
                        width={96}
                        height={96}
                        className="h-20 w-20 object-contain"
                      />
                      <span className="mt-2 text-base font-bold tracking-wide">
                        {t}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {archetype}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

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

        <PopularSearches
          locale={locale}
          queries={
            en
              ? [
                  "16 personality types",
                  "MBTI type descriptions",
                  "free personality test",
                  "personality type strengths",
                  "discover my personality type",
                ]
              : [
                  "16 პიროვნების ტიპი",
                  "პიროვნების ტესტი",
                  "mbti ქართულად",
                  "16 personalities ქართულად",
                  "ფსიქოლოგიური ტესტი",
                ]
          }
        />
      </section>

      <SiteFooter locale={locale} />
    </main>
  );
}
