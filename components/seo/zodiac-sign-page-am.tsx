import { ArmenianLink as Link } from "@/components/i18n/international-link";
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
import { signColor } from "@/lib/zodiac";
import {
  COMPATIBILITY_AM,
  ELEMENT_AM,
  MODALITY_AM,
  RULER_AM,
  ZODIAC_SIGN_AM,
} from "@/lib/zodiac-sign-am";

const LEVEL_COLOR: Record<string, string> = {
  Ուժեղ: "oklch(0.78 0.18 305)",
  Ներդաշնակ: "oklch(0.78 0.16 200)",
  Դժվար: "oklch(0.7 0.22 30)",
  Strong: "oklch(0.78 0.18 305)",
  Harmonious: "oklch(0.78 0.16 200)",
  Challenging: "oklch(0.7 0.22 30)",
};

export function ZodiacSignPageAm({ sign }: { sign: ZodiacSlug }) {
  const meta = signMetaBySlug(sign)!;
  const c = ZODIAC_SIGN_AM[sign];
  const name = meta.labelAm || meta.labelKa;
  const accent = signColor(meta);
  const dates = ZODIAC_DATES[sign];

  const faq = [
    {
      q: `Ո՞ր ամսաթվերն են պատկանում ${name}ին:`,
      a: `${name}ը ավանդաբար կապված է ${dates.rangeAm} ժամանակահատվածի հետ: Եթե ծնվել ես սահմանագծին, հաշվարկիր քո ծննդյան քարտեզը՝ Արևի ճշգրիտ դիրքը պարզելու համար:`,
    },
    {
      q: `Ի՞նչ տարերքի է պատկանում ${name}ը:`,
      a: `${name}ը ${ELEMENT_AM[meta.element]} տարերքի նշան է: Տարերքը բնութագրում է էներգիայի դրսևորման և աշխարհընկալման հիմնական ոճը:`,
    },
    {
      q: `Ինչպիսի՞ն է ${name}ը սիրո և հարաբերությունների մեջ:`,
      a: c.love,
    },
    {
      q: `Արդյո՞ք կենդանակերպի նշանն արտացոլում է ողջ անհատականությունը:`,
      a: `Ոչ: ${name}ը ցույց է տալիս միայն Արևի դիրքը: Լիարժեք նատալ քարտեզում կարևոր են նաև Լուսինը, ասցենդենտը, բոլոր մոլորակներն ու տները:`,
    },
  ];

  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: `${name} կենդանակերպի նշան. Ամսաթվեր, բնավորություն, սեր և համատեղելիություն`,
      description: c.tagline,
      inLanguage: "hy-AM",
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": `https://www.vividaastro.com/am/zodiac/${sign}`,
      },
      author: { "@type": "Organization", name: "Vivida" },
      about: {
        "@type": "Thing",
        name,
        description: `${name} (${dates.rangeAm}) — ${c.tagline}`,
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

  const introParagraphs = c.core
    .split("\n\n")
    .map((p) => p.trim())
    .filter(Boolean);

  const loveParagraphs = c.love
    .split("\n\n")
    .map((p) => p.trim())
    .filter(Boolean);

  const careerParagraphs = c.career
    .split("\n\n")
    .map((p) => p.trim())
    .filter(Boolean);

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
      <SmartHeader locale="am" georgianPath={`/zodiac/${sign}`} />
      {ld.map((item, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
      <section className="relative z-10 mx-auto w-full max-w-4xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-12">
        <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/am/zodiac" className="hover:text-foreground">
            Կենդանակերպ
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
              {meta.symbol || "✦"}
            </div>
            <div>
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                {dates.rangeAm}
              </div>
              <h1 className="mt-1 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
                {name}
              </h1>
              <p className="mt-3 max-w-xl text-pretty text-base text-foreground/85 sm:text-lg">
                {c.tagline}
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <Link href={`/am/zodiac/elementebi/${elementSlugForSign(sign)}`}>
                  <Pill
                    label="Տարերք"
                    value={ELEMENT_AM[meta.element]}
                    accent={accent}
                  />
                </Link>
                <Pill
                  label="Որակ"
                  value={MODALITY_AM[meta.modality] ?? meta.modality}
                  accent={accent}
                />
                <Pill label="Կառավարիչ" value={RULER_AM[sign]} accent={accent} />
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

        {/* Strengths & Challenges */}
        <section className="mt-12 grid gap-6 sm:grid-cols-2">
          <ListCard
            title="Ուժեղ կողմեր"
            items={c.strengths}
            accent={accent}
          />
          <ListCard
            title="Մարտահրավերներ և աճի ուղիներ"
            items={c.challenges}
            accent="var(--muted-foreground)"
          />
        </section>

        {/* Love */}
        <section className="mt-12 max-w-3xl">
          <h2 className="mb-4 text-2xl font-semibold tracking-tight sm:text-3xl">
            {name}ը սիրո և հարաբերությունների մեջ
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
            {name}ը կարիերայում և ֆինանսներում
          </h2>
          <div className="space-y-4 text-pretty text-base leading-relaxed text-foreground/90 sm:text-lg">
            {careerParagraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </section>

        {/* Compatibility Matrix */}
        <section className="mt-12">
          <div className="mb-5 flex items-baseline justify-between gap-3">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Համատեղելիություն այլ նշանների հետ
            </h2>
            <Link
              href="/am/compatibility"
              className="shrink-0 text-xs text-muted-foreground hover:text-foreground"
            >
              Բոլոր զույգերը →
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {COMPATIBILITY_AM[sign].map((otherSlug) => {
              const otherSignInfo = signMetaBySlug(otherSlug);
              const otherLabel = otherSignInfo?.labelAm || otherSlug;
              const levelStr = "Ներդաշնակ";
              const badgeColor = LEVEL_COLOR[levelStr] || "var(--vivida-cyan)";

              return (
                <Link
                  key={otherSlug}
                  href={`/am/zodiac/tavsebadoba/${pairSlug(sign, otherSlug)}`}
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
                    Բացահայտիր {name}ի և {otherLabel}ի միջև կապն ու դինամիկան:
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Moon & Rising links */}
        <section className="mt-14 grid gap-4 sm:grid-cols-2">
          <Link
            href={`/am/zodiac/mtvare/${sign}`}
            className="rounded-2xl border border-border bg-card/55 p-5 ring-1 ring-foreground/5 transition-all hover:bg-card/80"
          >
            <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Լուսնի նշան
            </div>
            <div className="mt-1 text-lg font-semibold">Լուսինը {name}ում</div>
            <p className="mt-1 text-sm text-foreground/80">
              Բացահայտիր ներքին հուզական պահանջմունքները:
            </p>
          </Link>
          <Link
            href={`/am/zodiac/amomavali/${sign}`}
            className="rounded-2xl border border-border bg-card/55 p-5 ring-1 ring-foreground/5 transition-all hover:bg-card/80"
          >
            <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Ասցենդենտ
            </div>
            <div className="mt-1 text-lg font-semibold">{name} ասցենդենտ</div>
            <p className="mt-1 text-sm text-foreground/80">
              Ինչպե՞ս է այս նշանը ձևավորում առաջին տպավորությունը:
            </p>
          </Link>
        </section>

        {/* Other signs */}
        <section className="mt-14">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Կենդանակերպի մյուս նշանները
          </h2>
          <div className="flex flex-wrap gap-2">
            {ALL_SLUGS.filter((slug) => slug !== sign).map((slug) => {
              const otherSignInfo = signMetaBySlug(slug);
              const otherLabel = otherSignInfo?.labelAm || slug;
              return (
                <Link
                  key={slug}
                  href={`/am/zodiac/${slug}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/55 px-3 py-1.5 text-sm hover:bg-card/80"
                >
                  <span>{otherSignInfo?.symbol || "✦"}</span>
                  {otherLabel}
                </Link>
              );
            })}
          </div>
        </section>

        <ReportPromo className="mt-16" />
        <div className="mt-14 rounded-2xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/12 via-card/60 to-[var(--vivida-cyan)]/12 p-7 text-center ring-1 ring-foreground/5 sm:p-10">
          <Sparkles className="mx-auto mb-3 size-7 text-[var(--vivida-violet)]" />
          <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            Արևի նշանը միայն սկիզբն է
          </h2>
          <p className="mx-auto mt-3 max-w-md text-pretty text-base text-muted-foreground">
            Քո ամբողջական քարտեզը ներառում է Լուսինը, ասցենդենտը, բոլոր մոլորակները և 12 տները:
          </p>
          <Button asChild variant="mystic" size="lg" className="mt-6">
            <Link href="/am/natal-chart">Հաշվարկել ամբողջական քարտեզը</Link>
          </Button>
        </div>
      </section>
      <SiteFooter locale="am" />
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
