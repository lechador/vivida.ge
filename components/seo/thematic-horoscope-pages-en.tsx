import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ReportPromo } from "@/components/report/report-promo";
import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import { SIGNS_CONTENT } from "@/lib/seo/zodiac-content";
import { ALL_SLUGS, ZODIAC_DATES, signMetaBySlug, type ZodiacSlug } from "@/lib/seo/zodiac-dates";
import { ALL_HOROSCOPE_THEMES, themeUrl, type HoroscopeTheme } from "@/lib/seo/thematic-horoscope";
import { THEME_CONFIG_EN, thematicHoroscopeEnglish } from "@/lib/thematic-horoscope-en";
import { signColor } from "@/lib/zodiac";
import { localizedAlternates } from "@/lib/seo/locales";

export function thematicHubMetadataEn(theme: HoroscopeTheme) {
  const config = THEME_CONFIG_EN[theme];
  const path = themeUrl(theme);
  const url = `https://www.vividaastro.com${path}`;
  return {
    title: { absolute: config.title },
    description: config.description,
    alternates: localizedAlternates(path, path, "en"),
    openGraph: { type: "website" as const, url, title: config.title, description: config.description, siteName: "Vivida", locale: "en_US" },
    twitter: { card: "summary_large_image" as const, title: config.title, description: config.description },
  };
}

export function thematicDetailMetadataEn(theme: HoroscopeTheme, sign: ZodiacSlug) {
  const config = THEME_CONFIG_EN[theme];
  const content = thematicHoroscopeEnglish(theme, sign);
  const name = signMetaBySlug(sign)!.labelEn;
  const path = themeUrl(theme, sign);
  const url = `https://www.vividaastro.com${path}`;
  const title = `${name} ${config.label}: Traits and Practical Guidance`;
  const description = `${name} ${config.label.toLowerCase()}: explore natural strengths, growth areas, patterns, and practical guidance for ${config.shortLabel.toLowerCase()}.`;
  return {
    title: { absolute: title },
    description,
    keywords: [`${name} ${config.label.toLowerCase()}`, `${name} ${config.shortLabel.toLowerCase()}`, content.focus],
    alternates: localizedAlternates(path, path, "en"),
    openGraph: { type: "article" as const, url, title, description, siteName: "Vivida", locale: "en_US" },
    twitter: { card: "summary_large_image" as const, title, description },
  };
}

function themeFaq(theme: HoroscopeTheme) {
  const config = THEME_CONFIG_EN[theme];
  return [
    { q: `What does a ${config.label.toLowerCase()} describe?`, a: `It explores how each Sun sign's basic temperament may appear in ${theme === "love" ? "attraction, intimacy, and relationships" : theme === "finance" ? "earning, spending, security, and financial habits" : "motivation, work style, and professional growth"}. It is a general guide, not a personal prediction.` },
    { q: `Which sign should I read?`, a: "Start with your Sun sign. For a more personal picture, also consider your rising sign, Moon, relevant planets, houses, and the complete natal chart." },
    { q: "Is this a personalized forecast?", a: "No. A personal forecast requires an exact birth date, time, place, complete natal chart, and current transits." },
  ];
}

export function ThematicHoroscopeHubEn({ theme }: { theme: HoroscopeTheme }) {
  const config = THEME_CONFIG_EN[theme];
  const faq = themeFaq(theme);
  const url = `https://www.vividaastro.com${themeUrl(theme)}`;
  const ld = [
    { "@context": "https://schema.org", "@type": "CollectionPage", name: config.title, description: config.description, url, inLanguage: "en", mainEntity: { "@type": "ItemList", itemListElement: ALL_SLUGS.map((sign, index) => ({ "@type": "ListItem", position: index + 1, name: `${signMetaBySlug(sign)!.labelEn} ${config.label}`, url: `https://www.vividaastro.com${themeUrl(theme, sign)}` })) } },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })) },
  ];
  return <main lang="en" className="relative isolate flex min-h-screen flex-col overflow-hidden"><Starfield count={110} shooting={2} /><SmartHeader locale="en" georgianPath={themeUrl(theme)} />{ld.map((item, index) => <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }} />)}
    <section className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-20 pt-8 sm:px-6 sm:pt-12">
      <nav className="mb-6 flex gap-2 text-xs text-muted-foreground"><Link href="/horoscope">Horoscope</Link><span>/</span><span className="text-foreground/80">{config.label}</span></nav>
      <header className="max-w-3xl"><div className="text-4xl" aria-hidden>{config.glyph}</div><h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">{config.title}</h1><p className="mt-4 text-pretty text-lg leading-8 text-foreground/80">{config.intro}</p></header>
      <div className="mt-8 flex flex-wrap gap-2">{ALL_HOROSCOPE_THEMES.map((item) => <Link key={item} href={themeUrl(item)} className={`rounded-full border px-4 py-1.5 text-sm ${item === theme ? "border-[var(--vivida-violet)]/50 bg-[var(--vivida-violet)]/15" : "border-border bg-card/55 text-muted-foreground hover:text-foreground"}`}>{THEME_CONFIG_EN[item].label}</Link>)}</div>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{ALL_SLUGS.map((sign) => { const meta = signMetaBySlug(sign)!; const content = thematicHoroscopeEnglish(theme, sign); const accent = signColor(meta); return <Link key={sign} href={themeUrl(theme, sign)} className="group rounded-2xl border border-border bg-card/55 p-5 transition hover:-translate-y-0.5 hover:border-foreground/20"><div className="flex items-start gap-3"><div className="grid size-12 place-items-center rounded-xl text-2xl" style={{ color: accent, background: `color-mix(in oklch, ${accent} 16%, transparent)` }}>{SIGNS_CONTENT[sign].symbol}</div><div><h2 className="font-semibold">{meta.labelEn} {config.label}</h2><p className="text-xs text-muted-foreground">{ZODIAC_DATES[sign].rangeEn}</p></div></div><p className="mt-4 line-clamp-4 text-sm leading-6 text-foreground/78">{content.main[0]}</p><span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-[var(--vivida-cyan)]">Full guide <ArrowRight className="size-3.5 transition group-hover:translate-x-0.5" /></span></Link>; })}</div>
      <section className="mt-14 max-w-3xl"><h2 className="text-2xl font-semibold">How to use this horoscope</h2><p className="mt-4 text-base leading-8 text-foreground/80">A Sun sign offers a useful starting point, but {config.shortLabel.toLowerCase()} cannot be understood through one placement alone. Use these pages for reflection, then explore your Moon, rising sign, planets, and houses in a complete birth chart.</p></section>
      <Faq items={faq} />
      <div className="mt-14 rounded-3xl border border-[var(--vivida-violet)]/30 bg-[var(--vivida-violet)]/10 p-7 text-center"><Sparkles className="mx-auto size-6 text-[var(--vivida-cyan)]" /><h2 className="mt-3 text-2xl font-semibold">Explore your complete astrology profile</h2><p className="mx-auto mt-2 max-w-lg text-sm text-foreground/75">Your Sun sign is only the beginning. A natal chart includes your birth time, place, planets, houses, and aspects.</p><Button asChild variant="mystic" className="mt-5"><Link href="/natal-chart">Calculate my birth chart</Link></Button></div>
    </section><SiteFooter locale="en" /></main>;
}

export function ThematicHoroscopeDetailEn({ theme, sign }: { theme: HoroscopeTheme; sign: ZodiacSlug }) {
  const config = THEME_CONFIG_EN[theme];
  const content = thematicHoroscopeEnglish(theme, sign);
  const meta = signMetaBySlug(sign)!;
  const name = meta.labelEn;
  const accent = signColor(meta);
  const faq = [
    { q: `What is ${name} like in ${theme === "love" ? "love" : theme === "finance" ? "money matters" : "a career"}?`, a: content.main[0] },
    { q: `What is ${name}'s main strength?`, a: content.focus },
    { q: `What should ${name} watch for?`, a: content.watch },
  ];
  const url = `https://www.vividaastro.com${themeUrl(theme, sign)}`;
  const ld = [
    { "@context": "https://schema.org", "@type": "Article", headline: `${name} ${config.label}: Traits and Guidance`, description: content.focus, inLanguage: "en", mainEntityOfPage: { "@type": "WebPage", "@id": url }, author: { "@type": "Organization", name: "Vivida" } },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })) },
  ];
  return <main lang="en" className="relative isolate flex min-h-screen flex-col overflow-hidden"><Starfield count={90} shooting={1} /><SmartHeader locale="en" georgianPath={themeUrl(theme, sign)} />{ld.map((item, index) => <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }} />)}
    <article className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-20 pt-8 sm:px-6 sm:pt-12">
      <nav className="text-xs text-muted-foreground"><Link href={themeUrl(theme)}>{config.label}</Link> / {name}</nav>
      <header className="mt-6 rounded-3xl border border-border bg-card/60 p-6 sm:p-9"><div className="flex items-start gap-4"><div className="grid size-16 place-items-center rounded-2xl text-4xl" style={{ color: accent, background: `color-mix(in oklch, ${accent} 16%, transparent)` }}>{SIGNS_CONTENT[sign].symbol}</div><div><p className="text-xs text-muted-foreground">{ZODIAC_DATES[sign].rangeEn}</p><h1 className="mt-1 text-balance text-3xl font-semibold sm:text-4xl">{name} {config.label}</h1></div></div><p className="mt-5 text-lg leading-8 text-foreground/82">{content.focus}</p></header>
      <section className="mt-10 space-y-4 text-base leading-8 text-foreground/82">{content.main.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>
      <div className="mt-10 grid gap-4 sm:grid-cols-2"><section className="rounded-2xl border border-[var(--vivida-pink)]/25 bg-[var(--vivida-pink)]/8 p-5"><h2 className="font-semibold">What to watch</h2><p className="mt-2 text-sm leading-7 text-foreground/78">{content.watch}</p></section><section className="rounded-2xl border border-[var(--vivida-cyan)]/25 bg-[var(--vivida-cyan)]/8 p-5"><h2 className="font-semibold">Practical guidance</h2><p className="mt-2 text-sm leading-7 text-foreground/78">{content.advice}</p></section></div>
      <section className="mt-12"><h2 className="text-2xl font-semibold">More {name} horoscopes</h2><div className="mt-4 flex flex-wrap gap-2">{ALL_HOROSCOPE_THEMES.filter((item) => item !== theme).map((item) => <Link key={item} href={themeUrl(item, sign)} className="rounded-full border border-border bg-card/55 px-4 py-2 text-sm hover:bg-card/80">{THEME_CONFIG_EN[item].label}</Link>)}<Link href={`/zodiac/${sign}/dghes`} className="rounded-full border border-border bg-card/55 px-4 py-2 text-sm">Daily horoscope</Link><Link href={`/zodiac/${sign}`} className="rounded-full border border-border bg-card/55 px-4 py-2 text-sm">Full {name} guide</Link></div></section>
      <section className="mt-12"><h2 className="text-2xl font-semibold">Other signs</h2><div className="mt-4 flex flex-wrap gap-2">{ALL_SLUGS.filter((item) => item !== sign).map((item) => <Link key={item} href={themeUrl(theme, item)} className="rounded-full border border-border bg-card/55 px-3 py-1.5 text-sm">{SIGNS_CONTENT[item].symbol} {signMetaBySlug(item)!.labelEn}</Link>)}</div></section>
      <Faq items={faq} /><ReportPromo className="mt-14" />
      <div className="mt-12 rounded-3xl border border-[var(--vivida-violet)]/30 bg-[var(--vivida-violet)]/10 p-7 text-center"><h2 className="text-2xl font-semibold">This is a general Sun-sign guide</h2><p className="mt-2 text-sm text-foreground/75">Your complete birth chart provides a more personal view of this area.</p><Button asChild variant="mystic" className="mt-5"><Link href="/natal-chart">Calculate my birth chart</Link></Button></div>
    </article><SiteFooter locale="en" /></main>;
}

function Faq({ items }: { items: Array<{ q: string; a: string }> }) { return <section className="mt-12"><h2 className="text-2xl font-semibold">Frequently asked questions</h2><div className="mt-5 space-y-3">{items.map((item) => <details key={item.q} className="rounded-2xl border border-border bg-card/50 p-5"><summary className="cursor-pointer font-medium">{item.q}</summary><p className="mt-3 leading-7 text-foreground/78">{item.a}</p></details>)}</div></section>; }
