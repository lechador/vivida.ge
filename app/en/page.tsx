import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Heart, Orbit, Sparkles } from "lucide-react";

import { EnglishShell } from "@/components/en/english-shell";
import { Accent, Kicker } from "@/components/en/editorial";
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

      <section className="mx-auto grid w-full max-w-6xl items-center gap-10 px-5 pb-16 pt-14 sm:px-6 sm:pb-24 sm:pt-20 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <Kicker>AI tarot · AI astrologer · Human readings</Kicker>
          <h1 className="font-display mt-7 max-w-xl text-balance text-5xl font-medium leading-[1.04] tracking-[-0.015em] sm:text-6xl">
            Birth data in. A chart you can <Accent>actually read.</Accent>
          </h1>
          <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-foreground/80 sm:text-xl">
            Free birth-chart calculator, AI tarot and an AI astrologer that
            knows your chart, plus human readings from vetted readers, delivered
            in 24–48h.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href="/natal-chart"
              className="inline-flex items-center gap-2 rounded-xl bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink))] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-950/30"
            >
              Calculate my chart, free <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/tarot"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/60 px-5 py-3 text-sm font-semibold hover:bg-card"
            >
              Try AI tarot
            </Link>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Free calculator · No card required · Pay by card, readers receive
            USDC on Solana
          </p>
        </div>
        <aside
          className="rounded-3xl border border-border bg-card/55 p-6 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-7"
          aria-label="What you get"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--vivida-cyan)]">
            What you get
          </p>
          <ul className="mt-5 space-y-5">
            <li className="flex gap-3.5">
              <Orbit className="mt-0.5 size-5 shrink-0 text-[var(--vivida-violet)]" />
              <div>
                <p className="font-semibold">Planets, houses &amp; aspects</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Full placement data from your birth date, time and place,
                  free, no registration.
                </p>
              </div>
            </li>
            <li className="flex gap-3.5">
              <Sparkles className="mt-0.5 size-5 shrink-0 text-[var(--vivida-pink)]" />
              <div>
                <p className="font-semibold">
                  Plain-English Big Three + AI analysis
                </p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Sun, Moon and Rising decoded, then ask the AI astrologer
                  anything about your chart.
                </p>
              </div>
            </li>
            <li className="flex gap-3.5">
              <Heart className="mt-0.5 size-5 shrink-0 text-[var(--vivida-cyan)]" />
              <div>
                <p className="font-semibold">Human readings from $19.99</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Commission a vetted reader, tarot, birth chart or
                  compatibility, delivered in 24–48h.
                </p>
              </div>
            </li>
          </ul>
          <Link
            href="/how-it-works"
            className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-[var(--vivida-cyan)]"
          >
            See how it works <ArrowRight className="size-4" />
          </Link>
        </aside>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-20">
        <div className="mb-9 max-w-3xl">
          <Kicker>A thoughtful starting point</Kicker>
          <h2 className="font-display mt-3 text-balance text-3xl font-medium tracking-[-0.01em] sm:text-5xl">
            Astrology is a <Accent>system of relationships</Accent>
          </h2>
          <p className="mt-5 text-pretty text-base leading-relaxed text-foreground/80 sm:text-lg">
            A single zodiac sign is only one part of the picture. A natal chart
            records the positions of the Sun, Moon and planets at a specific
            moment and place. Signs describe how an energy is expressed, houses
            describe where it tends to appear, and aspects describe how
            different parts of the chart interact.
          </p>
          <p className="mt-4 text-pretty text-base leading-relaxed text-foreground/80 sm:text-lg">
            Vivida organizes these layers into approachable tools and
            educational guides. Use them as prompts for reflection, not as
            certainty, diagnosis or a substitute for professional advice.
          </p>
        </div>

        <ol className="border-t border-border/60">
          {GUIDES.map(({ href, title, text }, i) => (
            <li key={href} className="border-b border-border/60">
              <Link
                href={href}
                className="group grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 py-6 sm:gap-8 sm:py-7"
              >
                <span className="font-display text-sm italic text-muted-foreground">
                  0{i + 1}
                </span>
                <span className="min-w-0">
                  <span className="font-display block text-balance text-2xl font-medium tracking-[-0.01em] sm:text-3xl">
                    {title}
                  </span>
                  <span className="mt-1.5 block max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {text}
                  </span>
                </span>
                <ArrowRight className="size-5 shrink-0 text-[var(--vivida-cyan)] transition-transform group-hover:translate-x-1" />
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <LatestArticlesSection locale="en" />

      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-20">
        <Kicker>How Vivida works</Kicker>
        <div className="mt-8 grid gap-8 sm:grid-cols-3 sm:gap-6">
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
            <article key={n} className="border-t border-border/60 pt-5">
              <span className="font-display text-4xl italic text-muted-foreground">
                {n}
              </span>
              <h3 className="font-display mt-3 text-xl font-medium tracking-[-0.01em]">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {text}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
        <Kicker>Questions</Kicker>
        <h2 className="font-display mt-3 text-3xl font-medium tracking-[-0.01em] sm:text-4xl">
          Frequently asked questions
        </h2>
        <div className="mt-8 space-y-3">
          {FAQ.map((item) => (
            <details
              key={item.q}
              className="group rounded-2xl border border-border bg-card/55 p-5"
            >
              <summary className="cursor-pointer list-none font-medium">
                {item.q}
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-foreground/80 sm:text-base">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </section>
    </EnglishShell>
  );
}
