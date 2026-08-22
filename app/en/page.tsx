import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Compass, Heart, Languages, Orbit, Sparkles } from "lucide-react";

import { EnglishShell } from "@/components/en/english-shell";
import { LatestArticlesSection } from "@/components/articles/latest-articles-section";
import { DEFAULT_OG_IMAGE, ENGLISH_SITE_URL, localizedAlternates } from "@/lib/seo/locales";

const URL = ENGLISH_SITE_URL;
const TITLE = "Natal Charts, Horoscopes and Zodiac Guides — Vivida";
const DESCRIPTION =
  "Understand your natal chart, zodiac signs and compatibility through clear English astrology guides. Vivida combines astronomical chart data with practical self-reflection tools.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: localizedAlternates("/en", "/", "en"),
  openGraph: { images: [DEFAULT_OG_IMAGE], title: TITLE, description: DESCRIPTION, url: URL, locale: "en_US", alternateLocale: ["ka_GE"] },
  twitter: { title: TITLE, description: DESCRIPTION },
};

const GUIDES = [
  { href: "/natal-chart", icon: Orbit, title: "Natal chart", text: "Learn what a birth chart contains and how planets, signs, houses and aspects work together." },
  { href: "/horoscope", icon: Sparkles, title: "Horoscope", text: "Understand how daily forecasts are created from current planetary movements." },
  { href: "/zodiac", icon: Compass, title: "Zodiac signs", text: "Explore the twelve signs, their elements, modalities and traditional ruling planets." },
  { href: "/compatibility", icon: Heart, title: "Compatibility", text: "See why meaningful compatibility considers more than two Sun signs." },
];

const FAQ = [
  { q: "Is Vivida available in English?", a: "Yes. Public guides, account features, personalized natal reports, daily and weekly forecasts, compatibility readings, Tarot, and the main self-discovery assessments are available in English." },
  { q: "Is a natal chart the same as a horoscope?", a: "A natal chart maps the sky for one birth moment and remains fixed. A horoscope compares current planetary movements with a sign or natal chart, so it changes with time." },
  { q: "Do I need an exact birth time?", a: "An exact time is important for the Ascendant and house positions. Many planetary sign placements can still be calculated without it, but the chart will be less specific." },
  { q: "Is astrology scientific advice?", a: "No. Vivida presents astrology for entertainment, reflection and cultural interest. It is not medical, psychological, legal or financial advice." },
];

export default function EnglishHomePage() {
  const ld = [
    { "@context": "https://schema.org", "@type": "WebSite", name: "Vivida", url: URL, inLanguage: "en", description: DESCRIPTION },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQ.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })) },
  ];

  return (
    <EnglishShell georgianPath="/">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      <section className="mx-auto flex max-w-6xl flex-col items-center px-5 pb-20 pt-16 text-center sm:px-6 sm:pb-28 sm:pt-24">
        <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/50 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
          <Languages className="size-3.5 text-[var(--vivida-cyan)]" /> English guides are now available
        </span>
        <h1 className="mt-7 max-w-4xl text-balance text-4xl font-semibold leading-[1.06] tracking-tight sm:text-6xl md:text-7xl">
          Your birth chart, made more{" "}
          <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">understandable</span>
        </h1>
        <p className="mt-7 max-w-2xl text-pretty text-base leading-relaxed text-foreground/80 sm:text-xl">
          Explore the structure of your natal chart, the twelve zodiac signs, planetary cycles and relationship patterns through clear, practical English guides.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link href="/natal-chart" className="inline-flex items-center gap-2 rounded-xl bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink))] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-950/30">
            Start with your natal chart <ArrowRight className="size-4" />
          </Link>
          <Link href="/zodiac" className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/60 px-5 py-3 text-sm font-semibold hover:bg-card">
            Explore zodiac signs
          </Link>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">Free to explore · No card required · English reports and assessments available</p>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-20">
        <div className="mb-9 max-w-3xl">
          <p className="text-sm font-medium text-[var(--vivida-cyan)]">A thoughtful starting point</p>
          <h2 className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-5xl">Astrology is a system of relationships</h2>
          <p className="mt-5 text-pretty text-base leading-relaxed text-foreground/80 sm:text-lg">
            A single zodiac sign is only one part of the picture. A natal chart records the positions of the Sun, Moon and planets at a specific moment and place. Signs describe how an energy is expressed, houses describe where it tends to appear, and aspects describe how different parts of the chart interact.
          </p>
          <p className="mt-4 text-pretty text-base leading-relaxed text-foreground/80 sm:text-lg">
            Vivida organizes these layers into approachable tools and educational guides. Use them as prompts for reflection—not as certainty, diagnosis or a substitute for professional advice.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {GUIDES.map(({ href, icon: Icon, title, text }) => (
            <Link key={href} href={href} className="group rounded-3xl border border-border bg-card/55 p-6 ring-1 ring-foreground/5 backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-[var(--vivida-violet)]/45 hover:bg-card/75">
              <Icon className="size-6 text-[var(--vivida-violet)]" />
              <h3 className="mt-4 text-xl font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">{text}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[var(--vivida-cyan)]">Read the guide <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" /></span>
            </Link>
          ))}
        </div>
      </section>

      <LatestArticlesSection locale="en" />

      <section className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 sm:py-20">
        <h2 className="text-center text-3xl font-semibold tracking-tight sm:text-4xl">How Vivida works</h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {[
            ["01", "Enter accurate details", "Your birth date, place and—when known—exact time establish the astronomical chart."],
            ["02", "Read the chart layers", "Begin with the Sun, Moon and Ascendant, then add planets, houses and aspects."],
            ["03", "Reflect, don't predict", "Use recurring themes as questions and perspectives rather than fixed outcomes."],
          ].map(([n, title, text]) => (
            <article key={n} className="rounded-2xl border border-border/60 bg-card/40 p-5">
              <span className="text-sm font-semibold text-[var(--vivida-pink)]">{n}</span>
              <h3 className="mt-3 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
        <h2 className="mb-8 text-center text-3xl font-semibold tracking-tight">Frequently asked questions</h2>
        <div className="space-y-3">
          {FAQ.map((item) => (
            <details key={item.q} className="group rounded-2xl border border-border bg-card/55 p-5">
              <summary className="cursor-pointer list-none font-medium">{item.q}</summary>
              <p className="mt-3 text-sm leading-relaxed text-foreground/80 sm:text-base">{item.a}</p>
            </details>
          ))}
        </div>
      </section>
    </EnglishShell>
  );
}
