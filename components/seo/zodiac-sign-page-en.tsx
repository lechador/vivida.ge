import Link from "next/link";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ReportPromo } from "@/components/report/report-promo";
import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import {
  ALL_SLUGS,
  ZODIAC_DATES,
  elementSlugForSign,
  pairSlug,
  signMetaBySlug,
  type ZodiacSlug,
} from "@/lib/seo/zodiac-dates";
import { SIGNS_CONTENT_EN } from "@/lib/seo/zodiac-content-en";
import { signColor } from "@/lib/zodiac";
import {
  COMPATIBILITY_EN,
  ELEMENT_EN,
  MODALITY_EN,
  RULER_EN,
  ZODIAC_SIGN_EN,
} from "@/lib/zodiac-sign-en";

const LEVEL_COLOR: Record<string, string> = {
  Strong: "oklch(0.78 0.18 305)",
  Harmonious: "oklch(0.78 0.16 200)",
  Challenging: "oklch(0.7 0.22 30)",
  ძლიერი: "oklch(0.78 0.18 305)",
  ჰარმონიული: "oklch(0.78 0.16 200)",
  გამომწვევი: "oklch(0.7 0.22 30)",
};

export function ZodiacSignPageEn({ sign }: { sign: ZodiacSlug }) {
  const meta = signMetaBySlug(sign)!;
  const c = SIGNS_CONTENT_EN[sign] || ZODIAC_SIGN_EN[sign];
  const signEn = SIGNS_CONTENT_EN[sign];
  const name = meta.labelEn;
  const accent = signColor(meta);
  const dates = ZODIAC_DATES[sign];
  const faq = signEn?.faq?.length ? signEn.faq : [
    {
      q: `What dates are ${name}?`,
      a: `${name} is conventionally associated with ${dates.rangeEn}. If you were born at the beginning or end of this range, calculate your birth chart because the exact solar ingress varies by year and time zone.`,
    },
    {
      q: `What element is ${name}?`,
      a: `${name} is a ${ELEMENT_EN[meta.element]} sign. Its element describes the basic style through which the sign processes experience and expresses energy.`,
    },
    { q: `What is ${name} like in love?`, a: signEn?.love || ZODIAC_SIGN_EN[sign].love },
    {
      q: `Is a Sun sign the whole personality?`,
      a: `No. ${name} describes the Sun's placement, while the Moon, rising sign, planets, houses, and aspects add essential layers to a complete natal chart.`,
    },
  ];

  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: `${name} Zodiac Sign: Dates, Traits, Love and Compatibility`,
      description: signEn?.tagline || c.tagline,
      inLanguage: "en",
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": `https://www.vividaastro.com/zodiac/${sign}`,
      },
      author: { "@type": "Organization", name: "Vivida" },
      about: {
        "@type": "Thing",
        name,
        description: `${name} (${dates.rangeEn}) — ${signEn?.tagline || c.tagline}`,
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

  const introParagraphs = (signEn?.intro || ZODIAC_SIGN_EN[sign].core)
    .split("\n\n")
    .map((p) => p.trim())
    .filter(Boolean);

  const personalityParagraphs = (signEn?.personality || "")
    .split("\n\n")
    .map((p) => p.trim())
    .filter(Boolean);

  const loveParagraphs = (signEn?.love || ZODIAC_SIGN_EN[sign].love)
    .split("\n\n")
    .map((p) => p.trim())
    .filter(Boolean);

  const careerParagraphs = (signEn?.career || ZODIAC_SIGN_EN[sign].career)
    .split("\n\n")
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <main
      lang="en"
      className="relative isolate flex min-h-screen flex-col overflow-hidden"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_220/0.45),transparent_70%)]"
      />
      <Starfield count={130} shooting={3} />
      <SmartHeader locale="en" georgianPath={`/zodiac/${sign}`} />
      {ld.map((item, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
      <section className="relative z-10 mx-auto w-full max-w-4xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-12">
        <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/zodiac" className="hover:text-foreground">
            Zodiac signs
          </Link>
          <span>/</span>
          <span className="text-foreground/80">{name}</span>
        </nav>

        <article className="relative overflow-hidden rounded-3xl border border-border bg-card/65 p-6 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-10">
          <div
            aria-hidden
            className="absolute -right-20 -top-20 size-72 rounded-full opacity-30 blur-3xl"
            style={{
              background: `radial-gradient(circle, ${accent} 0%, transparent 70%)`,
            }}
          />
          <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            <div
              className="grid size-24 shrink-0 place-items-center rounded-3xl text-6xl"
              style={{
                background: `color-mix(in oklch, ${accent} 18%, transparent)`,
                color: accent,
              }}
            >
              {signEn?.symbol || "✦"}
            </div>
            <div>
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                {dates.rangeEn}
              </div>
              <h1 className="mt-1 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
                {name}
              </h1>
              <p className="mt-3 max-w-xl text-pretty text-base text-foreground/85 sm:text-lg">
                {signEn?.tagline || c.tagline}
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <Link href={`/zodiac/elementebi/${elementSlugForSign(sign)}`}>
                  <Pill
                    label="Element"
                    value={ELEMENT_EN[meta.element]}
                    accent={accent}
                  />
                </Link>
                <Pill
                  label="Modality"
                  value={
                    MODALITY_EN[signEn?.modality || ""] ?? (signEn?.modality || "Cardinal")
                  }
                  accent={accent}
                />
                <Pill label="Ruler" value={RULER_EN[sign]} accent={accent} />
              </div>
            </div>
          </div>
        </article>

        {/* Intro */}
        <section className="mt-12 max-w-3xl space-y-4 text-pretty text-base leading-relaxed text-foreground/90 sm:text-lg">
          {introParagraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </section>

        {/* Deep Personality */}
        {personalityParagraphs.length > 0 && (
          <section className="mt-12 max-w-3xl">
            <h2 className="mb-4 text-2xl font-semibold tracking-tight sm:text-3xl">
              {name} Personality & Core Character
            </h2>
            <div className="space-y-4 text-pretty text-base leading-relaxed text-foreground/90 sm:text-lg">
              {personalityParagraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </section>
        )}

        {/* Strengths & Challenges */}
        <section className="mt-12 grid gap-6 sm:grid-cols-2">
          <ListCard
            title="Strengths"
            items={signEn?.strengths?.length ? signEn.strengths : ZODIAC_SIGN_EN[sign].strengths}
            accent={accent}
          />
          <ListCard
            title="Growth Areas & Challenges"
            items={signEn?.weaknesses?.length ? signEn.weaknesses : ZODIAC_SIGN_EN[sign].challenges}
            accent="var(--muted-foreground)"
          />
        </section>

        {/* Love */}
        <section className="mt-12 max-w-3xl">
          <h2 className="mb-4 text-2xl font-semibold tracking-tight sm:text-3xl">
            {name} in Love & Relationships
          </h2>
          <div className="space-y-4 text-pretty text-base leading-relaxed text-foreground/90 sm:text-lg">
            {loveParagraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </section>

        {/* Career */}
        <section className="mt-12 max-w-3xl">
          <h2 className="mb-4 text-2xl font-semibold tracking-tight sm:text-3xl">
            {name} in Career & Financial Path
          </h2>
          <div className="space-y-4 text-pretty text-base leading-relaxed text-foreground/90 sm:text-lg">
            {careerParagraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </section>

        {/* Compatibility Matrix with specific notes */}
        <section className="mt-12">
          <div className="mb-5 flex items-baseline justify-between gap-3">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Compatibility with other signs
            </h2>
            <Link
              href="/compatibility"
              className="shrink-0 text-xs text-muted-foreground hover:text-foreground"
            >
              All pairings →
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {(signEn?.compatibility?.length
              ? signEn.compatibility
              : COMPATIBILITY_EN[sign].map((otherSign) => ({
                  signEn: signMetaBySlug(otherSign)!.labelEn,
                  level: "Harmonious",
                  note: `Explore connection between ${name} and ${signMetaBySlug(otherSign)!.labelEn}.`,
                }))
            ).map((item) => {
              const matchedSlug = ALL_SLUGS.find(
                (s) =>
                  signMetaBySlug(s)!.labelEn.toLowerCase() ===
                  (item.signEn || "").toLowerCase()
              );
              const otherSlug = matchedSlug || sign;
              const otherMeta = signMetaBySlug(otherSlug);
              const otherLabel = item.signEn || otherMeta?.labelEn || otherSlug;
              const levelStr = String(item.level);
              const badgeColor = LEVEL_COLOR[levelStr] || "var(--vivida-cyan)";

              return (
                <Link
                  key={otherLabel}
                  href={`/zodiac/tavsebadoba/${pairSlug(sign, otherSlug)}`}
                  className="rounded-2xl border border-border bg-card/55 p-4 ring-1 ring-foreground/5 transition-all hover:bg-card/80"
                >
                  <div className="flex items-baseline justify-between">
                    <h3 className="font-semibold">{otherLabel}</h3>
                    <span
                      className="rounded-full border border-border px-2 py-0.5 text-[11px]"
                      style={{ color: badgeColor }}
                    >
                      {levelStr}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/85">
                    {item.note}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Famous Personalities */}
        {signEn?.famous && signEn.famous.length > 0 && (
          <section className="mt-12 rounded-3xl border border-border bg-card/55 p-6 ring-1 ring-foreground/5 sm:p-8">
            <h2 className="mb-4 text-xl font-semibold tracking-tight sm:text-2xl">
              Famous {name} Personalities
            </h2>
            <div className="flex flex-wrap gap-2">
              {signEn.famous.map((person) => (
                <span
                  key={person}
                  className="inline-flex items-center rounded-full border border-border/80 bg-background/50 px-3 py-1 text-xs text-foreground/90"
                >
                  ✦ {person}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* FAQ */}
        <section className="mt-12 max-w-3xl">
          <h2 className="mb-5 text-2xl font-semibold tracking-tight sm:text-3xl">
            Frequently asked questions
          </h2>
          <div className="space-y-3">
            {faq.map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl border border-border bg-card/55 p-4 ring-1 ring-foreground/5 open:bg-card/80 sm:p-5"
              >
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 font-medium">
                  <span>{item.q}</span>
                  <span
                    aria-hidden
                    className="text-muted-foreground transition-transform group-open:rotate-45"
                  >
                    ✦
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-foreground/85 sm:text-base">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* Moon & Rising links */}
        <section className="mt-14 grid gap-4 sm:grid-cols-2">
          <Link
            href={`/zodiac/mtvare/${sign}`}
            className="rounded-2xl border border-border bg-card/55 p-5 ring-1 ring-foreground/5 transition-all hover:bg-card/80"
          >
            <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Moon sign
            </div>
            <div className="mt-1 text-lg font-semibold">Moon in {name}</div>
            <p className="mt-1 text-sm text-foreground/80">
              Explore the emotional needs beneath the surface.
            </p>
          </Link>
          <Link
            href={`/zodiac/amomavali/${sign}`}
            className="rounded-2xl border border-border bg-card/55 p-5 ring-1 ring-foreground/5 transition-all hover:bg-card/80"
          >
            <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Rising sign
            </div>
            <div className="mt-1 text-lg font-semibold">{name} rising</div>
            <p className="mt-1 text-sm text-foreground/80">
              See how this sign shapes first impressions and outward style.
            </p>
          </Link>
        </section>

        {/* Other signs */}
        <section className="mt-14">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Other zodiac signs
          </h2>
          <div className="flex flex-wrap gap-2">
            {ALL_SLUGS.filter((slug) => slug !== sign).map((slug) => {
              const other = signMetaBySlug(slug)!;
              const otherEn = SIGNS_CONTENT_EN[slug];
              return (
                <Link
                  key={slug}
                  href={`/zodiac/${slug}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/55 px-3 py-1.5 text-sm hover:bg-card/80"
                >
                  <span>{otherEn?.symbol || "✦"}</span>
                  {other.labelEn}
                </Link>
              );
            })}
          </div>
        </section>

        <ReportPromo className="mt-16" />
        <div className="mt-14 rounded-2xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/12 via-card/60 to-[var(--vivida-cyan)]/12 p-7 text-center ring-1 ring-foreground/5 sm:p-10">
          <Sparkles className="mx-auto mb-3 size-7 text-[var(--vivida-violet)]" />
          <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            Your Sun sign is only the beginning
          </h2>
          <p className="mx-auto mt-3 max-w-md text-pretty text-base text-muted-foreground">
            Your complete chart includes the Moon, rising sign, every planet,
            and all 12 houses.
          </p>
          <Button asChild variant="mystic" size="lg" className="mt-6">
            <Link href="/natal-chart">Calculate my complete chart</Link>
          </Button>
        </div>
      </section>
      <SiteFooter locale="en" />
    </main>
  );
}

function Pill({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1"
      style={{
        borderColor: `color-mix(in oklch, ${accent} 35%, transparent)`,
        background: `color-mix(in oklch, ${accent} 10%, transparent)`,
      }}
    >
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </span>
  );
}

function ListCard({
  title,
  items,
  accent,
}: {
  title: string;
  items: string[];
  accent: string;
}) {
  return (
    <article className="rounded-2xl border border-border bg-card/55 p-5 ring-1 ring-foreground/5">
      <h2 className="mb-3 text-lg font-semibold">{title}</h2>
      <ul className="space-y-2 text-sm">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span style={{ color: accent }}>✦</span>
            <span className="text-foreground/90">{item}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
