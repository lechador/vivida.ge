import { ArmenianLink as Link } from "@/components/i18n/international-link";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ReportPromo } from "@/components/report/report-promo";
import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import { SIGNS_CONTENT } from "@/lib/seo/zodiac-content";
import { signMetaBySlug, type ZodiacSlug } from "@/lib/seo/zodiac-dates";
import { signColor } from "@/lib/zodiac";
import { zodiacPairArmenian } from "@/lib/zodiac-pair-am";
import { ARMENIAN_SITE_URL } from "@/lib/seo/locales";

const RATING_COLOR: Record<string, string> = {
  Ուժեղ: "oklch(0.78 0.18 305)",
  Ներդաշնակ: "oklch(0.78 0.16 200)",
  Զարգացնող: "oklch(0.74 0.18 330)",
  Դժվար: "oklch(0.72 0.18 45)",
};

export function ZodiacPairPageAm({ a, b }: { a: ZodiacSlug; b: ZodiacSlug }) {
  const content = zodiacPairArmenian(a, b);
  const aMeta = signMetaBySlug(a)!;
  const bMeta = signMetaBySlug(b)!;
  const aName = aMeta.labelAm || aMeta.labelKa;
  const bName = bMeta.labelAm || bMeta.labelKa;
  const aColor = signColor(aMeta);
  const bColor = signColor(bMeta);
  const ratingColor = RATING_COLOR[content.rating] || "var(--vivida-violet)";
  const url = `${ARMENIAN_SITE_URL}/zodiac/tavsebadoba/${a}-${b}`;

  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: content.title,
      description: content.description,
      inLanguage: "hy-AM",
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      author: { "@type": "Organization", name: "Vivida" },
      about: [{ "@type": "Thing", name: aName }, { "@type": "Thing", name: bName }],
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
    <main lang="hy" className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_220/0.45),transparent_70%)]"
      />
      <Starfield count={130} shooting={3} />
      <SmartHeader locale="am" georgianPath={`/zodiac/tavsebadoba/${a}-${b}`} />
      {ld.map((item, index) => (
        <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }} />
      ))}
      <section className="relative z-10 mx-auto w-full max-w-4xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-12">
        <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/am/zodiac" className="hover:text-foreground">Կենդանակերպ</Link>
          <span>/</span>
          <Link href="/am/compatibility" className="hover:text-foreground">Համատեղելիություն</Link>
          <span>/</span>
          <span className="text-foreground/80">{aName} × {bName}</span>
        </nav>
        <article
          className="relative overflow-hidden rounded-3xl border p-6 ring-1 ring-foreground/5 sm:p-10"
          style={{
            borderColor: `color-mix(in oklch, ${ratingColor} 35%, transparent)`,
            background: `linear-gradient(135deg, color-mix(in oklch, ${aColor} 14%, transparent), color-mix(in oklch, ${bColor} 14%, transparent))`,
          }}
        >
          <div
            aria-hidden
            className="absolute -right-20 -top-20 size-72 rounded-full opacity-30 blur-3xl"
            style={{ background: `conic-gradient(from 0deg, ${aColor}, ${bColor}, ${aColor})` }}
          />
          <div className="relative">
            <div className="flex items-center gap-4 sm:gap-6">
              <SignIcon sign={a} color={aColor} label={aName} />
              <span className="text-2xl text-muted-foreground/60">×</span>
              <SignIcon sign={b} color={bColor} label={bName} />
            </div>
            <div className="mt-4 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Համատեղելիության ուղեցույց
            </div>
            <h1 className="mt-1 text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
              {aName} <span className="text-muted-foreground/70">×</span> {bName}
            </h1>
            <div
              className="mt-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm"
              style={{ borderColor: `color-mix(in oklch, ${ratingColor} 40%, transparent)`, color: ratingColor }}
            >
              <span className="font-semibold">{content.rating}</span>
              <span className="text-foreground/70">համատեղելիություն</span>
            </div>
            <p className="mt-4 max-w-xl text-pretty text-base text-foreground/85 sm:text-lg">
              {content.tagline}
            </p>
          </div>
        </article>
        <TextSection title="Ընդհանուր համատեղելիություն" body={content.overall} />
        <TextSection title="Սեր և մտերմություն" body={content.love} />
        <section className="mt-12 grid gap-6 sm:grid-cols-2">
          <TextCard title="Ընկերություն" body={content.friendship} />
          <TextCard title="Հաղորդակցություն" body={content.communication} />
        </section>
        <section className="mt-12 grid gap-6 sm:grid-cols-2">
          <ListCard title="Ուժեղ կողմեր" items={content.strengths} color={ratingColor} />
          <ListCard title="Ուշադրության արժանի կողմեր" items={content.challenges} color="var(--muted-foreground)" />
        </section>
        <TextSection title="Եզրակացություն" body={content.verdict} />
        <section className="mt-12 max-w-3xl">
          <h2 className="mb-5 text-2xl font-semibold tracking-tight sm:text-3xl">Հաճախ տրվող հարցեր</h2>
          <div className="space-y-3">
            {content.faq.map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl border border-border bg-card/55 p-4 ring-1 ring-foreground/5 open:bg-card/80 sm:p-5"
              >
                <summary className="flex cursor-pointer list-none justify-between gap-4 font-medium">
                  <span>{item.q}</span>
                  <span aria-hidden className="text-muted-foreground transition-transform group-open:rotate-45">✦</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-foreground/85 sm:text-base">{item.a}</p>
              </details>
            ))}
          </div>
        </section>
        <section className="mt-14 grid gap-3 sm:grid-cols-2">
          <SignLink sign={a} color={aColor} name={aName} />
          <SignLink sign={b} color={bColor} name={bName} />
        </section>
        <ReportPromo className="mt-16" />
        <div className="mt-14 rounded-2xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/12 via-card/60 to-[var(--vivida-cyan)]/12 p-7 text-center ring-1 ring-foreground/5 sm:p-10">
          <Sparkles className="mx-auto mb-3 size-7 text-[var(--vivida-violet)]" />
          <h2 className="text-2xl font-semibold sm:text-3xl">Արևի նշանները միայն առաջին շերտն են</h2>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            Համեմատեք երկու լիարժեք նատալ քարտեզներ՝ Լուսնի, Վեներայի, Մարսի և միջքարտեզային բոլոր ասպեկտները պարզելու համար:
          </p>
          <Button asChild variant="mystic" size="lg" className="mt-6">
            <Link href="/am/compatibility">Ստեղծել սինաստրիա քարտեզ</Link>
          </Button>
        </div>
      </section>
      <SiteFooter locale="am" />
    </main>
  );
}

function SignIcon({ sign, color, label }: { sign: ZodiacSlug; color: string; label: string }) {
  const meta = signMetaBySlug(sign);
  return (
    <Link
      href={`/am/zodiac/${sign}`}
      title={label}
      className="grid size-16 place-items-center rounded-2xl text-3xl sm:size-20 sm:text-4xl"
      style={{ color, background: `color-mix(in oklch, ${color} 18%, transparent)` }}
    >
      {meta?.symbol || SIGNS_CONTENT[sign]?.symbol || "✦"}
    </Link>
  );
}

function SignLink({ sign, color, name }: { sign: ZodiacSlug; color: string; name: string }) {
  const meta = signMetaBySlug(sign);
  return (
    <Link
      href={`/am/zodiac/${sign}`}
      className="flex items-center gap-3 rounded-2xl border border-border bg-card/55 p-4 hover:bg-card/80"
    >
      <span
        className="grid size-10 place-items-center rounded-xl text-xl"
        style={{ color, background: `color-mix(in oklch, ${color} 18%, transparent)` }}
      >
        {meta?.symbol || SIGNS_CONTENT[sign]?.symbol || "✦"}
      </span>
      <div>
        <div className="font-medium">{name}</div>
        <div className="text-xs text-muted-foreground">Ամբողջական ուղեցույց →</div>
      </div>
    </Link>
  );
}

function TextSection({ title, body }: { title: string; body: string }) {
  return (
    <section className="mt-12 max-w-3xl">
      <h2 className="mb-3 text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
      <p className="text-pretty text-base leading-relaxed text-foreground/90">{body}</p>
    </section>
  );
}

function TextCard({ title, body }: { title: string; body: string }) {
  return (
    <article className="rounded-2xl border border-border bg-card/55 p-5 ring-1 ring-foreground/5">
      <h2 className="mb-3 text-lg font-semibold">{title}</h2>
      <p className="text-sm leading-relaxed text-foreground/90">{body}</p>
    </article>
  );
}

function ListCard({ title, items, color }: { title: string; items: string[]; color: string }) {
  return (
    <article className="rounded-2xl border border-border bg-card/55 p-5 ring-1 ring-foreground/5">
      <h2 className="mb-3 text-lg font-semibold">{title}</h2>
      <ul className="space-y-2 text-sm">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span style={{ color }}>✦</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
