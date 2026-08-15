import Link from "next/link";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import { ALL_SLUGS, ZODIAC_DATES, signMetaBySlug } from "@/lib/seo/zodiac-dates";
import { SIGNS_CONTENT } from "@/lib/seo/zodiac-content";
import { VIEW_PATH } from "@/lib/sign-horoscope";
import { signColor } from "@/lib/zodiac";
import { ZODIAC_SIGN_EN } from "@/lib/zodiac-sign-en";

export type EnglishPeriod = "week" | "month";

export const PERIOD_EN = {
  week: {
    path: "/horoskopi/kvireuli",
    viewPath: VIEW_PATH.week,
    title: "Weekly Horoscope: All 12 Zodiac Signs",
    description: "Read this week's horoscope for all 12 zodiac signs, with practical guidance for relationships, work, priorities, and personal growth.",
    heading: "This Week's Horoscope",
    intro: "Choose your zodiac sign for a focused weekly horoscope. Use the guidance to reflect on priorities, relationships, and the decisions that deserve steady attention.",
    cadence: "Weekly guidance",
    cta: "Read full weekly horoscope →",
    faq: [
      { q: "When is the weekly horoscope updated?", a: "The weekly period changes every Monday. Each sign page follows the current calendar week." },
      { q: "Should I read my Sun or rising sign?", a: "Start with your Sun sign, then read the rising sign for another perspective on timing and life areas. A complete personal forecast uses the whole natal chart." },
      { q: "Can a weekly horoscope predict exact events?", a: "No. It offers broad astrological themes and reflection prompts, not guaranteed outcomes or professional advice." },
    ],
  },
  month: {
    path: "/horoskopi/tviuri",
    viewPath: VIEW_PATH.month,
    title: "Monthly Horoscope: All 12 Zodiac Signs",
    description: "Read this month's horoscope for all 12 zodiac signs, including themes for love, career, priorities, wellbeing, and personal growth.",
    heading: "This Month's Horoscope",
    intro: "Choose your zodiac sign for a broader monthly view of priorities, relationships, work, and growth. Treat it as a planning prompt rather than a fixed prediction.",
    cadence: "Monthly guidance",
    cta: "Read full monthly horoscope →",
    faq: [
      { q: "When is the monthly horoscope updated?", a: "The monthly period changes on the first day of each calendar month." },
      { q: "What does a monthly horoscope consider?", a: "A general monthly horoscope reflects broad themes for a Sun sign. A personal forecast also uses your rising sign, houses, natal planets, and current transits." },
      { q: "Is a monthly horoscope personal advice?", a: "No. Use it for reflection and planning, while basing medical, legal, and financial decisions on qualified professional guidance." },
    ],
  },
} as const;

export function PeriodHoroscopeHubEn({ period }: { period: EnglishPeriod }) {
  const config = PERIOD_EN[period];
  const dateLabel = period === "week"
    ? `Week of ${new Intl.DateTimeFormat("en", { month: "long", day: "numeric", year: "numeric" }).format(startOfWeek(new Date()))}`
    : new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(new Date());
  const url = `https://www.vividaastro.com${config.path}`;
  const ld = [
    { "@context": "https://schema.org", "@type": "CollectionPage", name: config.title, description: config.description, url, inLanguage: "en", mainEntity: { "@type": "ItemList", itemListElement: ALL_SLUGS.map((sign, index) => ({ "@type": "ListItem", position: index + 1, name: `${signMetaBySlug(sign)!.labelEn} ${config.cadence.toLowerCase()}`, url: `https://www.vividaastro.com/zodiac/${sign}/${config.viewPath}` })) } },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: config.faq.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })) },
  ];
  return <main lang="en" className="relative isolate flex min-h-screen flex-col overflow-hidden">
    <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_220/0.45),transparent_70%)]" />
    <Starfield count={120} shooting={3} /><SmartHeader locale="en" georgianPath={config.path} />
    {ld.map((item, index) => <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }} />)}
    <section className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-12">
      <nav className="mb-6 flex gap-2 text-xs text-muted-foreground"><Link href="/">Home</Link><span>/</span><Link href="/horoscope">Horoscope</Link><span>/</span><span className="text-foreground/80">{config.cadence}</span></nav>
      <header className="mb-6 max-w-3xl"><div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">{dateLabel}</div><h1 className="mt-2 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">{config.heading}</h1><p className="mt-4 text-pretty text-base text-foreground/85 sm:text-lg">{config.intro}</p></header>
      <div className="mb-10 flex flex-wrap gap-2"><Link href="/horoscope" className="rounded-full border border-border bg-card/55 px-4 py-1.5 text-sm">Daily horoscope</Link><Link href={PERIOD_EN.week.path} className={`rounded-full border px-4 py-1.5 text-sm ${period === "week" ? "border-[var(--vivida-violet)]/50 bg-[var(--vivida-violet)]/15" : "border-border bg-card/55"}`}>Weekly horoscope</Link><Link href={PERIOD_EN.month.path} className={`rounded-full border px-4 py-1.5 text-sm ${period === "month" ? "border-[var(--vivida-violet)]/50 bg-[var(--vivida-violet)]/15" : "border-border bg-card/55"}`}>Monthly horoscope</Link></div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{ALL_SLUGS.map((sign) => { const meta = signMetaBySlug(sign)!; const profile = ZODIAC_SIGN_EN[sign]; const accent = signColor(meta); const summary = period === "week" ? `This week, use ${profile.strengths[0].toLowerCase()} while watching for ${profile.challenges[0].toLowerCase()}.` : `This month supports steady growth through ${profile.strengths.slice(0, 2).join(" and ").toLowerCase()}.`; return <Link key={sign} href={`/zodiac/${sign}/${config.viewPath}`} className="group rounded-2xl border border-border bg-card/55 p-5 transition hover:bg-card/80"><div className="flex items-start gap-3"><div className="grid size-12 place-items-center rounded-xl text-2xl" style={{ color: accent, background: `color-mix(in oklch, ${accent} 18%, transparent)` }}>{SIGNS_CONTENT[sign].symbol}</div><div><h2 className="font-semibold">{meta.labelEn}</h2><div className="text-[11px] text-muted-foreground">{ZODIAC_DATES[sign].rangeEn}</div></div></div><p className="mt-3 text-sm leading-relaxed text-foreground/85">{summary}</p><div className="mt-3 text-xs text-muted-foreground group-hover:text-foreground">{config.cta}</div></Link>; })}</div>
      <section className="mt-12"><h2 className="text-xl font-semibold">{config.cadence} by zodiac sign</h2><div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{ALL_SLUGS.map((sign) => <Link key={sign} href={`/zodiac/${sign}/${config.viewPath}`} className="rounded-xl border border-border/60 bg-card/40 px-3.5 py-2.5 text-sm font-medium">{signMetaBySlug(sign)!.labelEn} {period === "week" ? "weekly" : "monthly"} horoscope</Link>)}</div></section>
      <section className="mt-12"><h2 className="mb-4 text-2xl font-semibold">Frequently asked questions</h2><div className="space-y-3">{config.faq.map((item) => <details key={item.q} className="rounded-2xl border border-border bg-card/50 p-5"><summary className="cursor-pointer font-medium">{item.q}</summary><p className="mt-3 leading-7 text-foreground/85">{item.a}</p></details>)}</div></section>
      <div className="mt-14 rounded-2xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/12 via-card/60 to-[var(--vivida-cyan)]/12 p-7 text-center sm:p-10"><Sparkles className="mx-auto mb-3 size-7 text-[var(--vivida-violet)]" /><h2 className="text-2xl font-semibold sm:text-3xl">Your Sun sign is only one layer</h2><p className="mx-auto mt-3 max-w-md text-muted-foreground">Calculate your full natal chart to explore the Moon, rising sign, planets, houses, and aspects.</p><Button asChild variant="mystic" size="lg" className="mt-6"><Link href="/natal-chart">Calculate my birth chart</Link></Button></div>
    </section><SiteFooter locale="en" />
  </main>;
}

function startOfWeek(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay();
  result.setDate(result.getDate() - ((day + 6) % 7));
  return result;
}
