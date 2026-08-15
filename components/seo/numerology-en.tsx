import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { Starfield } from "@/components/landing/starfield";
import { LifePathCalculator } from "@/components/seo/life-path-calculator";
import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { Button } from "@/components/ui/button";
import { LIFE_PATH_NUMBERS, type LifePathNumber } from "@/lib/numerology";
import { LIFE_PATH_CONTENT_EN, NUMEROLOGY_FAQ_EN, type LifePathContentEn } from "@/lib/seo/numerology-content-en";

const SITE = "https://www.vividaastro.com";

export const NUMEROLOGY_HUB_EN = {
  title: "Life Path Number Calculator and Numerology Meanings",
  description: "Calculate your life path number from your birth date and explore the meanings of numbers 1–9 and Master Numbers 11, 22, and 33.",
};

export function NumerologyHubEn() {
  const archetypes = Object.fromEntries(LIFE_PATH_NUMBERS.map((number) => [number, LIFE_PATH_CONTENT_EN[number].archetype]));
  const structuredData = [
    { "@context": "https://schema.org", "@type": "Article", headline: NUMEROLOGY_HUB_EN.title, description: NUMEROLOGY_HUB_EN.description, inLanguage: "en", mainEntityOfPage: `${SITE}/numerologia`, publisher: { "@type": "Organization", name: "Vivida", url: SITE } },
    { "@context": "https://schema.org", "@type": "ItemList", name: "Life path number meanings", numberOfItems: LIFE_PATH_NUMBERS.length, itemListElement: LIFE_PATH_NUMBERS.map((number, index) => ({ "@type": "ListItem", position: index + 1, name: LIFE_PATH_CONTENT_EN[number].title, url: `${SITE}/numerologia/${number}` })) },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: NUMEROLOGY_FAQ_EN.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })) },
  ];

  return (
    <main lang="en" className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <Background /><Starfield count={120} shooting={2} /><SmartHeader locale="en" georgianPath="/numerologia" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <section className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-12">
        <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground"><Link href="/">Home</Link><span>/</span><span className="text-foreground/80">Numerology</span></nav>
        <header className="mb-8 max-w-3xl"><h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">Numerology and your <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">life path number</span></h1><p className="mt-4 text-pretty text-base text-foreground/85 sm:text-lg">Calculate your number from your birth date, then explore the archetypal strengths, challenges, relationship style, and career themes traditionally associated with it.</p></header>

        <LifePathCalculator archetypes={archetypes} locale="en" />

        <section className="mt-12"><h2 className="text-2xl font-semibold tracking-tight">Life path number meanings</h2><p className="mt-2 text-sm text-muted-foreground">Numbers 1–9 plus Master Numbers 11, 22, and 33.</p><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{LIFE_PATH_NUMBERS.map((number) => {
          const content = LIFE_PATH_CONTENT_EN[number]; const master = number.length > 1;
          return <Link key={number} href={`/numerologia/${number}`} className="group relative overflow-hidden rounded-2xl border border-border bg-card/55 p-5 ring-1 ring-foreground/5 transition-colors hover:bg-card/80"><div className="flex items-center gap-3"><NumberBadge number={number} master={master} /><div><h3 className="font-semibold tracking-tight">{content.archetype}</h3><div className="text-[11px] text-muted-foreground">{master ? "Master Number" : `Life Path ${number}`}</div></div></div><p className="mt-3 line-clamp-3 text-sm leading-relaxed text-foreground/85">{content.essence}</p><div className="mt-3 text-xs text-muted-foreground group-hover:text-foreground">Read the full meaning →</div></Link>;
        })}</div></section>

        <section className="mt-12"><h2 className="mb-4 text-2xl font-semibold tracking-tight">Frequently asked questions</h2><div className="space-y-3">{NUMEROLOGY_FAQ_EN.map((item) => <details key={item.q} className="rounded-2xl border border-border bg-card/50 p-5"><summary className="cursor-pointer font-medium">{item.q}</summary><p className="mt-3 text-[15px] leading-relaxed text-foreground/85">{item.a}</p></details>)}</div></section>

        <div className="mt-14 rounded-2xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/12 via-card/60 to-[var(--vivida-cyan)]/12 p-7 text-center sm:p-10"><Sparkles className="mx-auto mb-3 size-7 text-[var(--vivida-violet)]" /><h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">Numbers are one lens; the sky adds another</h2><p className="mx-auto mt-3 max-w-md text-pretty text-base text-muted-foreground">A birth chart maps the Moon, rising sign, planets, houses, and aspects for your exact birth time and place.</p><Button asChild variant="mystic" size="lg" className="mt-6"><Link href="/natal-chart">Explore my natal chart<ArrowRight className="size-4" /></Link></Button></div>
        <p className="mt-8 text-xs leading-relaxed text-muted-foreground">Numerology is a symbolic tradition, not a scientifically validated personality test or predictive method. Use these meanings for reflection rather than certainty.</p>
      </section>
      <SiteFooter locale="en" />
    </main>
  );
}

export function LifePathNumberPageEn({ number, content }: { number: LifePathNumber; content: LifePathContentEn }) {
  const master = number.length > 1; const url = `${SITE}/numerologia/${number}`;
  const sections = [
    { title: "Natural strengths", body: content.strengths, accent: "var(--vivida-cyan)" },
    { title: "Growth challenges", body: content.challenges, accent: "var(--vivida-pink)" },
    { title: "Love and relationships", body: content.love, accent: "var(--vivida-violet)" },
    { title: "Career and work style", body: content.career, accent: "var(--vivida-gold, #eac358)" },
  ];
  const structuredData = [
    { "@context": "https://schema.org", "@type": "Article", headline: content.title, description: content.essence, inLanguage: "en", mainEntityOfPage: { "@type": "WebPage", "@id": url }, author: { "@type": "Organization", name: "Vivida", url: SITE }, publisher: { "@type": "Organization", name: "Vivida", url: SITE } },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: SITE }, { "@type": "ListItem", position: 2, name: "Numerology", item: `${SITE}/numerologia` }, { "@type": "ListItem", position: 3, name: `Life Path ${number}`, item: url }] },
  ];

  return (
    <main lang="en" className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <Background /><Starfield count={110} shooting={2} /><SmartHeader locale="en" georgianPath={`/numerologia/${number}`} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <section className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-12">
        <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground"><Link href="/">Home</Link><span>/</span><Link href="/numerologia">Numerology</Link><span>/</span><span className="text-foreground/80">Life Path {number}</span></nav>
        <header className="mb-8"><div className="flex items-center gap-4"><NumberBadge number={number} master={master} large /><div><h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">{content.title}</h1>{master && <div className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-[var(--vivida-gold,#eac358)]">Master Number</div>}</div></div><p className="mt-4 text-pretty text-lg leading-relaxed text-foreground/90">{content.essence}</p><ul className="mt-4 flex flex-wrap gap-2">{content.traits.map((trait) => <li key={trait} className="rounded-full border border-border bg-card/55 px-3 py-1 text-sm text-foreground/85">{trait}</li>)}</ul></header>

        <div className="space-y-4">{sections.map((section) => <section key={section.title} className="rounded-2xl border border-border bg-card/50 p-5 ring-1 ring-foreground/5 sm:p-6"><h2 className="text-sm font-semibold uppercase tracking-[0.14em]" style={{ color: section.accent }}>{section.title}</h2><p className="mt-2 text-[15px] leading-relaxed text-foreground/90">{section.body}</p></section>)}<section className="rounded-2xl border border-[var(--vivida-violet)]/30 bg-[var(--vivida-violet)]/8 p-5 sm:p-6"><h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--vivida-violet)]">Advice for Life Path {number}</h2><p className="mt-2 text-[15px] leading-relaxed text-foreground/90">{content.advice}</p></section></div>

        <section className="mt-10"><h2 className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Other life path numbers</h2><div className="flex flex-wrap gap-2">{LIFE_PATH_NUMBERS.filter((item) => item !== number).map((item) => <Link key={item} href={`/numerologia/${item}`} className="grid size-11 place-items-center rounded-xl border border-border bg-card/55 text-sm font-semibold transition-colors hover:bg-card/80">{item}</Link>)}</div></section>

        <div className="mt-12 rounded-2xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/12 via-card/60 to-[var(--vivida-cyan)]/12 p-7 text-center sm:p-9"><Sparkles className="mx-auto mb-3 size-6 text-[var(--vivida-violet)]" /><h2 className="text-balance text-xl font-semibold tracking-tight sm:text-2xl">One number is one part of the picture</h2><p className="mx-auto mt-2 max-w-md text-pretty text-sm text-muted-foreground sm:text-base">Explore a Western birth chart calculated from your exact birth time and place.</p><Button asChild variant="mystic" size="lg" className="mt-5"><Link href="/natal-chart">Explore my natal chart<ArrowRight className="size-4" /></Link></Button></div>
        <p className="mt-8 text-xs leading-relaxed text-muted-foreground">This interpretation reflects numerology tradition and is intended for self-reflection. It is not a scientific assessment, diagnosis, or prediction.</p>
      </section>
      <SiteFooter locale="en" />
    </main>
  );
}

function NumberBadge({ number, master, large = false }: { number: string; master: boolean; large?: boolean }) {
  return <span className={`grid shrink-0 place-items-center rounded-2xl font-bold ${large ? "size-16 text-3xl" : "size-12 text-xl"} ${master ? "bg-[var(--vivida-gold,#eac358)]/15 text-[var(--vivida-gold,#eac358)] ring-1 ring-[var(--vivida-gold,#eac358)]/40" : "bg-[var(--vivida-violet)]/15 text-[var(--vivida-violet)] ring-1 ring-[var(--vivida-violet)]/40"}`}>{number}</span>;
}

function Background() {
  return <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_220/0.45),transparent_70%)]" />;
}
