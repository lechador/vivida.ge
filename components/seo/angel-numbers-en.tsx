import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { Starfield } from "@/components/landing/starfield";
import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { ANGEL_NUMBERS, type AngelNumber } from "@/lib/seo/angel-numbers";
import { ANGEL_FAQ_EN, ANGEL_NUMBERS_EN, type AngelNumberEn } from "@/lib/seo/angel-numbers-en";

const SITE = "https://www.vividaastro.com";

export const ANGEL_HUB_EN = {
  title: "Angel Numbers: 111, 222, 333 and 11:11 Meanings",
  description: "Explore modern numerology meanings for repeating numbers including 000, 111, 222, 333, 444, 555, 777, 888, 999, 11:11, 12:12, and 1234.",
};

export function AngelNumbersHubEn() {
  const structuredData = [
    { "@context": "https://schema.org", "@type": "Article", headline: ANGEL_HUB_EN.title, description: ANGEL_HUB_EN.description, inLanguage: "en", mainEntityOfPage: `${SITE}/angeluri-ricxvebi`, publisher: { "@type": "Organization", name: "Vivida", url: SITE } },
    { "@context": "https://schema.org", "@type": "ItemList", name: "Angel number meanings", numberOfItems: ANGEL_NUMBERS_EN.length, itemListElement: ANGEL_NUMBERS_EN.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.title, url: `${SITE}/angeluri-ricxvebi/${item.slug}` })) },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: ANGEL_FAQ_EN.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })) },
  ];
  return (
    <main lang="en" className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <Background /><Starfield count={120} shooting={3} /><SmartHeader locale="en" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <section className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-10">
        <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground"><Link href="/">Home</Link><span>/</span><span className="text-foreground/80">Angel numbers</span></nav>
        <header className="mb-8 text-center"><div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Modern numerology</div><h1 className="mt-1 text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">Angel number <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">meanings</span></h1><p className="mx-auto mt-4 max-w-2xl text-pretty text-base leading-relaxed text-foreground/80">Keep noticing 11:11, 222, or another pattern? Explore its modern symbolic reading, then turn the moment into a grounded question or action rather than a prediction.</p></header>

        <div className="grid gap-3 sm:grid-cols-2">{ANGEL_NUMBERS_EN.map((item) => {
          const base = ANGEL_NUMBERS.find((number) => number.slug === item.slug);
          return <Link key={item.slug} href={`/angeluri-ricxvebi/${item.slug}`} className="group flex flex-col rounded-2xl border border-border bg-card/45 p-5 ring-1 ring-foreground/5 transition-colors hover:bg-card/75"><div className="flex items-baseline gap-2.5"><span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-cyan))] bg-clip-text text-2xl font-bold tracking-tight text-transparent">{item.slug}</span>{base?.clockKa && <span className="rounded-full border border-border/70 bg-background/40 px-2 py-0.5 text-[11px] text-muted-foreground">{base.clockKa}</span>}</div><p className="mt-2 text-[14px] leading-relaxed text-foreground/85">{item.essence}</p><span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[var(--vivida-violet)]">Read the meaning<ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" /></span></Link>;
        })}</div>

        <section className="mt-12 rounded-3xl border border-border bg-card/40 p-6 ring-1 ring-foreground/5 sm:p-8"><h2 className="text-xl font-semibold tracking-tight">Why repeating numbers stand out</h2><p className="mt-3 text-[15px] leading-relaxed text-foreground/85">Once a pattern becomes meaningful, selective attention makes it easier to notice again. Symmetry and repetition are also memorable, and phones, clocks, receipts, and addresses expose us to many numbers every day.</p><p className="mt-3 text-[15px] leading-relaxed text-foreground/85">A symbolic practice can still be useful when it creates a pause. Use the sighting to identify what you were thinking, check the evidence, and choose an action within your control.</p></section>

        <section className="mt-12"><h2 className="mb-4 text-2xl font-semibold tracking-tight">Frequently asked questions</h2><div className="space-y-3">{ANGEL_FAQ_EN.map((item) => <details key={item.q} className="rounded-2xl border border-border bg-card/50 p-5"><summary className="cursor-pointer font-medium">{item.q}</summary><p className="mt-3 text-[15px] leading-relaxed text-foreground/85">{item.a}</p></details>)}</div></section>

        <div className="mt-14 rounded-2xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/12 via-card/60 to-[var(--vivida-cyan)]/12 p-7 text-center sm:p-10"><Sparkles className="mx-auto mb-3 size-7 text-[var(--vivida-violet)]" /><h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">Calculate your life path number</h2><p className="mx-auto mt-3 max-w-md text-pretty text-base text-muted-foreground">Angel numbers describe a moment in modern numerology; a life path number is calculated from your birth date.</p><Link href="/numerologia" className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-[linear-gradient(135deg,var(--vivida-violet),var(--vivida-pink))] px-5 py-2.5 text-sm font-semibold text-white">Life path calculator<ArrowRight className="size-4" /></Link></div>
        <p className="mt-8 text-xs leading-relaxed text-muted-foreground">Angel numbers are a symbolic spiritual tradition, not a scientifically validated prediction or communication method. Do not base high-stakes decisions on a number sequence.</p>
      </section>
      <SiteFooter locale="en" />
    </main>
  );
}

export function AngelNumberPageEn({ base, content }: { base: AngelNumber; content: AngelNumberEn }) {
  const url = `${SITE}/angeluri-ricxvebi/${base.slug}`;
  const faq = [
    { q: `What does ${base.slug} mean?`, a: content.meaning },
    { q: `What does ${base.slug} mean in love?`, a: content.love },
    { q: `What should I do when I see ${base.slug}?`, a: content.action },
  ];
  const structuredData = [
    { "@context": "https://schema.org", "@type": "Article", headline: content.title, description: content.essence, inLanguage: "en", mainEntityOfPage: { "@type": "WebPage", "@id": url }, author: { "@type": "Organization", name: "Vivida", url: SITE }, publisher: { "@type": "Organization", name: "Vivida", url: SITE } },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })) },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: SITE }, { "@type": "ListItem", position: 2, name: "Angel numbers", item: `${SITE}/angeluri-ricxvebi` }, { "@type": "ListItem", position: 3, name: base.slug, item: url }] },
  ];
  const sections = [
    { title: "Love and relationships", body: content.love, accent: "var(--vivida-pink)" },
    { title: "Career and money", body: content.career, accent: "var(--vivida-cyan)" },
  ];
  return (
    <main lang="en" className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <Background /><Starfield count={110} shooting={2} /><SmartHeader locale="en" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <section className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-10">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs text-muted-foreground"><Link href="/">Home</Link><span>/</span><Link href="/angeluri-ricxvebi">Angel numbers</Link><span>/</span><span className="text-foreground/80">{base.slug}</span></nav>
        <header className="mb-8"><div className="flex flex-wrap items-center gap-3"><span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-6xl">{base.slug}</span>{base.clockKa && <span className="rounded-full border border-border bg-card/60 px-3 py-1 text-sm text-muted-foreground">{base.clockKa}</span>}</div><h1 className="mt-3 text-balance text-2xl font-semibold tracking-tight sm:text-3xl">{content.title}</h1><p className="mt-3 text-pretty text-lg leading-relaxed text-foreground/90">{content.essence}</p></header>

        <section className="rounded-2xl border border-border bg-card/50 p-5 ring-1 ring-foreground/5 sm:p-6"><h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--vivida-violet)]">What {base.slug} means</h2><p className="mt-2 text-[15px] leading-relaxed text-foreground/90">{content.meaning}</p></section>
        <div className="mt-4 space-y-4">{sections.map((section) => <section key={section.title} className="rounded-2xl border border-border bg-card/50 p-5 ring-1 ring-foreground/5 sm:p-6"><h2 className="text-sm font-semibold uppercase tracking-[0.14em]" style={{ color: section.accent }}>{section.title}</h2><p className="mt-2 text-[15px] leading-relaxed text-foreground/90">{section.body}</p></section>)}<section className="rounded-2xl border border-[var(--vivida-violet)]/30 bg-[var(--vivida-violet)]/8 p-5 sm:p-6"><h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--vivida-violet)]">What to do when you see {base.slug}</h2><p className="mt-2 text-[15px] leading-relaxed text-foreground/90">{content.action}</p></section></div>

        <section className="mt-10"><h2 className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Other angel numbers</h2><div className="flex flex-wrap gap-2">{ANGEL_NUMBERS.filter((item) => item.slug !== base.slug).map((item) => <Link key={item.slug} href={`/angeluri-ricxvebi/${item.slug}`} className="rounded-xl border border-border bg-card/55 px-3.5 py-2 text-sm font-semibold transition-colors hover:bg-card/85">{item.slug}</Link>)}</div></section>

        <div className="mt-12 rounded-2xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/12 via-card/60 to-[var(--vivida-cyan)]/12 p-7 text-center sm:p-9"><Sparkles className="mx-auto mb-3 size-6 text-[var(--vivida-violet)]" /><h2 className="text-balance text-xl font-semibold tracking-tight sm:text-2xl">Find your life path number</h2><p className="mx-auto mt-2 max-w-md text-pretty text-sm text-muted-foreground sm:text-base">Calculate a numerology archetype from your birth date and explore its traditional themes.</p><Link href="/numerologia" className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-[linear-gradient(135deg,var(--vivida-violet),var(--vivida-pink))] px-5 py-2.5 text-sm font-semibold text-white">Calculate my number<ArrowRight className="size-4" /></Link></div>
        <p className="mt-8 text-xs leading-relaxed text-muted-foreground">This interpretation reflects a modern symbolic tradition. It is not evidence that numbers predict events or transmit instructions, and it should not replace facts or professional advice.</p>
      </section>
      <SiteFooter locale="en" />
    </main>
  );
}

function Background() {
  return <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_220/0.45),transparent_70%)]" />;
}
