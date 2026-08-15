import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { Starfield } from "@/components/landing/starfield";
import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { DREAM_BY_SLUG, DREAM_SYMBOLS, type DreamSymbol } from "@/lib/seo/dreams";
import { DREAM_EN_BY_SLUG, DREAM_SYMBOLS_EN, type DreamSymbolEn } from "@/lib/seo/dreams-en";

const SITE = "https://www.vividaastro.com";

export const DREAMS_HUB_EN = {
  title: "Dream Dictionary A–Z: Symbols and Meanings",
  description:
    "Explore 38 common dream symbols, from snakes, water and teeth to flying, falling and being chased, with traditional and psychological interpretations.",
};

const FAQ = [
  {
    q: "Do dreams predict the future?",
    a: "There is no reliable evidence that ordinary dreams predict future events. They more often recombine emotion, memory, expectation, and recent experience while the brain sleeps.",
  },
  {
    q: "Why do the same dream symbols mean different things to different people?",
    a: "Personal associations change the meaning. A dog may feel protective to one person and frightening to another, so emotion and current life context matter more than a fixed dictionary definition.",
  },
  {
    q: "Why do recurring dreams happen?",
    a: "Recurring dreams often accompany repeated stress, unresolved emotion, or a familiar life pattern. Recording what happened before each dream can reveal the trigger more clearly.",
  },
];

export function DreamsHubEn() {
  const groups = [...DREAM_SYMBOLS_EN]
    .sort((a, b) => a.title.localeCompare(b.title))
    .reduce<Array<{ letter: string; items: DreamSymbolEn[] }>>((all, item) => {
      const letter = item.title[0].toUpperCase();
      const group = all.find((entry) => entry.letter === letter);
      if (group) group.items.push(item);
      else all.push({ letter, items: [item] });
      return all;
    }, []);
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: DREAMS_HUB_EN.title,
      description: DREAMS_HUB_EN.description,
      inLanguage: "en",
      mainEntityOfPage: `${SITE}/sizmris-akhsna`,
      publisher: { "@type": "Organization", name: "Vivida", url: SITE },
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Dream symbols and meanings",
      numberOfItems: DREAM_SYMBOLS_EN.length,
      itemListElement: DREAM_SYMBOLS_EN.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.title,
        url: `${SITE}/sizmris-akhsna/${item.slug}`,
      })),
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
    <main lang="en" className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <Background />
      <Starfield count={130} shooting={3} />
      <SmartHeader locale="en" georgianPath="/sizmris-akhsna" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <section className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-10">
        <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/">Home</Link><span>/</span><span className="text-foreground/80">Dream dictionary</span>
        </nav>

        <header className="mb-9 text-center">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Dream symbols</div>
          <h1 className="mt-1 text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Dream dictionary <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">A–Z</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-base leading-relaxed text-foreground/80 sm:text-lg">
            Find the image you remember and explore both its traditional symbolism
            and a grounded psychological reading. Meanings are prompts for reflection,
            not predictions or diagnoses.
          </p>
        </header>

        <div className="space-y-7">
          {groups.map((group) => (
            <section key={group.letter}>
              <h2 className="mb-2.5 flex items-center gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-[var(--vivida-violet)]/35 bg-[var(--vivida-violet)]/12 text-lg font-semibold text-[var(--vivida-violet)]">{group.letter}</span>
                <span className="h-px flex-1 bg-border/60" />
              </h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {group.items.map((item) => {
                  const base = DREAM_BY_SLUG[item.slug];
                  return (
                    <Link key={item.slug} href={`/sizmris-akhsna/${item.slug}`} className="group flex items-start gap-3 rounded-xl border border-border/60 bg-card/40 px-3.5 py-3 transition-colors hover:bg-card/75">
                      <span className="text-xl leading-none">{base?.glyph}</span>
                      <span className="min-w-0"><span className="block font-medium text-foreground/90">{item.title}</span><span className="mt-0.5 block text-[12px] leading-snug text-muted-foreground">{item.summary}</span></span>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <section className="mt-12 rounded-3xl border border-border bg-card/40 p-6 ring-1 ring-foreground/5 sm:p-8">
          <h2 className="text-xl font-semibold tracking-tight">How to interpret a dream</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-foreground/85">
            A symbol is a starting point. Your own life provides the context, so use
            these three questions before accepting any interpretation:
          </p>
          <ol className="mt-4 space-y-3 text-[15px] leading-relaxed text-foreground/85">
            {["What did you feel? Fear, relief, wonder, and disgust can completely change the same image.", "What is happening now? Dreams commonly process recent tension, decisions, relationships, and memories.", "Which detail stayed vivid? The most memorable object, color, person, or action is often the best clue."].map((text, index) => (
              <li key={text} className="flex gap-3"><span className="grid size-6 shrink-0 place-items-center rounded-lg bg-[var(--vivida-violet)]/15 text-xs font-semibold text-[var(--vivida-violet)]">{index + 1}</span><span>{text}</span></li>
            ))}
          </ol>
        </section>

        <section className="mt-12">
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Frequently asked questions</h2>
          <div className="space-y-3">{FAQ.map((item) => <details key={item.q} className="rounded-2xl border border-border bg-card/50 p-5"><summary className="cursor-pointer font-medium">{item.q}</summary><p className="mt-3 text-sm leading-relaxed text-foreground/85 sm:text-base">{item.a}</p></details>)}</div>
        </section>

        <div className="mt-14 rounded-2xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/12 via-card/60 to-[var(--vivida-cyan)]/12 p-7 text-center sm:p-10">
          <Sparkles className="mx-auto mb-3 size-7 text-[var(--vivida-violet)]" />
          <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">Dreams show one night; a birth chart shows a wider pattern</h2>
          <p className="mx-auto mt-3 max-w-md text-pretty text-base text-muted-foreground">Explore how the Moon, signs, houses, and aspects describe your emotional landscape.</p>
          <Link href="/natal-chart" className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-[linear-gradient(135deg,var(--vivida-violet),var(--vivida-pink))] px-5 py-2.5 text-sm font-semibold text-white">Explore my natal chart<ArrowRight className="size-4" /></Link>
        </div>
      </section>
      <SiteFooter locale="en" />
    </main>
  );
}

export function DreamSymbolPageEn({ base, content }: { base: DreamSymbol; content: DreamSymbolEn }) {
  const url = `${SITE}/sizmris-akhsna/${base.slug}`;
  const related = base.related.map((slug) => ({ base: DREAM_BY_SLUG[slug], en: DREAM_EN_BY_SLUG[slug] })).filter((item) => item.base && item.en);
  const alsoSee = DREAM_SYMBOLS.filter((item) => item.slug !== base.slug && !base.related.includes(item.slug)).slice(0, 12);
  const faq = content.variants.map((variant) => ({ q: `What does it mean when ${variant.when} in a dream?`, a: variant.meaning }));
  const structuredData = [
    { "@context": "https://schema.org", "@type": "Article", headline: `${content.title} Dream Meaning`, description: content.summary, inLanguage: "en", mainEntityOfPage: { "@type": "WebPage", "@id": url }, author: { "@type": "Organization", name: "Vivida", url: SITE }, publisher: { "@type": "Organization", name: "Vivida", url: SITE } },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })) },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: SITE }, { "@type": "ListItem", position: 2, name: "Dream dictionary", item: `${SITE}/sizmris-akhsna` }, { "@type": "ListItem", position: 3, name: content.title, item: url }] },
  ];

  return (
    <main lang="en" className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <Background /><Starfield count={110} shooting={2} /><SmartHeader locale="en" georgianPath={`/sizmris-akhsna/${base.slug}`} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <section className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-10">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs text-muted-foreground"><Link href="/">Home</Link><span>/</span><Link href="/sizmris-akhsna">Dream dictionary</Link><span>/</span><span className="text-foreground/80">{content.title}</span></nav>
        <header className="mb-8">
          <div className="flex items-center gap-4"><span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-[var(--vivida-violet)]/15 text-3xl ring-1 ring-[var(--vivida-violet)]/35">{base.glyph}</span><div><h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">{content.title} dream meaning</h1><p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Dream interpretation</p></div></div>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-foreground/90">{content.summary}</p>
        </header>

        <section className="rounded-2xl border border-border bg-card/50 p-5 ring-1 ring-foreground/5 sm:p-6"><h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--vivida-violet)]">General meaning</h2><p className="mt-2 text-[15px] leading-relaxed text-foreground/90">{content.meaning}</p></section>

        <section className="mt-8"><h2 className="text-xl font-semibold tracking-tight">Common {content.title.toLowerCase()} dream scenarios</h2><p className="mt-1.5 text-sm text-muted-foreground">Choose the version closest to what you remember.</p><div className="mt-4 space-y-3">{content.variants.map((variant) => <article key={variant.when} className="rounded-2xl border border-border/70 bg-card/40 p-5"><h3 className="font-semibold text-foreground/95">When {variant.when}</h3><p className="mt-1.5 text-[15px] leading-relaxed text-foreground/85">{variant.meaning}</p></article>)}</div></section>

        <div className="mt-8 grid gap-3 sm:grid-cols-2"><section className="rounded-2xl border border-[var(--vivida-cyan)]/30 bg-[var(--vivida-cyan)]/8 p-5"><h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--vivida-cyan)]">Positive reading</h2><p className="mt-2 text-[15px] leading-relaxed text-foreground/90">{content.positive}</p></section><section className="rounded-2xl border border-[var(--vivida-pink)]/30 bg-[var(--vivida-pink)]/8 p-5"><h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--vivida-pink)]">What to notice</h2><p className="mt-2 text-[15px] leading-relaxed text-foreground/90">{content.caution}</p></section></div>

        {related.length > 0 && <section className="mt-10"><h2 className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Related symbols</h2><div className="grid gap-2 sm:grid-cols-3">{related.map((item) => <Link key={item.base.slug} href={`/sizmris-akhsna/${item.base.slug}`} className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-card/45 px-3.5 py-2.5 text-sm"><span className="text-lg">{item.base.glyph}</span><span className="font-medium">{item.en.title}</span></Link>)}</div></section>}

        <section className="mt-8"><h2 className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Other dream meanings</h2><div className="flex flex-wrap gap-2">{alsoSee.map((item) => <Link key={item.slug} href={`/sizmris-akhsna/${item.slug}`} className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/50 px-3 py-1.5 text-xs"><span>{item.glyph}</span>{DREAM_EN_BY_SLUG[item.slug].title}</Link>)}<Link href="/sizmris-akhsna" className="inline-flex items-center gap-1 rounded-full border border-[var(--vivida-violet)]/40 bg-[var(--vivida-violet)]/10 px-3 py-1.5 text-xs font-medium text-[var(--vivida-violet)]">All symbols<ArrowRight className="size-3" /></Link></div></section>

        <div className="mt-12 rounded-2xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/12 via-card/60 to-[var(--vivida-cyan)]/12 p-7 text-center sm:p-9"><Sparkles className="mx-auto mb-3 size-6 text-[var(--vivida-violet)]" /><h2 className="text-balance text-xl font-semibold tracking-tight sm:text-2xl">Need a different reflective prompt?</h2><p className="mx-auto mt-2 max-w-md text-pretty text-sm text-muted-foreground sm:text-base">Explore Tarot as a symbolic tool for considering your question from another angle.</p><Link href="/taro" className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-[linear-gradient(135deg,var(--vivida-violet),var(--vivida-pink))] px-5 py-2.5 text-sm font-semibold text-white">Explore Tarot<ArrowRight className="size-4" /></Link></div>
        <p className="mt-8 text-xs leading-relaxed text-muted-foreground">Dream interpretation is subjective and is not a medical or mental-health diagnosis. Persistent distress, sleep disruption, or trauma-related nightmares deserve support from a qualified professional.</p>
      </section>
      <SiteFooter locale="en" />
    </main>
  );
}

function Background() {
  return <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.30_0.16_265/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.28_0.14_300/0.45),transparent_70%)]" />;
}
