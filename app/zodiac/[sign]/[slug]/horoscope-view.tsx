import Link from "next/link";
import { Sparkles, Calendar } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import { ensureSignHoroscope } from "@/actions/sign-horoscope";
import { articleLd, breadcrumbLd, serializeLd } from "@/lib/seo/jsonld";
import {
  ALL_HOROSCOPE_VIEWS,
  VIEW_PATH,
  anchorForView,
  periodForView,
  signHoroscopePeriodLabel,
  type HoroscopeView as HoroscopeViewKind,
} from "@/lib/sign-horoscope";
import { SIGNS_CONTENT } from "@/lib/seo/zodiac-content";
import {
  ALL_SLUGS,
  ZODIAC_DATES,
  signMetaBySlug,
  type ZodiacSlug,
} from "@/lib/seo/zodiac-dates";
import { signColor } from "@/lib/zodiac";

const SITE_URL = "https://www.vivida.ge";

const VIEW_LABEL_KA: Record<HoroscopeViewKind, string> = {
  today: "დღევანდელი ჰოროსკოპი",
  tomorrow: "ხვალინდელი ჰოროსკოპი",
  week: "ამ კვირის ჰოროსკოპი",
  month: "ამ თვის ჰოროსკოპი",
};

/**
 * Public SEO page rendering the cached sign horoscope for a (sign,
 * period) pair. Lives in its own file so the parent route can stay a
 * slim dispatcher between yearly-content and horoscope rendering.
 *
 * Generation + caching happens inside `ensureSignHoroscope`; this view
 * just consumes the row. If the row is missing (cold start + no
 * OpenRouter key), we render an evergreen "ჯერ მზადდება" placeholder
 * so crawlers still see structured content.
 */
export async function HoroscopeView({
  sign,
  view,
}: {
  sign: ZodiacSlug;
  view: HoroscopeViewKind;
}) {
  const meta = signMetaBySlug(sign);
  const sc = SIGNS_CONTENT[sign];
  const dates = ZODIAC_DATES[sign];
  if (!meta || !sc) return null;

  const accent = signColor(meta);
  const now = new Date();
  const period = periodForView(view);
  const anchor = anchorForView(view, now);
  const periodLabel = signHoroscopePeriodLabel(anchor, period);
  const periodLabelKa = VIEW_LABEL_KA[view];
  const horoscope = await ensureSignHoroscope(sign, period, anchor);

  const url = `${SITE_URL}/zodiac/${sign}/${VIEW_PATH[view]}`;
  const pageTitle = `${sc.labelKa} — ${periodLabelKa}`;
  const description =
    horoscope?.summary ??
    `${sc.labelKa}-ის ${periodLabelKa} — ცის ფონი, კონკრეტული რჩევა და ნიშნისთვის გასაღები მომენტები. პერიოდი: ${periodLabel}.`;

  const ld = [
    articleLd({
      url,
      headline: horoscope?.headline ?? pageTitle,
      description,
      datePublished: now.toISOString(),
      dateModified: horoscope?.createdAt
        ? new Date(horoscope.createdAt).toISOString()
        : undefined,
      about: {
        "@type": "Thing",
        name: `${sc.labelKa} ${periodLabelKa}`,
        description: `${sc.labelKa} (${dates.rangeEn})`,
      },
    }),
    breadcrumbLd([
      { name: "ცის ნიშნები", url: `${SITE_URL}/zodiac` },
      { name: sc.labelKa, url: `${SITE_URL}/zodiac/${sign}` },
      { name: periodLabelKa, url },
    ]),
  ];

  const bodyParagraphs = (horoscope?.body ?? "").split(/\n\n+/).filter(Boolean);

  return (
    <main className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_220/0.45),transparent_70%),radial-gradient(40%_30%_at_15%_70%,oklch(0.34_0.16_350/0.4),transparent_70%)]"
      />
      <Starfield count={130} shooting={3} />
      <SmartHeader />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeLd(ld) }}
      />

      <section className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-12">
        <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/zodiac" className="hover:text-foreground">
            ცის ნიშნები
          </Link>
          <span>/</span>
          <Link href={`/zodiac/${sign}`} className="hover:text-foreground">
            {sc.labelKa}
          </Link>
          <span>/</span>
          <span className="text-foreground/80">{periodLabelKa}</span>
        </nav>

        <article className="relative overflow-hidden rounded-3xl border border-border bg-card/65 p-6 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-10">
          <div
            aria-hidden
            className="absolute -right-20 -top-20 size-72 rounded-full opacity-30 blur-3xl"
            style={{
              background: `radial-gradient(circle, ${accent} 0%, transparent 70%)`,
            }}
          />
          <div className="relative flex items-start gap-5 sm:gap-6">
            <div
              className="grid size-16 shrink-0 place-items-center rounded-2xl text-4xl sm:size-20 sm:text-5xl"
              style={{
                background: `color-mix(in oklch, ${accent} 18%, transparent)`,
                boxShadow: `inset 0 0 0 1px color-mix(in oklch, ${accent} 35%, transparent), 0 0 60px -12px ${accent}`,
                color: accent,
              }}
            >
              {sc.symbol}
            </div>
            <div className="min-w-0 flex-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                <Calendar className="size-3.5" />
                {periodLabel}
              </div>
              <h1 className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
                {sc.labelKa} — {periodLabelKa}
              </h1>
              {horoscope?.headline && (
                <p
                  className="mt-3 text-pretty text-base text-foreground/90 sm:text-lg"
                  style={{ color: accent }}
                >
                  {horoscope.headline}
                </p>
              )}
              {horoscope?.summary && (
                <p className="mt-2 text-pretty text-sm text-foreground/85 sm:text-base">
                  {horoscope.summary}
                </p>
              )}
            </div>
          </div>
        </article>

        {bodyParagraphs.length > 0 ? (
          <section className="mt-10 max-w-2xl space-y-4 text-pretty text-base leading-relaxed text-foreground/90 sm:text-lg">
            {bodyParagraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </section>
        ) : (
          <section className="mt-10 max-w-2xl rounded-2xl border border-dashed border-border/80 bg-card/40 p-8 text-center">
            <p className="text-sm text-muted-foreground">
              {periodLabelKa} მზადდება — სცადე ცოტა ხანში.
            </p>
          </section>
        )}

        {horoscope?.themes && horoscope.themes.length > 0 && (
          <section className="mt-8">
            <div className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              დღის თემები
            </div>
            <ul className="flex flex-wrap gap-2">
              {horoscope.themes.map((theme, i) => (
                <li
                  key={i}
                  className="inline-flex items-center rounded-full border px-3 py-1 text-sm"
                  style={{
                    borderColor: `color-mix(in oklch, ${accent} 35%, transparent)`,
                    background: `color-mix(in oklch, ${accent} 12%, transparent)`,
                    color: accent,
                  }}
                >
                  {theme}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Sibling views + sign hub */}
        <section className="mt-12">
          <div className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {sc.labelKa}-ის სხვა ჰოროსკოპები
          </div>
          <div className="flex flex-wrap gap-2">
            {ALL_HOROSCOPE_VIEWS.filter((v) => v !== view).map((v) => (
              <Link
                key={v}
                href={`/zodiac/${sign}/${VIEW_PATH[v]}`}
                className="inline-flex items-center rounded-full border border-border bg-card/55 px-3 py-1.5 text-sm transition-colors hover:bg-card/80"
              >
                {VIEW_LABEL_KA[v]}
              </Link>
            ))}
            <Link
              href={`/zodiac/${sign}`}
              className="inline-flex items-center rounded-full border border-border bg-card/55 px-3 py-1.5 text-sm transition-colors hover:bg-card/80"
            >
              {sc.labelKa} — სრული პროფილი
            </Link>
          </div>
        </section>

        {/* Other signs same view */}
        <section className="mt-10">
          <h2 className="mb-3 text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
            სხვა ნიშნების {periodLabelKa}
          </h2>
          <div className="flex flex-wrap gap-2">
            {ALL_SLUGS.filter((s) => s !== sign).map((s) => {
              const other = SIGNS_CONTENT[s];
              const otherMeta = signMetaBySlug(s);
              const otherAccent = otherMeta
                ? signColor(otherMeta)
                : "var(--vivida-violet)";
              return (
                <Link
                  key={s}
                  href={`/zodiac/${s}/${VIEW_PATH[view]}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/55 px-3 py-1.5 text-sm transition-colors hover:bg-card/80"
                >
                  <span style={{ color: otherAccent }}>{other.symbol}</span>
                  {other.labelKa}
                </Link>
              );
            })}
          </div>
        </section>

        {/* CTA */}
        <div className="mt-14 rounded-2xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/12 via-card/60 to-[var(--vivida-cyan)]/12 p-7 text-center ring-1 ring-foreground/5 backdrop-blur-xl sm:p-10">
          <Sparkles className="mx-auto mb-3 size-7 text-[var(--vivida-violet)]" />
          <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            შენი პერსონალური ჰოროსკოპი
          </h2>
          <p className="mx-auto mt-3 max-w-md text-pretty text-base text-muted-foreground">
            ეს ჰოროსკოპი მხოლოდ მზის ნიშანზე საუბრობს. შენი სრული რუკა იცის
            მთვარეც, ვენერაც და ცის 12 სახლი.
          </p>
          <Button asChild variant="mystic" size="lg" className="mt-6">
            <Link href="/signup">ჩემი სრული რუკა</Link>
          </Button>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
