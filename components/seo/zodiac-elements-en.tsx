import { EnglishLink as Link } from "@/components/i18n/international-link";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ReportPromo } from "@/components/report/report-promo";
import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import {
  ALL_ELEMENT_SLUGS,
  SIGNS_BY_ELEMENT,
  signMetaBySlug,
  type ElementSlug,
} from "@/lib/seo/zodiac-dates";
import { SIGNS_CONTENT } from "@/lib/seo/zodiac-content";
import { signColor } from "@/lib/zodiac";
import { ELEMENT_ENGLISH } from "@/lib/zodiac-element-en";

const PATH = "/zodiac/elementebi";
const ACCENT: Record<ElementSlug, string> = {
  fire: "oklch(0.72 0.22 30)", earth: "oklch(0.65 0.13 130)", air: "oklch(0.78 0.16 220)", water: "oklch(0.65 0.20 285)",
};
const GLYPH: Record<ElementSlug, string> = { fire: "△", earth: "▽", air: "△", water: "▽" };

export function ZodiacElementsHubEn() {
  const faq = [
    { q: "What are the four zodiac elements?", a: "The twelve zodiac signs are grouped into Fire, Earth, Air, and Water. Each element describes a broad way of processing experience and expressing energy." },
    { q: "Which element is my zodiac sign?", a: "Aries, Leo, and Sagittarius are Fire; Taurus, Virgo, and Capricorn are Earth; Gemini, Libra, and Aquarius are Air; Cancer, Scorpio, and Pisces are Water." },
    { q: "Do I have only one element?", a: "No. Your Sun sign has one element, but every planet and angle occupies a sign. A complete birth chart shows the balance of all four elements." },
  ];
  const ld = [
    { "@context": "https://schema.org", "@type": "CollectionPage", name: "The Four Zodiac Elements", description: "Understand Fire, Earth, Air, and Water signs, including personality, strengths, challenges, love, career, and compatibility.", url: `https://www.vividaastro.com${PATH}`, inLanguage: "en" },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })) },
  ];
  return (
    <main lang="en" className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_220/0.45),transparent_70%)]" />
      <Starfield count={130} shooting={3} /><SmartHeader locale="en" georgianPath={PATH} />
      {ld.map((item, index) => <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }} />)}
      <section className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-12">
        <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground"><Link href="/zodiac" className="hover:text-foreground">Zodiac signs</Link><span>/</span><span className="text-foreground/80">Elements</span></nav>
        <div className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Astrology fundamentals</div>
        <h1 className="mb-4 text-balance text-3xl font-semibold tracking-tight sm:text-5xl">The Four Zodiac Elements</h1>
        <p className="max-w-2xl text-pretty text-lg text-muted-foreground">Fire, Earth, Air, and Water describe four essential styles of energy in astrology.</p>
        <p className="mt-12 max-w-3xl text-pretty text-base leading-relaxed text-foreground/90 sm:text-lg">Every zodiac sign belongs to one of four elements. The elements connect signs that may look different on the surface but share a basic way of meeting life. They help explain temperament, motivation, relationship needs, and how the placements in a complete birth chart work together.</p>
        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {ALL_ELEMENT_SLUGS.map((element) => {
            const content = ELEMENT_ENGLISH[element];
            return <Link key={element} href={`${PATH}/${element}`} className="group relative overflow-hidden rounded-2xl border border-border bg-card/65 p-6 ring-1 ring-foreground/5 transition-all hover:-translate-y-0.5 hover:bg-card/80">
              <div aria-hidden className="absolute -right-16 -top-16 size-48 rounded-full opacity-30 blur-3xl" style={{ background: `radial-gradient(circle, ${ACCENT[element]} 0%, transparent 70%)` }} />
              <div className="relative flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl text-xl" style={{ color: ACCENT[element], background: `color-mix(in oklch, ${ACCENT[element]} 18%, transparent)` }}>{GLYPH[element]}</span><h2 className="text-xl font-semibold sm:text-2xl">{content.name}</h2></div>
              <p className="relative mt-4 text-sm leading-relaxed text-foreground/85 sm:text-base">{content.tagline}</p>
              <div className="relative mt-4 flex flex-wrap gap-2">{SIGNS_BY_ELEMENT[element].map((sign) => { const meta = signMetaBySlug(sign)!; return <span key={sign} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/40 px-2.5 py-1 text-xs"><span style={{ color: signColor(meta) }}>{SIGNS_CONTENT[sign].symbol}</span>{meta.labelEn}</span>; })}</div>
            </Link>;
          })}
        </div>
        <Faq items={faq} />
        <div className="mt-16 rounded-2xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/12 via-card/60 to-[var(--vivida-cyan)]/12 p-7 text-center ring-1 ring-foreground/5 sm:p-10"><Sparkles className="mx-auto mb-3 size-7 text-[var(--vivida-violet)]" /><h2 className="text-2xl font-semibold sm:text-3xl">See your elemental balance</h2><p className="mx-auto mt-3 max-w-md text-muted-foreground">A complete birth chart shows how much Fire, Earth, Air, and Water your planetary placements contain.</p><Button asChild variant="mystic" size="lg" className="mt-6"><Link href="/natal-chart">Calculate my birth chart</Link></Button></div>
      </section><SiteFooter locale="en" />
    </main>
  );
}

export function ZodiacElementPageEn({ element }: { element: ElementSlug }) {
  const content = ELEMENT_ENGLISH[element];
  const accent = ACCENT[element];
  const faq = [
    { q: `Which zodiac signs are ${content.name.toLowerCase()}?`, a: `${SIGNS_BY_ELEMENT[element].map((sign) => signMetaBySlug(sign)!.labelEn).join(", ")} belong to the ${content.name.toLowerCase()} group.` },
    { q: `What are ${content.name.toLowerCase()} like?`, a: content.personality },
    { q: `Are ${content.name.toLowerCase()} compatible with other elements?`, a: content.compatibility },
  ];
  const url = `https://www.vividaastro.com${PATH}/${element}`;
  const ld = [
    { "@context": "https://schema.org", "@type": "Article", headline: `${content.name}: Traits, Love and Compatibility`, description: content.tagline, inLanguage: "en", mainEntityOfPage: { "@type": "WebPage", "@id": url }, author: { "@type": "Organization", name: "Vivida" } },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })) },
  ];
  return (
    <main lang="en" className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_220/0.45),transparent_70%)]" />
      <Starfield count={130} shooting={3} /><SmartHeader locale="en" georgianPath={`${PATH}/${element}`} />
      {ld.map((item, index) => <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }} />)}
      <section className="relative z-10 mx-auto w-full max-w-4xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-12">
        <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground"><Link href="/zodiac">Zodiac signs</Link><span>/</span><Link href={PATH}>Elements</Link><span>/</span><span className="text-foreground/80">{content.name}</span></nav>
        <article className="relative overflow-hidden rounded-3xl border border-border bg-card/65 p-6 ring-1 ring-foreground/5 sm:p-10">
          <div aria-hidden className="absolute -right-20 -top-20 size-72 rounded-full opacity-30 blur-3xl" style={{ background: `radial-gradient(circle, ${accent} 0%, transparent 70%)` }} />
          <div className="relative flex items-center gap-5"><div className="grid size-20 shrink-0 place-items-center rounded-3xl text-4xl" style={{ color: accent, background: `color-mix(in oklch, ${accent} 18%, transparent)` }}>{GLYPH[element]}</div><div><div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Zodiac element</div><h1 className="mt-1 text-4xl font-semibold tracking-tight sm:text-5xl">{content.name}</h1><p className="mt-2 text-foreground/85 sm:text-lg">{content.tagline}</p></div></div>
          <div className="relative mt-6 flex flex-wrap gap-2">{SIGNS_BY_ELEMENT[element].map((sign) => { const meta = signMetaBySlug(sign)!; return <Link key={sign} href={`/zodiac/${sign}`} className="inline-flex items-center gap-2 rounded-full border border-border bg-card/55 px-3 py-1.5 text-sm hover:bg-card/80"><span style={{ color: signColor(meta) }}>{SIGNS_CONTENT[sign].symbol}</span>{meta.labelEn}</Link>; })}</div>
        </article>
        <p className="mt-12 max-w-3xl text-pretty text-base leading-relaxed text-foreground/90 sm:text-lg">{content.intro}</p>
        <TextSection title={`${content.name} personality`} body={content.personality} />
        <section className="mt-12 grid gap-6 sm:grid-cols-2"><List title="Strengths" items={content.strengths} accent={accent} /><List title="Growth areas" items={content.challenges} accent="var(--muted-foreground)" /></section>
        <TextSection title="In love" body={content.love} /><TextSection title="At work" body={content.career} /><TextSection title="Compatibility with other elements" body={content.compatibility} />
        <Faq items={faq} />
        <section className="mt-14"><h2 className="mb-4 text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">Other elements</h2><div className="flex flex-wrap gap-2">{ALL_ELEMENT_SLUGS.filter((item) => item !== element).map((item) => <Link key={item} href={`${PATH}/${item}`} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/55 px-3 py-1.5 text-sm hover:bg-card/80"><span style={{ color: ACCENT[item] }}>{GLYPH[item]}</span>{ELEMENT_ENGLISH[item].name}</Link>)}</div></section>
        <ReportPromo className="mt-16" />
        <div className="mt-14 rounded-2xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/12 via-card/60 to-[var(--vivida-cyan)]/12 p-7 text-center ring-1 ring-foreground/5 sm:p-10"><Sparkles className="mx-auto mb-3 size-7 text-[var(--vivida-violet)]" /><h2 className="text-2xl font-semibold sm:text-3xl">Your chart is a blend of all four elements</h2><p className="mx-auto mt-3 max-w-md text-muted-foreground">Calculate every planetary placement to understand your complete elemental balance.</p><Button asChild variant="mystic" size="lg" className="mt-6"><Link href="/natal-chart">Calculate my birth chart</Link></Button></div>
      </section><SiteFooter locale="en" />
    </main>
  );
}

function TextSection({ title, body }: { title: string; body: string }) { return <section className="mt-12 max-w-3xl"><h2 className="mb-3 text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2><p className="text-pretty text-base leading-relaxed text-foreground/90">{body}</p></section>; }
function List({ title, items, accent }: { title: string; items: string[]; accent: string }) { return <article className="rounded-2xl border border-border bg-card/55 p-5 ring-1 ring-foreground/5"><h2 className="mb-3 text-lg font-semibold">{title}</h2><ul className="space-y-2 text-sm">{items.map((item) => <li key={item} className="flex gap-2"><span style={{ color: accent }}>✦</span><span>{item}</span></li>)}</ul></article>; }
function Faq({ items }: { items: Array<{ q: string; a: string }> }) { return <section className="mt-16 max-w-3xl"><h2 className="mb-5 text-2xl font-semibold tracking-tight sm:text-3xl">Frequently asked questions</h2><div className="space-y-3">{items.map((item) => <details key={item.q} className="group rounded-2xl border border-border bg-card/55 p-4 ring-1 ring-foreground/5 open:bg-card/80 sm:p-5"><summary className="flex cursor-pointer list-none justify-between gap-4 font-medium"><span>{item.q}</span><span aria-hidden className="text-muted-foreground transition-transform group-open:rotate-45">✦</span></summary><p className="mt-3 text-sm leading-relaxed text-foreground/85 sm:text-base">{item.a}</p></details>)}</div></section>; }
