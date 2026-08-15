import Link from "next/link";
import { ArrowRight, CalendarDays, ShieldAlert, Sparkles } from "lucide-react";

import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import { articleLd, breadcrumbLd, faqLd, serializeLd } from "@/lib/seo/jsonld";
import { astrologyDay, calendarWindow, type AstrologyCalendarDay } from "@/lib/seo/astrology-calendar";
import { aspectEn, calendarDateLabelEn, dayAdviceEn, dayLeadEn, planetEn, TONE_EN, weekdayEn } from "@/lib/seo/astrology-calendar-en";
import { signByIndex } from "@/lib/zodiac";

const SITE = "https://www.vividaastro.com";

function DayCard({ day }: { day: AstrologyCalendarDay }) {
  const tone = TONE_EN[day.tone];
  return <Link href={`/astrologiuri-kalendari/${day.iso}`} className="group rounded-2xl border border-border bg-card/55 p-4 transition hover:-translate-y-0.5 hover:border-foreground/20">
    <div className="flex items-center justify-between gap-3"><div><p className="text-xs text-muted-foreground">{weekdayEn(day.date)}</p><h3 className="font-semibold">{calendarDateLabelEn(day.date, true)}</h3></div><span className="text-xl" style={{ color: tone.color }}>{tone.icon}</span></div>
    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-foreground/8"><div className="h-full rounded-full" style={{ width: `${day.score}%`, background: tone.color }} /></div>
    <div className="mt-2 flex items-center justify-between text-xs"><span style={{ color: tone.color }}>{tone.label}</span><span className="text-muted-foreground">Index {day.score}/100</span></div>
  </Link>;
}

export const CALENDAR_META_EN = {
  all: { title: "Astrology Calendar: Supportive and Challenging Days", description: "Explore daily planetary aspects, supportive dates, challenging days, and a practical 30-day astrology forecast based on current transits.", path: "/astrologiuri-kalendari" },
  lucky: { title: "Lucky Days in Astrology: Upcoming Supportive Dates", description: "Find supportive dates in the next 90 days based on harmonious planetary aspects, with practical context for planning, conversations, and new steps.", path: "/ighbliani-dgheebi" },
  careful: { title: "Challenging Astrology Days: Dates for Extra Care", description: "See dates in the next 90 days with tense planetary aspects and use them for slower decisions, careful review, and calmer responses.", path: "/frtxili-dgheebi" },
} as const;

export function AstrologyCalendarHubEn({ filter = "all" }: { filter?: "all" | "lucky" | "careful" }) {
  const all = calendarWindow(); const days = filter === "all" ? all.slice(0, 30) : all.filter((day) => day.tone === filter).slice(0, 24);
  const lucky = all.filter((day) => day.tone === "lucky").slice(0, 5); const careful = all.filter((day) => day.tone === "careful").slice(0, 5);
  const config = filter === "lucky"
    ? { ...CALENDAR_META_EN.lucky, heading: "Supportive astrology days", intro: "Upcoming dates whose harmonious planetary aspects create a more cooperative collective backdrop for planning, conversations, and constructive action.", icon: Sparkles }
    : filter === "careful"
      ? { ...CALENDAR_META_EN.careful, heading: "Days for extra care", intro: "Upcoming dates marked by tense aspects, useful for slowing down, checking details, and responding instead of reacting.", icon: ShieldAlert }
      : { ...CALENDAR_META_EN.all, heading: "Astrology calendar", intro: "Daily planetary aspects, supportive and challenging dates, and the collective sky for the next 30 days, calculated from real planetary transits.", icon: CalendarDays };
  const faq = [
    { q: "How is the daily astrology index calculated?", a: "The index weighs harmonious and tense aspects between planets, their closeness, and the planets involved. It describes the collective sky rather than a personal forecast." },
    { q: "Does a supportive day guarantee success?", a: "No. It only indicates a potentially more cooperative astrological background. Your decisions, preparation, timing, and circumstances still matter." },
    { q: "Should I postpone important plans on a challenging day?", a: "Not necessarily. Build in extra time, check facts, and manage emotional reactions. Truly personal timing also requires transits to your individual birth chart." },
  ];
  const url = `${SITE}${config.path}`; const Icon = config.icon;
  const ld = [articleLd({ url, headline: config.title, description: config.description, datePublished: "2026-08-13T00:00:00+04:00", dateModified: new Date().toISOString() }), breadcrumbLd([{ name: "Home", url: SITE }, { name: config.heading, url }]), faqLd(faq), { "@context": "https://schema.org", "@type": "ItemList", itemListElement: days.map((day, index) => ({ "@type": "ListItem", position: index + 1, name: `${calendarDateLabelEn(day.date)} — ${TONE_EN[day.tone].label}`, url: `${SITE}/astrologiuri-kalendari/${day.iso}` })) }];
  return <main lang="en" className="relative isolate flex min-h-screen flex-col overflow-hidden"><Starfield count={100} shooting={2} /><SmartHeader locale="en" georgianPath={config.path} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeLd(ld) }} />
    <section className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-20 pt-8 sm:px-6 sm:pt-12"><header className="max-w-3xl"><Icon className="size-9 text-[var(--vivida-cyan)]" /><h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">{config.heading}</h1><p className="mt-4 text-lg leading-8 text-foreground/80">{config.intro}</p></header>
      <nav className="mt-7 flex flex-wrap gap-2">{[["/astrologiuri-kalendari", "Full calendar"], ["/ighbliani-dgheebi", "Supportive days"], ["/frtxili-dgheebi", "Days for extra care"], ["/mtvaris-kalendari", "Moon calendar"]].map(([href, label]) => <Link key={href} href={href} className={`rounded-full border px-4 py-2 text-sm ${href === config.path ? "border-[var(--vivida-cyan)]/50 bg-[var(--vivida-cyan)]/10" : "border-border bg-card/55 text-muted-foreground hover:text-foreground"}`}>{label}</Link>)}</nav>
      <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{days.map((day) => <DayCard key={day.iso} day={day} />)}</div>
      {filter === "all" && <div className="mt-14 grid gap-6 lg:grid-cols-2"><section><h2 className="text-2xl font-semibold">Upcoming supportive days</h2><div className="mt-4 space-y-2">{lucky.map((day) => <DayCard key={day.iso} day={day} />)}</div></section><section><h2 className="text-2xl font-semibold">Upcoming challenging days</h2><div className="mt-4 space-y-2">{careful.map((day) => <DayCard key={day.iso} day={day} />)}</div></section></div>}
      <section className="mt-14 max-w-3xl"><h2 className="text-2xl font-semibold">How to use this calendar</h2><p className="mt-4 leading-8 text-foreground/80">The calendar describes a collective astrological background. Choose a date, review its strongest planetary aspects, and use the guidance as one planning tool among many. Do not base medical, financial, or legal decisions on an astrological score.</p></section>
      <section className="mt-12"><h2 className="text-2xl font-semibold">Frequently asked questions</h2><div className="mt-5 space-y-3">{faq.map((item) => <details key={item.q} className="rounded-2xl border border-border bg-card/50 p-5"><summary className="cursor-pointer font-medium">{item.q}</summary><p className="mt-3 leading-7 text-foreground/78">{item.a}</p></details>)}</div></section>
    </section><SiteFooter locale="en" /></main>;
}

export function AstrologyCalendarDetailEn({ date }: { date: Date }) {
  const day = astrologyDay(date); const advice = dayAdviceEn(day); const tone = TONE_EN[day.tone]; const label = calendarDateLabelEn(day.date); const url = `${SITE}/astrologiuri-kalendari/${day.iso}`;
  const faq = [{ q: `Is ${label} a lucky day?`, a: `${advice.title}: ${advice.summary}` }, { q: "Is this forecast the same for everyone?", a: "This page describes collective planetary aspects. Your personal experience also depends on your birth chart, location, choices, and circumstances." }];
  const description = `${label} astrology forecast with planetary aspects, a daily energy index, supportive themes, cautions, and practical guidance.`;
  const ld = [articleLd({ url, headline: `${label} Astrology Forecast`, description, datePublished: `${day.iso}T00:00:00Z`, dateModified: `${day.iso}T00:00:00Z` }), breadcrumbLd([{ name: "Home", url: SITE }, { name: "Astrology calendar", url: `${SITE}/astrologiuri-kalendari` }, { name: label, url }]), faqLd(faq)];
  return <main lang="en" className="relative isolate flex min-h-screen flex-col overflow-hidden"><Starfield count={90} shooting={1} /><SmartHeader locale="en" georgianPath={`/astrologiuri-kalendari/${day.iso}`} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeLd(ld) }} />
    <article className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-20 pt-8 sm:px-6 sm:pt-12"><nav className="text-xs text-muted-foreground"><Link href="/astrologiuri-kalendari" className="hover:text-foreground">Astrology calendar</Link> / {label}</nav>
      <header className="mt-6 rounded-3xl border border-border bg-card/60 p-6 sm:p-9"><p className="text-sm" style={{ color: tone.color }}>{tone.icon} {advice.title} · Index {day.score}/100</p><h1 className="mt-3 text-balance text-3xl font-semibold sm:text-4xl">{label} astrology forecast</h1><p className="mt-4 text-lg leading-8 text-foreground/80">{dayLeadEn(day)}</p><p className="mt-3 leading-7 text-foreground/75">{advice.summary}</p></header>
      <section className="mt-10"><h2 className="text-2xl font-semibold">Planetary aspects</h2><div className="mt-5 space-y-3">{day.sky.aspects.length ? day.sky.aspects.map((aspect) => <div key={`${aspect.aKa}-${aspect.bKa}-${aspect.kindKa}`} className="rounded-2xl border border-border bg-card/50 p-5"><div className="flex items-center justify-between gap-4"><h3 className="font-semibold">{aspect.aSymbol} {planetEn(aspect.aKa)} — {aspect.bSymbol} {planetEn(aspect.bKa)}</h3><span className="text-xs text-muted-foreground">Orb {aspect.orb.toFixed(1)}°</span></div><p className="mt-2 text-sm text-foreground/75">{aspectEn(aspect.kindKa)} · {aspect.family === "harmonic" ? "harmonious influence" : aspect.family === "tense" ? "tense influence" : "neutral emphasis"}</p></div>) : <p className="text-foreground/75">No tight major aspects stand out, leaving a relatively calm collective tone.</p>}</div></section>
      <section className="mt-10"><h2 className="text-2xl font-semibold">Planets in zodiac signs</h2><div className="mt-4 flex flex-wrap gap-2">{day.sky.planets.map((planet) => <span key={planet.key} className="rounded-full border border-border bg-card/55 px-3 py-2 text-sm">{planet.symbol} {planetEn(planet.labelKa)} — {planet.signSymbol} {signByIndex(planet.signIndex).labelEn}</span>)}</div></section>
      <div className="mt-10 grid gap-4 sm:grid-cols-2"><section className="rounded-2xl border border-[var(--vivida-cyan)]/25 bg-[var(--vivida-cyan)]/8 p-5"><h2 className="font-semibold">What to do</h2><ul className="mt-3 space-y-2 text-sm leading-6">{advice.do.map((item) => <li key={item}>• {item}</li>)}</ul></section><section className="rounded-2xl border border-[var(--vivida-pink)]/25 bg-[var(--vivida-pink)]/8 p-5"><h2 className="font-semibold">What to avoid</h2><ul className="mt-3 space-y-2 text-sm leading-6">{advice.avoid.map((item) => <li key={item}>• {item}</li>)}</ul></section></div>
      <section className="mt-12"><h2 className="text-2xl font-semibold">Frequently asked questions</h2><div className="mt-5 space-y-3">{faq.map((item) => <details key={item.q} className="rounded-2xl border border-border bg-card/50 p-5"><summary className="cursor-pointer font-medium">{item.q}</summary><p className="mt-3 leading-7 text-foreground/78">{item.a}</p></details>)}</div></section>
      <div className="mt-12 flex flex-wrap gap-3"><Link href="/ighbliani-dgheebi" className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-2 text-sm">Supportive days <ArrowRight className="size-4" /></Link><Link href="/frtxili-dgheebi" className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-2 text-sm">Days for extra care <ArrowRight className="size-4" /></Link><Link href="/timing" className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-2 text-sm">My personal timing <ArrowRight className="size-4" /></Link></div>
    </article><SiteFooter locale="en" /></main>;
}
