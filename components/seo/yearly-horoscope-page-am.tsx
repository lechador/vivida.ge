import { ArmenianLink as Link } from "@/components/i18n/international-link";
import { Calendar, Sparkles } from "lucide-react";

import { Starfield } from "@/components/landing/starfield";
import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { Button } from "@/components/ui/button";
import {
  ALL_SLUGS,
  ZODIAC_DATES,
  signMetaBySlug,
  type ZodiacSlug,
} from "@/lib/seo/zodiac-dates";
import { SIGNS_CONTENT } from "@/lib/seo/zodiac-content";
import { armenianSiteHref } from "@/lib/seo/locales";
import { signColor } from "@/lib/zodiac";
import { yearlyHoroscopeArmenian } from "@/lib/yearly-horoscope-am";

export function YearlyHoroscopePageAm({
  sign,
  year,
}: {
  sign: ZodiacSlug;
  year: number;
}) {
  const content = yearlyHoroscopeArmenian(sign, year);
  if (!content) return null;
  const meta = signMetaBySlug(sign)!;
  const name = meta.labelAm || meta.labelKa;
  const accent = signColor(meta);
  const path = `/zodiac/${sign}/${year}`;
  const url = armenianSiteHref(path, false);
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: content.title,
      description: content.description,
      inLanguage: "hy-AM",
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      author: { "@type": "Organization", name: "Vivida" },
      publisher: { "@type": "Organization", name: "Vivida" },
      datePublished: `${year}-01-01`,
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
          <Link href={`/am/zodiac/${sign}`}>{name}</Link>
          <span>/</span>
          <span className="text-foreground/80">{year}</span>
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
              className="grid size-24 shrink-0 place-items-center rounded-3xl text-6xl"
              style={{
                color: accent,
                background: `color-mix(in oklch, ${accent} 18%, transparent)`,
              }}
            >
              {SIGNS_CONTENT[sign].symbol}
            </div>
            <div>
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Տարեկան հորոսկոպ · {year} · {ZODIAC_DATES[sign].rangeAm}
              </div>
              <h1 className="mt-1 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
                {name}՝ {year} թվականի հորոսկոպ
              </h1>
              <p className="mt-3 max-w-xl text-pretty text-base text-foreground/85 sm:text-lg">
                {content.tagline}
              </p>
            </div>
          </div>
        </article>

        <section className="mt-12 max-w-3xl space-y-4 text-pretty text-base leading-relaxed text-foreground/90 sm:text-lg">
          {content.overview.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </section>

        <section className="mt-10 grid gap-4 sm:grid-cols-2">
          <MonthCard
            title="Բարենպաստ ամիսներ"
            months={content.supportiveMonths}
            accent={accent}
          />
          <MonthCard
            title="Վերանայման ամիսներ"
            months={content.reflectiveMonths}
            accent="var(--muted-foreground)"
          />
        </section>

        {content.sections.map((section) => (
          <section key={section.title} className="mt-12 max-w-3xl">
            <h2 className="mb-3 text-2xl font-semibold tracking-tight sm:text-3xl">
              {section.title}
            </h2>
            <div className="space-y-4 text-pretty text-base leading-relaxed text-foreground/90">
              {section.body.split("\n\n").map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}

        {content.keyDates.length > 0 && (
          <section className="mt-12 max-w-3xl rounded-3xl border border-border bg-card/55 p-6 ring-1 ring-foreground/5 sm:p-8">
            <h2 className="mb-4 text-xl font-semibold tracking-tight sm:text-2xl">
              {year} թվականի կարևոր աստղագիտական ամսաթվերը
            </h2>
            <div className="space-y-3">
              {content.keyDates.map((item) => (
                <div
                  key={item.date}
                  className="rounded-xl border border-border/70 bg-background/40 p-3.5 sm:p-4"
                >
                  <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--vivida-cyan)]">
                    <Calendar className="size-3.5" />
                    {item.date}
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-foreground/85">
                    {item.note}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mt-14 max-w-3xl rounded-2xl border border-border bg-card/55 p-6 ring-1 ring-foreground/5 sm:p-7">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Տարվա խորհուրդը
          </div>
          <p className="mt-3 text-pretty text-base leading-relaxed text-foreground/90 sm:text-lg">
            {content.advice}
          </p>
        </section>

        <section className="mt-12 max-w-3xl">
          <h2 className="mb-5 text-2xl font-semibold tracking-tight sm:text-3xl">
            Հաճախ տրվող հարցեր
          </h2>
          <div className="space-y-3">
            {content.faq.map((item) => (
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

        <div className="mt-14 rounded-2xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/12 via-card/60 to-[var(--vivida-cyan)]/12 p-7 text-center ring-1 ring-foreground/5 sm:p-10">
          <Sparkles className="mx-auto mb-3 size-7 text-[var(--vivida-violet)]" />
          <h2 className="text-2xl font-semibold sm:text-3xl">
            Անհատական հորոսկոպը չի սահմանափակվում Արեգակի նշանով
          </h2>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            Ճշգրիտ կանխատեսումը հաշվի է առնում ձեր նատալ քարտեզը՝ ասցենդենտը,
            տները, մոլորակներն ու ասպեկտները։
          </p>
          <Button asChild variant="mystic" size="lg" className="mt-6">
            <Link href="/am/natal-chart">Հաշվարկել նատալ քարտեզը</Link>
          </Button>
        </div>

        <section className="mt-14">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {year} թվականի մյուս հորոսկոպները
          </h2>
          <div className="flex flex-wrap gap-2">
            {ALL_SLUGS.filter((item) => item !== sign).map((item) => {
              const other = signMetaBySlug(item)!;
              return (
                <Link
                  key={item}
                  href={`/am/zodiac/${item}/${year}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/55 px-3 py-1.5 text-sm hover:bg-card/80"
                >
                  <span>{SIGNS_CONTENT[item].symbol}</span>
                  {other.labelAm || other.labelKa}
                </Link>
              );
            })}
          </div>
        </section>
      </section>
      <SiteFooter locale="am" />
    </main>
  );
}

function MonthCard({
  title,
  months,
  accent,
}: {
  title: string;
  months: string[];
  accent: string;
}) {
  return (
    <article className="rounded-2xl border border-border bg-card/55 p-5 ring-1 ring-foreground/5">
      <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {title}
      </div>
      <ul className="mt-3 flex flex-wrap gap-2">
        {months.map((month) => (
          <li
            key={month}
            className="rounded-full border border-border bg-card/60 px-3 py-1 text-sm"
            style={{ color: accent }}
          >
            {month}
          </li>
        ))}
      </ul>
    </article>
  );
}
