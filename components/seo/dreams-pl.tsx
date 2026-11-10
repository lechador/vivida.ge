import { PolishLink as Link } from "@/components/i18n/international-link";
import { ArrowRight, Sparkles } from "lucide-react";

import { Starfield } from "@/components/landing/starfield";
import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { DreamInterpreter } from "@/components/seo/dream-interpreter";
import {
  DREAM_BY_SLUG,
  DREAM_SYMBOLS,
  type DreamSymbol,
} from "@/lib/seo/dreams";
import {
  DREAMS_FAQ_PL,
  DREAMS_HUB_PL,
  DREAM_PL_BY_SLUG,
  DREAM_SYMBOLS_PL,
  type DreamSymbolPl,
} from "@/lib/seo/dreams-pl";
import { dreamPublicSlug } from "@/lib/seo/en-slugs";
import { jsonLdString } from "@/lib/seo/jsonld";

const SITE = "https://www.vividaastro.com";

export { DREAMS_HUB_PL };
export function DreamsHubPl({ authed = false }: { authed?: boolean } = {}) {
  const groups = [...DREAM_SYMBOLS_PL]
    .sort((a, b) => a.title.localeCompare(b.title, "pl"))
    .reduce<Array<{ letter: string; items: DreamSymbolPl[] }>>((all, item) => {
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
      headline: DREAMS_HUB_PL.title,
      description: DREAMS_HUB_PL.description,
      inLanguage: "pl",
      mainEntityOfPage: `${SITE}/pl/sennik`,
      publisher: { "@type": "Organization", name: "Vivida", url: SITE },
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Symbole i znaczenie snów",
      numberOfItems: DREAM_SYMBOLS_PL.length,
      itemListElement: DREAM_SYMBOLS_PL.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.title,
        url: `${SITE}/pl/sennik/${dreamPublicSlug(item.slug, "pl")}`,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: DREAMS_FAQ_PL.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
  ];

  return (
    <main
      lang="pl"
      className="relative isolate flex min-h-screen flex-col overflow-hidden"
    >
      <Background />
      <Starfield count={130} shooting={3} />
      <SmartHeader locale="pl" georgianPath="/sizmris-akhsna" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(structuredData) }}
      />

      <section className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-10">
        <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/">Strona główna</Link>
          <span>/</span>
          <span className="text-foreground/80">Sennik</span>
        </nav>

        <header className="mb-9 text-center">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Symbole senne
          </div>
          <h1 className="mt-1 text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Sennik online{" "}
            <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
              A–Z
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-base leading-relaxed text-foreground/80 sm:text-lg">
            Znajdź symbol, który zapamiętałeś ze snu i poznaj jego tradycyjne
            oraz psychologiczne znaczenie. Interpretacje snów to zachęta do
            autorefleksji, a nie gotowe przepowiednie czy diagnozy.
          </p>
        </header>

        <DreamInterpreter authed={authed} locale="pl" />

        <div className="space-y-7">
          {groups.map((group) => (
            <section key={group.letter}>
              <h2 className="mb-2.5 flex items-center gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-[var(--vivida-violet)]/35 bg-[var(--vivida-violet)]/12 text-lg font-semibold text-[var(--vivida-violet)]">
                  {group.letter}
                </span>
                <span className="h-px flex-1 bg-border/60" />
              </h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {group.items.map((item) => {
                  const base = DREAM_BY_SLUG[item.slug];
                  return (
                    <Link
                      key={item.slug}
                      href={`/sizmris-akhsna/${dreamPublicSlug(item.slug, "pl")}`}
                      className="group flex items-start gap-3 rounded-xl border border-border/60 bg-card/40 px-3.5 py-3 transition-colors hover:bg-card/75"
                    >
                      <span className="text-xl leading-none">
                        {base?.glyph}
                      </span>
                      <span className="min-w-0">
                        <span className="block font-medium text-foreground/90">
                          {item.title}
                        </span>
                        <span className="mt-0.5 block text-[12px] leading-snug text-muted-foreground">
                          {item.summary}
                        </span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <section className="mt-14">
          <h2 className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Najczęściej zadawane pytania o sny
          </h2>
          <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border/70 bg-card/40">
            {DREAMS_FAQ_PL.map((item) => (
              <details key={item.q} className="group p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-foreground">
                  {item.q}
                  <span className="text-muted-foreground transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        <div className="mt-14 rounded-2xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/12 via-card/60 to-[var(--vivida-cyan)]/12 p-7 text-center sm:p-10">
          <Sparkles className="mx-auto mb-3 size-7 text-[var(--vivida-violet)]" />
          <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            Sny pokazują jedną noc, kosmogram pokazuje cały wzorzec
          </h2>
          <p className="mx-auto mt-3 max-w-md text-pretty text-base text-muted-foreground">
            Odkryj, jak Księżyc, znaki zodiaku, domy i aspekty opisują Twój
            wewnętrzny świat emocjonalny.
          </p>
          <Link
            href="/nataluri-ruka"
            className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-[linear-gradient(135deg,var(--vivida-violet),var(--vivida-pink))] px-5 py-2.5 text-sm font-semibold text-white"
          >
            Poznaj swój horoskop urodzeniowy
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
      <SiteFooter locale="pl" />
    </main>
  );
}

export function DreamSymbolPagePl({
  base,
  content,
}: {
  base: DreamSymbol;
  content: DreamSymbolPl;
}) {
  const url = `${SITE}/pl/sennik/${dreamPublicSlug(base.slug, "pl")}`;
  const related = base.related
    .map((slug) => ({ base: DREAM_BY_SLUG[slug], pl: DREAM_PL_BY_SLUG[slug] }))
    .filter((item) => item.base && item.pl);
  const alsoSee = DREAM_SYMBOLS.filter(
    (item) =>
      item.slug !== base.slug &&
      !base.related.includes(item.slug) &&
      DREAM_PL_BY_SLUG[item.slug],
  ).slice(0, 12);

  const faq = content.variants.map((variant) => ({
    q: `Co oznacza, gdy ${variant.when} we śnie?`,
    a: variant.means,
  }));

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: `${content.title} – Znaczenie Snu w Senniku`,
      description: content.summary,
      inLanguage: "pl",
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
        {
          "@type": "ListItem",
          position: 1,
          name: "Strona główna",
          item: `${SITE}/pl`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Sennik",
          item: `${SITE}/pl/sennik`,
        },
        { "@type": "ListItem", position: 3, name: content.title, item: url },
      ],
    },
  ];

  return (
    <main
      lang="pl"
      className="relative isolate flex min-h-screen flex-col overflow-hidden"
    >
      <Background />
      <Starfield count={110} shooting={2} />
      <SmartHeader locale="pl" georgianPath={`/sizmris-akhsna/${base.slug}`} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(structuredData) }}
      />
      <section className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-10">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Link href="/">Strona główna</Link>
          <span>/</span>
          <Link href="/sizmris-akhsna">Sennik</Link>
          <span>/</span>
          <span className="text-foreground/80">{content.title}</span>
        </nav>
        <header className="mb-8">
          <div className="flex items-center gap-4">
            <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-[var(--vivida-violet)]/15 text-3xl ring-1 ring-[var(--vivida-violet)]/35">
              {base.glyph}
            </span>
            <div>
              <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
                {content.title} – znaczenie snu
              </h1>
              <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Sennik i interpretacja AI
              </p>
            </div>
          </div>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-foreground/90">
            {content.summary}
          </p>
        </header>

        <section className="rounded-2xl border border-border bg-card/50 p-5 ring-1 ring-foreground/5 sm:p-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--vivida-violet)]">
            Ogólne znaczenie
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed text-foreground/90">
            {content.meaning}
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold tracking-tight">
            Popularne scenariusze snu: {content.title.toLowerCase()}
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Wybierz wariant, który najlepiej odpowiada Twojemu snowi.
          </p>
          <div className="mt-4 space-y-3">
            {content.variants.map((variant) => (
              <article
                key={variant.when}
                className="rounded-2xl border border-border/70 bg-card/40 p-5"
              >
                <h3 className="font-semibold text-foreground/95">
                  Gdy {variant.when}
                </h3>
                <p className="mt-1.5 text-[15px] leading-relaxed text-foreground/85">
                  {variant.means}
                </p>
              </article>
            ))}
          </div>
        </section>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <section className="rounded-2xl border border-[var(--vivida-cyan)]/30 bg-[var(--vivida-cyan)]/8 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--vivida-cyan)]">
              Pozytywny znak
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-foreground/90">
              {content.positive}
            </p>
          </section>
          <section className="rounded-2xl border border-[var(--vivida-pink)]/30 bg-[var(--vivida-pink)]/8 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--vivida-pink)]">
              Na co zwrócić uwagę
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-foreground/90">
              {content.caution}
            </p>
          </section>
        </div>

        {related.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Podobne symbole senne
            </h2>
            <div className="grid gap-2 sm:grid-cols-3">
              {related.map((item) => (
                <Link
                  key={item.base.slug}
                  href={`/sizmris-akhsna/${dreamPublicSlug(item.base.slug, "pl")}`}
                  className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-card/45 px-3.5 py-2.5 text-sm"
                >
                  <span className="text-lg">{item.base.glyph}</span>
                  <span className="font-medium">{item.pl.title}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="mt-8">
          <h2 className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Inne symbole ze sennika
          </h2>
          <div className="flex flex-wrap gap-2">
            {alsoSee.map((item) => (
              <Link
                key={item.slug}
                href={`/sizmris-akhsna/${dreamPublicSlug(item.slug, "pl")}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/50 px-3 py-1.5 text-xs"
              >
                <span>{item.glyph}</span>
                {DREAM_PL_BY_SLUG[item.slug]?.title}
              </Link>
            ))}
            <Link
              href="/sizmris-akhsna"
              className="inline-flex items-center gap-1 rounded-full border border-[var(--vivida-violet)]/40 bg-[var(--vivida-violet)]/10 px-3 py-1.5 text-xs font-medium text-[var(--vivida-violet)]"
            >
              Wszystkie symbole
              <ArrowRight className="size-3" />
            </Link>
          </div>
        </section>

        <div className="mt-12 rounded-2xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/12 via-card/60 to-[var(--vivida-cyan)]/12 p-7 text-center sm:p-9">
          <Sparkles className="mx-auto mb-3 size-6 text-[var(--vivida-violet)]" />
          <h2 className="text-balance text-xl font-semibold tracking-tight sm:text-2xl">
            Szukasz głębszej odpowiedzi na nurtujące pytanie?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-pretty text-sm text-muted-foreground sm:text-base">
            Skorzystaj z kart Tarota jako symbolicznego narzędzia pomagającego
            spojrzeć na sytuację z nowej perspektywy.
          </p>
          <Link
            href="/taro"
            className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-[linear-gradient(135deg,var(--vivida-violet),var(--vivida-pink))] px-5 py-2.5 text-sm font-semibold text-white"
          >
            Rozłóż karty Tarota
            <ArrowRight className="size-4" />
          </Link>
        </div>
        <p className="mt-8 text-xs leading-relaxed text-muted-foreground">
          Interpretacja snów ma charakter symboliczny i nie stanowi diagnozy
          medycznej ani psychologicznej.
        </p>
      </section>
      <SiteFooter locale="pl" />
    </main>
  );
}

function Background() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.30_0.16_265/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.28_0.14_300/0.45),transparent_70%)]"
    />
  );
}
