import Link from "next/link";

import { ChineseYearFinder } from "@/components/calculator/chinese-year-finder";
import { Starfield } from "@/components/landing/starfield";
import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { Button } from "@/components/ui/button";
import {
  CHINESE_ANIMALS,
  chineseAnimalBySlug,
  type ChineseAnimal,
  yearsForAnimal,
} from "@/lib/seo/chinese-zodiac";
import type { ChineseAnimalContentEn } from "@/lib/seo/chinese-zodiac-en";

const SITE = "https://www.vividaastro.com";

export const CHINESE_HUB_EN = {
  title: "Chinese Zodiac: 12 Animal Signs by Birth Year",
  description:
    "Find your Chinese zodiac animal by birth year and explore all 12 signs, their personality traits, elements, love compatibility, and career strengths.",
};

const HUB_FAQ = [
  {
    q: "How do I find my Chinese zodiac sign?",
    a: "Start with your birth year and match it to the twelve-year animal cycle. If you were born in January or early February, check that year's exact Chinese New Year date because your sign may belong to the previous lunar year.",
  },
  {
    q: "Does the Chinese zodiac begin on January 1?",
    a: "No. The zodiac year changes at Chinese New Year, which falls between late January and mid-February. That is why the birth date matters near the beginning of the Gregorian year.",
  },
  {
    q: "What do the five Chinese zodiac elements mean?",
    a: "Wood, Fire, Earth, Metal, and Water add another layer to the animal cycle. A year's element is separate from the fixed element traditionally associated with each earthly branch.",
  },
];

export function ChineseZodiacHubEn() {
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Chinese zodiac animal signs",
      numberOfItems: CHINESE_ANIMALS.length,
      itemListElement: CHINESE_ANIMALS.map((animal, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: animal.nameEn,
        url: `${SITE}/chinuri-horoskopi/${animal.slug}`,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: HUB_FAQ.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE },
        {
          "@type": "ListItem",
          position: 2,
          name: "Chinese zodiac",
          item: `${SITE}/chinuri-horoskopi`,
        },
      ],
    },
  ];

  return (
    <main lang="en" className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <PageBackground />
      <Starfield count={140} shooting={3} />
      <SmartHeader locale="en" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <section className="relative z-10 mx-auto w-full max-w-4xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-12">
        <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/">Home</Link>
          <span>/</span>
          <span className="text-foreground/80">Chinese zodiac</span>
        </nav>

        <header className="text-center">
          <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
            Chinese zodiac: your animal sign by{" "}
            <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
              birth year
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-base text-foreground/80 sm:text-lg">
            Find your sign in the twelve-year animal cycle, then explore its
            personality, relationships, natural strengths, and challenges.
          </p>
        </header>

        <div className="mx-auto mt-8 max-w-md">
          <ChineseYearFinder locale="en" />
        </div>

        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {CHINESE_ANIMALS.map((animal) => (
            <Link
              key={animal.slug}
              href={`/chinuri-horoskopi/${animal.slug}`}
              className="group flex flex-col items-center gap-2 rounded-2xl border border-border bg-card/55 p-5 text-center ring-1 ring-foreground/5 backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:bg-card/80"
            >
              <span className="text-4xl" aria-hidden>
                {animal.emoji}
              </span>
              <span className="font-semibold tracking-tight">{animal.nameEn}</span>
              <span className="text-[11px] tabular-nums text-muted-foreground">
                {yearsForAnimal(animal.slug).slice(0, 3).join(" · ")}
              </span>
            </Link>
          ))}
        </div>

        <article className="mt-14 max-w-3xl space-y-4 text-pretty text-base leading-relaxed text-foreground/90 sm:text-lg">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            How the Chinese zodiac works
          </h2>
          <p>
            The Chinese zodiac assigns one of twelve animals to each lunar year:
            Rat, Ox, Tiger, Rabbit, Dragon, Snake, Horse, Goat, Monkey, Rooster,
            Dog, and Pig. The sequence repeats every twelve years, while a wider
            sixty-year cycle combines those animals with five elements and Yin or
            Yang polarity.
          </p>
          <p>
            The zodiac year does not change on January 1. Chinese New Year moves
            between late January and mid-February, so people born near that window
            should verify the exact date for their birth year before choosing a sign.
          </p>
        </article>

        <section className="mt-12 max-w-3xl">
          <h2 className="mb-5 text-2xl font-semibold tracking-tight sm:text-3xl">
            Frequently asked questions
          </h2>
          <div className="space-y-3">
            {HUB_FAQ.map((item) => (
              <details key={item.q} className="rounded-2xl border border-border bg-card/55 p-5">
                <summary className="cursor-pointer font-medium">{item.q}</summary>
                <p className="mt-3 text-sm leading-relaxed text-foreground/85 sm:text-base">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </section>
      </section>

      <SiteFooter locale="en" />
    </main>
  );
}

export function ChineseAnimalPageEn({
  animal,
  content,
}: {
  animal: ChineseAnimal;
  content: ChineseAnimalContentEn;
}) {
  const years = yearsForAnimal(animal.slug);
  const url = `${SITE}/chinuri-horoskopi/${animal.slug}`;
  const faq = [
    {
      q: `What years are the Year of the ${animal.nameEn}?`,
      a: `Recent ${animal.nameEn} years include ${years.slice(0, 8).join(", ")}. Chinese New Year does not begin on January 1, so January and early-February birthdays should check the exact lunar-year boundary.`,
    },
    {
      q: `What is the ${animal.nameEn} personality?`,
      a: content.personality,
    },
    {
      q: `Which signs are most compatible with the ${animal.nameEn}?`,
      a: `${content.compatible.map((slug) => chineseAnimalBySlug(slug)?.nameEn).join(", ")} are traditionally considered harmonious matches. Compatibility is a broad cultural archetype rather than a guarantee about any relationship.`,
    },
  ];
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: `${animal.nameEn} Chinese Zodiac: Years, Personality and Compatibility`,
      description: content.intro,
      inLanguage: "en",
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      author: { "@type": "Organization", name: "Vivida", url: SITE },
      publisher: { "@type": "Organization", name: "Vivida", url: SITE },
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
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE },
        {
          "@type": "ListItem",
          position: 2,
          name: "Chinese zodiac",
          item: `${SITE}/chinuri-horoskopi`,
        },
        { "@type": "ListItem", position: 3, name: animal.nameEn, item: url },
      ],
    },
  ];

  return (
    <main lang="en" className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <PageBackground />
      <Starfield count={120} shooting={3} />
      <SmartHeader locale="en" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <section className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-12">
        <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/chinuri-horoskopi">Chinese zodiac</Link>
          <span>/</span>
          <span className="text-foreground/80">{animal.nameEn}</span>
        </nav>

        <article className="relative overflow-hidden rounded-3xl border border-border bg-card/65 p-6 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-10">
          <div className="relative flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <div className="grid size-20 shrink-0 place-items-center rounded-3xl bg-[var(--vivida-violet)]/12 text-6xl ring-1 ring-[var(--vivida-violet)]/30">
              {animal.emoji}
            </div>
            <div>
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Chinese zodiac · {animal.elementEn} · {animal.polarityEn}
              </div>
              <h1 className="mt-1 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
                Year of the {animal.nameEn}
              </h1>
              <p className="mt-3 max-w-xl text-pretty text-base text-foreground/85 sm:text-lg">
                {content.headline}
              </p>
            </div>
          </div>
        </article>

        <section className="mt-8">
          <h2 className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {animal.nameEn} birth years
          </h2>
          <div className="flex flex-wrap gap-2">
            {years.map((year) => (
              <span key={year} className="rounded-full border border-border bg-card/55 px-3 py-1 text-sm tabular-nums">
                {year}
              </span>
            ))}
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            Born in January or early February? Confirm the Chinese New Year date,
            because you may belong to the previous animal year.
          </p>
        </section>

        <Prose className="mt-8" body={content.intro} />
        <TextSection title={`${animal.nameEn} personality`} body={content.personality} />

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <Traits title="Natural strengths" items={content.strengths} color="var(--vivida-cyan)" />
          <Traits title="Growth challenges" items={content.challenges} color="var(--vivida-pink)" />
        </div>

        <TextSection title="Love and relationships" body={content.love} />
        <TextSection title="Career and work style" body={content.career} />

        <section className="mt-12">
          <h2 className="mb-4 text-2xl font-semibold tracking-tight sm:text-3xl">
            Compatibility
          </h2>
          <CompatibilityGroup label="Traditionally harmonious" slugs={content.compatible} color="var(--vivida-cyan)" />
          <div className="mt-5">
            <CompatibilityGroup label="Potentially challenging" slugs={content.challenging} color="var(--vivida-pink)" />
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            These pairings describe broad traditional patterns. Communication,
            values, timing, and individual character matter more than animal signs alone.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="mb-5 text-2xl font-semibold tracking-tight sm:text-3xl">
            Frequently asked questions
          </h2>
          <div className="space-y-3">
            {faq.map((item) => (
              <details key={item.q} className="rounded-2xl border border-border bg-card/55 p-5">
                <summary className="cursor-pointer font-medium">{item.q}</summary>
                <p className="mt-3 text-sm leading-relaxed text-foreground/85 sm:text-base">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <div className="mt-14 rounded-2xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/12 via-card/60 to-[var(--vivida-cyan)]/12 p-7 text-center sm:p-10">
          <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            Explore your Western birth chart
          </h2>
          <p className="mx-auto mt-3 max-w-md text-pretty text-base text-muted-foreground">
            Your Chinese sign follows the lunar year. A natal chart maps the sky
            for your exact birth time and place.
          </p>
          <Button asChild variant="mystic" size="lg" className="mt-6">
            <Link href="/natal-chart">Explore my natal chart</Link>
          </Button>
        </div>

        <section className="mt-14">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Other animal signs
          </h2>
          <div className="flex flex-wrap gap-2">
            {CHINESE_ANIMALS.filter((other) => other.slug !== animal.slug).map((other) => (
              <Link key={other.slug} href={`/chinuri-horoskopi/${other.slug}`} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/55 px-3 py-1.5 text-sm">
                <span aria-hidden>{other.emoji}</span>
                {other.nameEn}
              </Link>
            ))}
          </div>
        </section>
      </section>

      <SiteFooter locale="en" />
    </main>
  );
}

function PageBackground() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_220/0.45),transparent_70%),radial-gradient(40%_30%_at_15%_70%,oklch(0.34_0.16_350/0.4),transparent_70%)]"
    />
  );
}

function Prose({ body, className }: { body: string; className?: string }) {
  return <p className={`max-w-3xl text-pretty text-base leading-relaxed text-foreground/90 sm:text-lg ${className ?? ""}`}>{body}</p>;
}

function TextSection({ title, body }: { title: string; body: string }) {
  return (
    <section className="mt-12 max-w-3xl">
      <h2 className="mb-3 text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
      <Prose body={body} />
    </section>
  );
}

function Traits({ title, items, color }: { title: string; items: string[]; color: string }) {
  return (
    <article className="rounded-2xl border border-border bg-card/55 p-5 ring-1 ring-foreground/5">
      <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">{title}</h3>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm text-foreground/85">
            <span aria-hidden style={{ color }}>◆</span>
            {item}
          </li>
        ))}
      </ul>
    </article>
  );
}

function CompatibilityGroup({ label, slugs, color }: { label: string; slugs: string[]; color: string }) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">{label}</h3>
      <div className="grid gap-3 sm:grid-cols-3">
        {slugs.map((slug) => {
          const animal = chineseAnimalBySlug(slug);
          if (!animal) return null;
          return (
            <Link key={slug} href={`/chinuri-horoskopi/${slug}`} className="flex items-center gap-3 rounded-2xl border border-border bg-card/55 p-4">
              <span className="text-2xl" aria-hidden>{animal.emoji}</span>
              <span className="font-semibold" style={{ color }}>{animal.nameEn}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
