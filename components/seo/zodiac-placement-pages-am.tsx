import { ArmenianLink as Link } from "@/components/i18n/international-link";
import { Moon, Sparkles, Sunrise } from "lucide-react";

import { Starfield } from "@/components/landing/starfield";
import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { Button } from "@/components/ui/button";
import {
  ALL_SLUGS,
  signMetaBySlug,
  type ZodiacSlug,
} from "@/lib/seo/zodiac-dates";
import { SIGNS_CONTENT } from "@/lib/seo/zodiac-content";
import { ARMENIAN_SITE_URL, armenianSiteHref } from "@/lib/seo/locales";
import { signColor } from "@/lib/zodiac";
import type { PlacementKind } from "@/lib/zodiac-placement-en";
import {
  placementArmenian,
  ZODIAC_PLACEMENTS_AM,
} from "@/lib/zodiac-placements-am";

const CONFIG = {
  moon: {
    path: "/zodiac/mtvare",
    eyebrow: "Լուսնի նշաններ",
    hubLabel: "Լուսնի նշաններ",
    choose: "Ընտրեք ձեր Լուսնի նշանը",
    cardName: (name: string) => `Լուսինը ${name} նշանում`,
    ctaTitle: "Պարզեք ձեր ճշգրիտ Լուսնի նշանը",
    ctaBody:
      "Հաշվարկեք նատալ քարտեզը՝ միասին տեսնելու Լուսինը, ասցենդենտը, մոլորակները, տներն ու ասպեկտները։",
    cta: "Հաշվարկել նատալ քարտեզը",
  },
  rising: {
    path: "/zodiac/amomavali",
    eyebrow: "Ասցենդենտներ",
    hubLabel: "Ասցենդենտներ",
    choose: "Ընտրեք ձեր ասցենդենտի նշանը",
    cardName: (name: string) => `${name} ասցենդենտ`,
    ctaTitle: "Պարզեք ձեր ճշգրիտ ասցենդենտը",
    ctaBody:
      "Ճշգրիտ ասցենդենտը հաշվարկելու համար անհրաժեշտ են ծննդյան ամսաթիվը, ստույգ ժամը և վայրը։",
    cta: "Հաշվարկել ասցենդենտը",
  },
} as const;

function paragraphs(value: string) {
  return value
    .split("\n\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function ZodiacPlacementHubAm({ kind }: { kind: PlacementKind }) {
  const config = CONFIG[kind];
  const content =
    kind === "moon"
      ? ZODIAC_PLACEMENTS_AM.moonHub
      : ZODIAC_PLACEMENTS_AM.risingHub;
  const Icon = kind === "moon" ? Moon : Sunrise;
  const cards = [content.whatItMeans, content.vsSun, content.howToFind];
  const url = `${ARMENIAN_SITE_URL}${config.path}`;
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: content.pageTitle,
      description: content.metaDescription,
      url,
      inLanguage: "hy-AM",
      mainEntity: {
        "@type": "ItemList",
        itemListElement: ALL_SLUGS.map((slug, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: `${url}/${slug}`,
          name: config.cardName(signMetaBySlug(slug)!.labelAm),
        })),
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: content.faq.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
  ];

  return (
    <main
      lang="hy"
      className="relative isolate flex min-h-screen flex-col overflow-hidden"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_220/0.45),transparent_70%)]"
      />
      <Starfield count={130} shooting={3} />
      <SmartHeader locale="am" georgianPath={config.path} />
      {structuredData.map((item, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}

      <section className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-12">
        <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/am/zodiac">Կենդանակերպի նշաններ</Link>
          <span>/</span>
          <span className="text-foreground/80">{config.hubLabel}</span>
        </nav>
        <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          <Icon className="size-3.5" />
          {config.eyebrow}
        </div>
        <h1 className="mb-4 text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
          {content.h1}
        </h1>
        <p className="max-w-2xl text-pretty text-lg text-muted-foreground">
          {content.tagline}
        </p>
        <div className="mt-12 max-w-3xl space-y-4 text-pretty text-base leading-relaxed text-foreground/90 sm:text-lg">
          {paragraphs(content.intro).map((item) => (
            <p key={item}>{item}</p>
          ))}
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {cards.map((card) => (
            <article
              key={card.title}
              className="rounded-2xl border border-border bg-card/55 p-5 ring-1 ring-foreground/5 sm:p-6"
            >
              <h2 className="mb-3 text-lg font-semibold tracking-tight">
                {card.title}
              </h2>
              <div className="space-y-3 text-pretty text-sm leading-relaxed text-foreground/85">
                {paragraphs(card.body).map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
            </article>
          ))}
        </div>

        <section className="mt-14">
          <h2 className="mb-5 text-2xl font-semibold tracking-tight sm:text-3xl">
            {config.choose}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ALL_SLUGS.map((slug) => {
              const meta = signMetaBySlug(slug)!;
              const accent = signColor(meta);
              const copy = placementArmenian(kind, slug);
              return (
                <Link
                  key={slug}
                  href={`/am${config.path}/${slug}`}
                  className="group flex items-center gap-3 rounded-2xl border border-border bg-card/55 p-4 ring-1 ring-foreground/5 transition-all hover:-translate-y-0.5 hover:bg-card/80"
                >
                  <span
                    className="grid size-10 shrink-0 place-items-center rounded-xl text-xl"
                    style={{
                      background: `color-mix(in oklch, ${accent} 18%, transparent)`,
                      color: accent,
                    }}
                  >
                    {SIGNS_CONTENT[slug].symbol}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold tracking-tight">
                      {config.cardName(meta.labelAm)}
                    </div>
                    <div className="line-clamp-1 text-xs text-muted-foreground">
                      {copy.tagline}
                    </div>
                  </div>
                  <span aria-hidden className="text-muted-foreground">
                    →
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        <Faq items={content.faq} />
        <div className="mt-16 rounded-2xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/12 via-card/60 to-[var(--vivida-cyan)]/12 p-7 text-center ring-1 ring-foreground/5 sm:p-10">
          <Sparkles className="mx-auto mb-3 size-7 text-[var(--vivida-violet)]" />
          <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            {config.ctaTitle}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-pretty text-base text-muted-foreground">
            {config.ctaBody}
          </p>
          <Button asChild variant="mystic" size="lg" className="mt-6">
            <Link href="/am/natal-chart">{config.cta}</Link>
          </Button>
        </div>
      </section>
      <SiteFooter locale="am" />
    </main>
  );
}

export function ZodiacPlacementPageAm({
  kind,
  sign,
}: {
  kind: PlacementKind;
  sign: ZodiacSlug;
}) {
  const config = CONFIG[kind];
  const meta = signMetaBySlug(sign)!;
  const name = meta.labelAm;
  const copy = placementArmenian(kind, sign);
  const accent = signColor(meta);
  const Icon = kind === "moon" ? Moon : Sunrise;
  const pageName = config.cardName(name);
  const path = `${config.path}/${sign}`;
  const url = armenianSiteHref(path, false);
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: copy.title,
      description: copy.description,
      inLanguage: "hy-AM",
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      author: { "@type": "Organization", name: "Vivida" },
      publisher: { "@type": "Organization", name: "Vivida" },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: copy.faq.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
  ];

  return (
    <main
      lang="hy"
      className="relative isolate flex min-h-screen flex-col overflow-hidden"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_220/0.45),transparent_70%)]"
      />
      <Starfield count={130} shooting={3} />
      <SmartHeader locale="am" georgianPath={path} />
      {structuredData.map((item, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
      <section className="relative z-10 mx-auto w-full max-w-4xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-12">
        <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/am/zodiac">Կենդանակերպի նշաններ</Link>
          <span>/</span>
          <Link href={`/am${config.path}`}>{config.hubLabel}</Link>
          <span>/</span>
          <span className="text-foreground/80">{name}</span>
        </nav>
        <article className="relative overflow-hidden rounded-3xl border border-border bg-card/65 p-6 ring-1 ring-foreground/5 sm:p-10">
          <div
            aria-hidden
            className="absolute -right-20 -top-20 size-72 rounded-full opacity-30 blur-3xl"
            style={{
              background: `radial-gradient(circle, ${accent} 0%, transparent 70%)`,
            }}
          />
          <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            <div
              className="relative grid size-24 shrink-0 place-items-center rounded-3xl text-6xl"
              style={{
                background: `color-mix(in oklch, ${accent} 18%, transparent)`,
                color: accent,
              }}
            >
              {SIGNS_CONTENT[sign].symbol}
              <span
                aria-hidden
                className="absolute -bottom-2 -right-2 grid size-9 place-items-center rounded-full border border-border bg-card/95 text-foreground/70"
              >
                <Icon className="size-4" />
              </span>
            </div>
            <div>
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                {kind === "moon" ? "Լուսնի նշան" : "Ասցենդենտ"}
              </div>
              <h1 className="mt-1 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
                {pageName}
              </h1>
              <p className="mt-3 max-w-xl text-pretty text-base text-foreground/85 sm:text-lg">
                {copy.tagline}
              </p>
            </div>
          </div>
        </article>
        <div className="mt-12 max-w-3xl space-y-4 text-pretty text-base leading-relaxed text-foreground/90 sm:text-lg">
          {paragraphs(copy.intro).map((item) => (
            <p key={item}>{item}</p>
          ))}
        </div>
        {copy.sections.map((section) => (
          <section key={section.title} className="mt-12 max-w-3xl">
            <h2 className="mb-3 text-2xl font-semibold tracking-tight sm:text-3xl">
              {section.title}
            </h2>
            <div className="space-y-4 text-pretty text-base leading-relaxed text-foreground/90">
              {paragraphs(section.body).map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          </section>
        ))}
        {copy.famous.length > 0 && (
          <section className="mt-12 rounded-3xl border border-border bg-card/55 p-6 ring-1 ring-foreground/5 sm:p-8">
            <h2 className="mb-4 text-xl font-semibold tracking-tight sm:text-2xl">
              Հայտնի մարդիկ՝ {pageName}
            </h2>
            <div className="flex flex-wrap gap-2">
              {copy.famous.map((person) => (
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
        <Faq items={copy.faq} />

        <section className="mt-14 grid gap-4 sm:grid-cols-2">
          <Link
            href={`/am/zodiac/${sign}`}
            className="rounded-2xl border border-border bg-card/55 p-5 ring-1 ring-foreground/5 hover:bg-card/80"
          >
            <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Արեգակի նշան
            </div>
            <div className="mt-1 text-lg font-semibold">
              {name}՝ Արեգակի նշան
            </div>
            <p className="mt-1 text-sm text-foreground/80">
              Բացահայտեք ինքնությունը, շարժառիթները, սերը և աշխատանքային ոճը։
            </p>
          </Link>
          <Link
            href={`/am${kind === "moon" ? "/zodiac/amomavali" : "/zodiac/mtvare"}/${sign}`}
            className="rounded-2xl border border-border bg-card/55 p-5 ring-1 ring-foreground/5 hover:bg-card/80"
          >
            <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              {kind === "moon" ? "Ասցենդենտ" : "Լուսնի նշան"}
            </div>
            <div className="mt-1 text-lg font-semibold">
              {kind === "moon"
                ? `${name} ասցենդենտ`
                : `Լուսինը ${name} նշանում`}
            </div>
            <p className="mt-1 text-sm text-foreground/80">
              {kind === "moon"
                ? "Բացահայտեք առաջին տպավորությունն ու արտաքին ոճը։"
                : "Բացահայտեք էմոցիոնալ կարիքներն ու ներքին արձագանքները։"}
            </p>
          </Link>
        </section>

        <section className="mt-12">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {config.hubLabel}՝ մյուս նշանները
          </h2>
          <div className="flex flex-wrap gap-2">
            {ALL_SLUGS.filter((item) => item !== sign).map((item) => {
              const other = signMetaBySlug(item)!;
              return (
                <Link
                  key={item}
                  href={`/am${config.path}/${item}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/55 px-3 py-1.5 text-sm hover:bg-card/80"
                >
                  <span>{SIGNS_CONTENT[item].symbol}</span>
                  {config.cardName(other.labelAm)}
                </Link>
              );
            })}
          </div>
        </section>
        <div className="mt-14 rounded-2xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/12 via-card/60 to-[var(--vivida-cyan)]/12 p-7 text-center ring-1 ring-foreground/5 sm:p-10">
          <Sparkles className="mx-auto mb-3 size-7 text-[var(--vivida-violet)]" />
          <h2 className="text-2xl font-semibold sm:text-3xl">
            Հաստատեք ձեր {kind === "moon" ? "Լուսնի նշանը" : "ասցենդենտը"}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            Հաշվարկեք ամբողջական նատալ քարտեզը՝ ըստ ծննդյան ամսաթվի, ճշգրիտ ժամի
            և վայրի։
          </p>
          <Button asChild variant="mystic" size="lg" className="mt-6">
            <Link href="/am/natal-chart">Հաշվարկել նատալ քարտեզը</Link>
          </Button>
        </div>
      </section>
      <SiteFooter locale="am" />
    </main>
  );
}

function Faq({ items }: { items: Array<{ q: string; a: string }> }) {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="mb-5 text-2xl font-semibold tracking-tight sm:text-3xl">
        Հաճախ տրվող հարցեր
      </h2>
      <div className="space-y-3">
        {items.map((item) => (
          <details
            key={item.q}
            className="group rounded-2xl border border-border bg-card/55 p-4 ring-1 ring-foreground/5 open:bg-card/80 sm:p-5"
          >
            <summary className="flex cursor-pointer list-none justify-between gap-4 font-medium">
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
  );
}
