import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { EnglishShell } from "@/components/en/english-shell";
import { Accent, Kicker } from "@/components/en/editorial";
import { HeroPreview } from "@/components/landing/hero-preview";
import { CornerCrosshair } from "@/components/brand/celestial-icons";
import { LatestArticlesSection } from "@/components/articles/latest-articles-section";
import {
  DEFAULT_OG_IMAGE,
  ENGLISH_SITE_URL,
  localizedAlternates,
} from "@/lib/seo/locales";

const URL = ENGLISH_SITE_URL;
const TITLE = "Natal Charts, Horoscopes and Zodiac Guides, Vivida";
const DESCRIPTION =
  "Understand your natal chart, zodiac signs and compatibility through clear English astrology guides. Vivida combines astronomical chart data with practical self-reflection tools.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: localizedAlternates("/en", "/", "en"),
  openGraph: {
    images: [DEFAULT_OG_IMAGE],
    title: TITLE,
    description: DESCRIPTION,
    url: URL,
    locale: "en_US",
    alternateLocale: ["ka_GE"],
  },
  twitter: { title: TITLE, description: DESCRIPTION },
};

const TELEMETRY_SPEC_EN = [
  {
    index: "01",
    metric: "0°01′ Arc Precision",
    label: "Swiss Ephemeris astronomical engine",
  },
  {
    index: "02",
    metric: "12 Houses · 10 Bodies",
    label: "Complete natal & transit architecture",
  },
  {
    index: "03",
    metric: "78 Cards · 3 Spreads",
    label: "Personal Tarot & Major/Minor Arcana",
  },
  {
    index: "04",
    metric: "4 Psychometrics",
    label: "Astro-MBTI, Big Five, IQ & EQ",
  },
];

const GUIDES = [
  {
    href: "/natal-chart",
    title: "Natal chart",
    text: "Learn what a birth chart contains and how planets, signs, houses and aspects work together.",
  },
  {
    href: "/horoscope",
    title: "Horoscope",
    text: "Understand how daily forecasts are created from current planetary movements.",
  },
  {
    href: "/zodiac",
    title: "Zodiac signs",
    text: "Explore the twelve signs, their elements, modalities and traditional ruling planets.",
  },
  {
    href: "/compatibility",
    title: "Compatibility",
    text: "See why meaningful compatibility considers more than two Sun signs.",
  },
];

const FAQ = [
  {
    q: "Is Vivida available in English?",
    a: "Yes. Public guides, account features, personalized natal reports, daily and weekly forecasts, compatibility readings, Tarot, and the main self-discovery assessments are available in English.",
  },
  {
    q: "Is a natal chart the same as a horoscope?",
    a: "A natal chart maps the sky for one birth moment and remains fixed. A horoscope compares current planetary movements with a sign or natal chart, so it changes with time.",
  },
  {
    q: "Do I need an exact birth time?",
    a: "An exact time is important for the Ascendant and house positions. Many planetary sign placements can still be calculated without it, but the chart will be less specific.",
  },
  {
    q: "Is astrology scientific advice?",
    a: "No. Vivida presents astrology for entertainment, reflection and cultural interest. It is not medical, psychological, legal or financial advice.",
  },
];

export default function EnglishHomePage() {
  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Vivida",
      url: URL,
      inLanguage: "en",
      description: DESCRIPTION,
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
  ];

  return (
    <EnglishShell georgianPath="/">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />

      {/* Swiss-Grid Architectural Hero Ledger */}
      <section className="mx-auto w-full max-w-7xl px-4 pt-6 sm:px-6 sm:pt-10">
        <div className="relative border border-border bg-card/40">
          <CornerCrosshair position="top-left" />
          <CornerCrosshair position="top-right" />
          <CornerCrosshair position="bottom-left" />
          <CornerCrosshair position="bottom-right" />

          {/* Top Meta Index Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-background/70 px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground sm:px-8">
            <span className="text-primary">
              VOL. IV · Astronomical Almanac & Personal Observatory
            </span>
            <span className="tabular-nums">
              Ephemeris Meridian · 41°43′N 44°47′E
            </span>
          </div>

          <div className="grid items-stretch divide-y divide-border lg:grid-cols-[1.12fr_0.88fr] lg:divide-x lg:divide-y-0">
            {/* Left Column: Proposition & Action */}
            <div className="flex flex-col justify-between p-6 sm:p-10 lg:p-12">
              <div>
                <Kicker>Astronomical Ephemeris · Tarot · Personal Chart</Kicker>
                <h1 className="font-display mt-6 max-w-xl text-balance text-5xl font-normal leading-[1.04] tracking-[-0.015em] sm:text-6xl">
                  Birth data in. A chart you can <Accent>actually read.</Accent>
                </h1>
                <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
                  Precision birth-chart calculator, three-card Tarot studio, and
                  a personal astrologer grounded in your exact planetary
                  degrees, twelve houses, and live transits.
                </p>
                <div className="mt-8 flex flex-wrap gap-3.5">
                  <Link
                    href="/natal-chart"
                    className="inline-flex h-12 items-center gap-2 whitespace-nowrap rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    Calculate my chart, free <ArrowRight className="size-4" />
                  </Link>
                  <Link
                    href="/tarot"
                    className="inline-flex h-12 items-center gap-2 whitespace-nowrap rounded-md border border-border bg-card px-6 text-sm font-medium text-foreground transition-colors hover:border-primary/50 hover:bg-secondary"
                  >
                    Open Tarot Studio
                  </Link>
                </div>
              </div>

              <div className="mt-10 border-t border-border/80 pt-6">
                <p className="text-xs text-muted-foreground">
                  Free natal ephemeris · No card required · Exact degree &amp;
                  house cusps
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[11px] uppercase tracking-[0.14em]">
                  <Link
                    href="/natal-chart"
                    className="text-foreground/85 transition-colors hover:text-primary"
                  >
                    01. Natal Chart →
                  </Link>
                  <Link
                    href="/compatibility"
                    className="text-foreground/85 transition-colors hover:text-primary"
                  >
                    02. Synastry →
                  </Link>
                  <Link
                    href="/mtvaris-kalendari"
                    className="text-foreground/85 transition-colors hover:text-primary"
                  >
                    03. Moon Calendar →
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Astrolabe Console */}
            <div className="flex flex-col">
              <HeroPreview locale="en" />
            </div>
          </div>

          {/* 4-Column Astronomical Telemetry Strip */}
          <div className="grid grid-cols-2 gap-px border-t border-border bg-border lg:grid-cols-4">
            {TELEMETRY_SPEC_EN.map((item) => (
              <div
                key={item.index}
                className="bg-background/85 px-5 py-4 sm:px-6 sm:py-5"
              >
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
                  {item.index}
                </div>
                <div className="mt-1 font-mono text-base font-semibold tabular-nums tracking-tight text-foreground sm:text-lg">
                  {item.metric}
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architectural Almanac Directory */}
      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="border border-border bg-card/30">
          <div className="grid gap-8 border-b border-border p-6 sm:p-10 lg:grid-cols-[0.9fr_1.1fr] lg:divide-x lg:divide-border lg:p-0">
            <div className="lg:p-10">
              <Kicker>A thoughtful starting point</Kicker>
              <h2 className="font-display mt-3 text-balance text-3xl font-normal tracking-[-0.01em] sm:text-5xl">
                Astrology is a <Accent>system of relationships</Accent>
              </h2>
            </div>
            <div className="space-y-4 text-pretty text-base leading-relaxed text-muted-foreground lg:p-10">
              <p>
                A single zodiac sign is only one part of the picture. A natal
                chart records the positions of the Sun, Moon and planets at a
                specific moment and place. Signs describe how an energy is
                expressed, houses describe where it tends to appear, and aspects
                describe how different parts of the chart interact.
              </p>
              <p>
                Vivida organizes these layers into approachable instruments and
                educational monographs. Use them as prompts for reflection, not
                as certainty or a substitute for professional advice.
              </p>
            </div>
          </div>

          <ol className="divide-y divide-border">
            {GUIDES.map(({ href, title, text }, i) => (
              <li key={href}>
                <Link
                  href={href}
                  className="group grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-5 bg-card px-6 py-6 transition-colors hover:bg-secondary/45 sm:gap-8 sm:px-10 sm:py-7"
                >
                  <span className="font-mono text-xs tabular-nums text-primary">
                    0{i + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="font-display block text-balance text-2xl font-normal tracking-[-0.01em] text-foreground sm:text-3xl">
                      {title}
                    </span>
                    <span className="mt-1.5 block max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                      {text}
                    </span>
                  </span>
                  <ArrowRight className="size-5 shrink-0 text-primary transition-transform group-hover:translate-x-1" />
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <LatestArticlesSection locale="en" />

      {/* 3-Step Methodology Ledger */}
      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="mb-8">
          <Kicker>How Vivida works</Kicker>
          <h2 className="font-display mt-3 text-3xl font-normal tracking-[-0.01em] sm:text-4xl">
            From astronomical coordinates to personal synthesis
          </h2>
        </div>
        <div className="grid gap-px border border-border bg-border sm:grid-cols-3">
          {[
            [
              "01",
              "Enter accurate details",
              "Your birth date, place and, when known, exact time establish the astronomical chart.",
            ],
            [
              "02",
              "Read the chart layers",
              "Begin with the Sun, Moon and Ascendant, then add planets, houses and aspects.",
            ],
            [
              "03",
              "Reflect, don't predict",
              "Use recurring themes as questions and perspectives rather than fixed outcomes.",
            ],
          ].map(([n, title, text]) => (
            <article key={n} className="bg-card p-6 sm:p-8">
              <span className="font-mono text-xs font-semibold tabular-nums text-primary">
                {n}.
              </span>
              <h3 className="font-display mt-3 text-2xl font-normal tracking-[-0.01em] text-foreground">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {text}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* FAQ Ledger */}
      <section className="mx-auto w-full max-w-4xl px-4 py-14 sm:px-6 sm:py-20">
        <Kicker>Reference</Kicker>
        <h2 className="font-display mt-3 text-3xl font-normal tracking-[-0.01em] sm:text-4xl">
          Frequently asked questions
        </h2>
        <div className="mt-8 divide-y divide-border border border-border bg-card">
          {FAQ.map((item) => (
            <details key={item.q} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-medium text-foreground transition-colors hover:bg-secondary/30 [&::-webkit-details-marker]:hidden">
                <span>{item.q}</span>
                <span className="font-mono text-sm text-muted-foreground transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="border-t border-border/60 bg-background/40 px-5 py-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </section>
    </EnglishShell>
  );
}
