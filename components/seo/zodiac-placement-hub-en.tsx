import Link from "next/link";
import { Moon, Sparkles, Sunrise } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import { ALL_SLUGS, signMetaBySlug } from "@/lib/seo/zodiac-dates";
import { SIGNS_CONTENT } from "@/lib/seo/zodiac-content";
import { signColor } from "@/lib/zodiac";
import { placementEnglish, type PlacementKind } from "@/lib/zodiac-placement-en";

const CONFIG = {
  moon: {
    path: "/zodiac/mtvare",
    eyebrow: "Moon signs",
    title: "Moon Signs: Your Emotional Nature",
    tagline:
      "Discover what your Moon sign reveals about instinct, comfort, vulnerability, and the way you connect behind closed doors.",
    intro:
      "Your Sun sign describes a central source of identity, but the Moon speaks in a quieter language. It shows what you need to feel secure, how you react before logic arrives, and which emotional rhythms restore you. Because the Moon changes signs roughly every two and a half days, your birth date, time, and location help identify it accurately.",
    cards: [
      {
        title: "What does a Moon sign mean?",
        body: "The Moon represents emotional needs, habits, memory, instinctive reactions, and the private self. It often becomes most visible in close relationships, at home, and during stress.",
      },
      {
        title: "Moon sign vs. Sun sign",
        body: "The Sun describes conscious identity and direction; the Moon describes emotional regulation and belonging. Both matter, and their relationship adds important nuance.",
      },
      {
        title: "How do I find my Moon sign?",
        body: "Use a natal chart calculator with your birth date, place, and preferably exact time. On days when the Moon changes signs, time and location can change the result.",
      },
    ],
    choose: "Choose your Moon sign",
    cardName: (name: string) => `Moon in ${name}`,
    ctaTitle: "Find your exact Moon sign",
    ctaBody:
      "Calculate your birth chart to see the Moon, rising sign, planets, houses, and aspects together.",
    cta: "Calculate my birth chart",
  },
  rising: {
    path: "/zodiac/amomavali",
    eyebrow: "Rising signs · Ascendants",
    title: "Rising Signs: Your Ascendant Explained",
    tagline:
      "Explore how your rising sign shapes first impressions, personal style, and the way you approach new experiences.",
    intro:
      "The rising sign, also called the Ascendant, is the sign appearing on the eastern horizon at your exact moment of birth. It sets the structure of the houses and acts as the doorway through which the rest of your chart is expressed. Because it usually changes about every two hours, an accurate birth time is especially important.",
    cards: [
      {
        title: "What does a rising sign mean?",
        body: "The Ascendant describes your immediate response to life, the social energy others meet first, and the style you use to navigate unfamiliar situations.",
      },
      {
        title: "Rising sign vs. Sun sign",
        body: "The Sun points to conscious identity and purpose. The rising sign describes presentation and approach, while its ruling planet becomes a major guide in the full chart.",
      },
      {
        title: "How do I find my Ascendant?",
        body: "Enter your exact birth time and birthplace in a natal chart calculator. Even a modest time difference can move the Ascendant or change its degree.",
      },
    ],
    choose: "Choose your rising sign",
    cardName: (name: string) => `${name} rising`,
    ctaTitle: "Find your exact rising sign",
    ctaBody:
      "Use your birth date, exact time, and place to calculate the Ascendant and your complete natal chart.",
    cta: "Calculate my Ascendant",
  },
} as const;

export function ZodiacPlacementHubEn({ kind }: { kind: PlacementKind }) {
  const c = CONFIG[kind];
  const Icon = kind === "moon" ? Moon : Sunrise;
  const faq = c.cards.map((card) => ({ q: card.title, a: card.body }));
  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: c.title,
      description: c.tagline,
      url: `https://www.vividaastro.com${c.path}`,
      inLanguage: "en",
      mainEntity: {
        "@type": "ItemList",
        itemListElement: ALL_SLUGS.map((slug, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: `https://www.vividaastro.com${c.path}/${slug}`,
          name: c.cardName(signMetaBySlug(slug)!.labelEn),
        })),
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
  ];

  return (
    <main lang="en" className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_220/0.45),transparent_70%)]" />
      <Starfield count={130} shooting={3} />
      <SmartHeader locale="en" georgianPath={c.path} />
      {ld.map((item, index) => (
        <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }} />
      ))}
      <section className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-12">
        <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/zodiac" className="hover:text-foreground">Zodiac signs</Link>
          <span>/</span>
          <span className="text-foreground/80">{kind === "moon" ? "Moon signs" : "Rising signs"}</span>
        </nav>
        <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          <Icon className="size-3.5" /> {c.eyebrow}
        </div>
        <h1 className="mb-4 text-balance text-3xl font-semibold tracking-tight sm:text-5xl">{c.title}</h1>
        <p className="max-w-2xl text-pretty text-lg text-muted-foreground">{c.tagline}</p>
        <p className="mt-12 max-w-3xl text-pretty text-base leading-relaxed text-foreground/90 sm:text-lg">{c.intro}</p>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {c.cards.map((card) => (
            <article key={card.title} className="rounded-2xl border border-border bg-card/55 p-5 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-6">
              <h2 className="mb-3 text-lg font-semibold tracking-tight">{card.title}</h2>
              <p className="text-pretty text-sm leading-relaxed text-foreground/85">{card.body}</p>
            </article>
          ))}
        </div>

        <section className="mt-14">
          <h2 className="mb-5 text-2xl font-semibold tracking-tight sm:text-3xl">{c.choose}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ALL_SLUGS.map((slug) => {
              const meta = signMetaBySlug(slug)!;
              const accent = signColor(meta);
              const copy = placementEnglish(kind, slug);
              return (
                <Link key={slug} href={`${c.path}/${slug}`} className="group flex items-center gap-3 rounded-2xl border border-border bg-card/55 p-4 ring-1 ring-foreground/5 backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:bg-card/80 hover:ring-foreground/15">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl text-xl" style={{ background: `color-mix(in oklch, ${accent} 18%, transparent)`, color: accent }}>
                    {SIGNS_CONTENT[slug].symbol}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold tracking-tight">{c.cardName(meta.labelEn)}</div>
                    <div className="line-clamp-1 text-xs text-muted-foreground">{copy.tagline}</div>
                  </div>
                  <span aria-hidden className="text-muted-foreground transition-transform group-hover:translate-x-0.5">→</span>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mt-16 max-w-3xl">
          <h2 className="mb-5 text-2xl font-semibold tracking-tight sm:text-3xl">Frequently asked questions</h2>
          <div className="space-y-3">
            {faq.map((item) => (
              <details key={item.q} className="group rounded-2xl border border-border bg-card/55 p-4 ring-1 ring-foreground/5 open:bg-card/80 sm:p-5">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 font-medium"><span>{item.q}</span><span aria-hidden className="text-muted-foreground transition-transform group-open:rotate-45">✦</span></summary>
                <p className="mt-3 text-sm leading-relaxed text-foreground/85 sm:text-base">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <div className="mt-16 rounded-2xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/12 via-card/60 to-[var(--vivida-cyan)]/12 p-7 text-center ring-1 ring-foreground/5 sm:p-10">
          <Sparkles className="mx-auto mb-3 size-7 text-[var(--vivida-violet)]" />
          <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">{c.ctaTitle}</h2>
          <p className="mx-auto mt-3 max-w-md text-pretty text-base text-muted-foreground">{c.ctaBody}</p>
          <Button asChild variant="mystic" size="lg" className="mt-6"><Link href="/natal-chart">{c.cta}</Link></Button>
        </div>
      </section>
      <SiteFooter locale="en" />
    </main>
  );
}
