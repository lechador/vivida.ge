import { ArmenianLink as Link } from "@/components/i18n/international-link";
import { Calendar, Sparkles } from "lucide-react";

import { Starfield } from "@/components/landing/starfield";
import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { Button } from "@/components/ui/button";
import { AM_MONTHS, AM_MONTHS_GENITIVE, formatAmDate } from "@/lib/i18n/am-date";
import {
  ALL_SLUGS,
  signMetaBySlug,
  type ZodiacSlug,
} from "@/lib/seo/zodiac-dates";
import { SIGNS_CONTENT } from "@/lib/seo/zodiac-content";
import {
  ALL_HOROSCOPE_VIEWS,
  VIEW_PATH,
  type HoroscopeView,
} from "@/lib/sign-horoscope";
import { ARMENIAN_SITE_URL } from "@/lib/seo/locales";
import { signColor } from "@/lib/zodiac";
import { ZODIAC_SIGN_AM } from "@/lib/zodiac-sign-am";
import { internationalPublicPath } from "@/lib/seo/public-paths";
import { withArmenianPrefix } from "@/lib/i18n/armenian-routes";
import { serializeLd } from "@/lib/seo/jsonld";

export const VIEW_LABEL_AM: Record<HoroscopeView, string> = {
  today: "Այսօրվա հորոսկոպ",
  tomorrow: "Վաղվա հորոսկոպ",
  week: "Այս շաբաթվա հորոսկոպ",
  month: "Այս ամսվա հորոսկոպ",
  nextWeek: "Հաջորդ շաբաթվա հորոսկոպ",
  nextMonth: "Հաջորդ ամսվա հորոսկոպ",
};

function dateLabel(view: HoroscopeView): string {
  const now = new Date();
  const offset =
    view === "tomorrow"
      ? 1
      : view === "nextWeek"
        ? 7
        : view === "nextMonth"
          ? 30
          : 0;
  const date = new Date(now.getTime() + offset * 86_400_000);
  if (view === "today" || view === "tomorrow") return formatAmDate(date);
  if (view === "week" || view === "nextWeek") {
    return `${date.getDate()} ${AM_MONTHS_GENITIVE[date.getMonth()]} սկսվող շաբաթ`;
  }
  return `${AM_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

function forecast(sign: ZodiacSlug, view: HoroscopeView) {
  const profile = ZODIAC_SIGN_AM[sign];
  const horizon =
    view === "today"
      ? "այսօր"
      : view === "tomorrow"
        ? "վաղը"
        : view === "week"
          ? "այս շաբաթ"
          : view === "nextWeek"
            ? "հաջորդ շաբաթ"
            : view === "month"
              ? "այս ամիս"
              : "հաջորդ ամիս";
  const headline =
    view === "today" || view === "tomorrow"
      ? "Նախ ընտրեք ուղղությունը, ապա՝ արագությունը"
      : "Կենտրոնացրեք ուժը կարևոր նպատակների շուրջ";

  return {
    headline,
    summary: `${horizon[0].toUpperCase() + horizon.slice(1)} լավագույն արդյունքը կստանաք, եթե օգտագործեք ձեր բնական ուժեղ կողմերը և թույլ չտաք, որ սովորական ճնշման օրինաչափությունները կառավարեն ձեր ընտրությունները։`,
    paragraphs: [
      `${profile.core} ${horizon[0].toUpperCase() + horizon.slice(1)} նկատեք, թե որտեղ է այս բնական ոճն օգնում առաջ շարժվել, և որտեղ ավելի ճկուն արձագանքը կարող է ավելի լավ արդյունք տալ։`,
      `Հարաբերություններում՝ ${profile.love} Զրույցը պահեք ներկա իրավիճակի շրջանակում և մի արձագանքեք միայն անցյալի սպասումներին։`,
      `Աշխատանքի և գործնական որոշումների համար՝ ${profile.career} Ընտրեք մեկ առաջնահերթություն, որը տեսանելի առաջընթաց կբերի, և հետևողականությունը գերադասեք կարճատև ինտենսիվությունից։`,
    ],
    themes: ["Հստակ առաջնահերթություններ", "Անկեղծ կապ", "Կայուն առաջընթաց"],
  };
}

export function SignHoroscopePageAm({
  sign,
  view,
}: {
  sign: ZodiacSlug;
  view: HoroscopeView;
}) {
  const meta = signMetaBySlug(sign)!;
  const name = meta.labelAm || meta.labelKa;
  const accent = signColor(meta);
  const reading = forecast(sign, view);
  const label = VIEW_LABEL_AM[view];
  const period = dateLabel(view);
  const path = `/zodiac/${sign}/${VIEW_PATH[view]}`;
  const url = `${ARMENIAN_SITE_URL}${internationalPublicPath(path)}`;
  const ld = {
    "@context": "https://schema.org",
    "@type": "Article",
    url,
    headline: `${name} — ${label}`,
    description: reading.summary,
    datePublished: new Date().toISOString(),
    inLanguage: "hy-AM",
    about: { "@type": "Thing", name: `${name} ${label}` },
  };

  return (
    <main lang="hy" className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_220/0.45),transparent_70%)]"
      />
      <Starfield count={130} shooting={3} />
      <SmartHeader locale="am" georgianPath={path} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeLd(ld) }}
      />

      <section className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-12">
        <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/am/zodiac" className="hover:text-foreground">
            Կենդանակերպի նշաններ
          </Link>
          <span>/</span>
          <Link href={`/am/zodiac/${sign}`} className="hover:text-foreground">
            {name}
          </Link>
          <span>/</span>
          <span className="text-foreground/80">{label}</span>
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
                color: accent,
              }}
            >
              {SIGNS_CONTENT[sign].symbol}
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                <Calendar className="size-3.5" />
                {period}
              </div>
              <h1 className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
                {name} — {label}
              </h1>
              <p className="mt-3 text-pretty text-base sm:text-lg" style={{ color: accent }}>
                {reading.headline}
              </p>
              <p className="mt-2 text-pretty text-sm text-foreground/85 sm:text-base">
                {reading.summary}
              </p>
            </div>
          </div>
        </article>

        <section className="mt-10 max-w-2xl space-y-4 text-pretty text-base leading-relaxed text-foreground/90 sm:text-lg">
          {reading.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </section>

        <section className="mt-8">
          <div className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Հիմնական թեմաներ
          </div>
          <ul className="flex flex-wrap gap-2">
            {reading.themes.map((theme) => (
              <li
                key={theme}
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

        <section className="mt-12">
          <div className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {name} նշանի այլ հորոսկոպներ
          </div>
          <div className="flex flex-wrap gap-2">
            {ALL_HOROSCOPE_VIEWS.filter((item) => item !== view).map((item) => (
              <Link
                key={item}
                href={withArmenianPrefix(`/zodiac/${sign}/${VIEW_PATH[item]}`)}
                className="rounded-full border border-border bg-card/55 px-3 py-1.5 text-sm hover:bg-card/80"
              >
                {VIEW_LABEL_AM[item]}
              </Link>
            ))}
            <Link
              href={`/am/zodiac/${sign}`}
              className="rounded-full border border-border bg-card/55 px-3 py-1.5 text-sm hover:bg-card/80"
            >
              {name} նշանի ամբողջական նկարագիրը
            </Link>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="mb-3 text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {label}՝ մյուս նշանների համար
          </h2>
          <div className="flex flex-wrap gap-2">
            {ALL_SLUGS.filter((slug) => slug !== sign).map((slug) => {
              const other = signMetaBySlug(slug)!;
              return (
                <Link
                  key={slug}
                  href={withArmenianPrefix(`/zodiac/${slug}/${VIEW_PATH[view]}`)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/55 px-3 py-1.5 text-sm hover:bg-card/80"
                >
                  <span>{SIGNS_CONTENT[slug].symbol}</span>
                  {other.labelAm || other.labelKa}
                </Link>
              );
            })}
          </div>
        </section>

        <div className="mt-14 rounded-2xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/12 via-card/60 to-[var(--vivida-cyan)]/12 p-7 text-center ring-1 ring-foreground/5 sm:p-10">
          <Sparkles className="mx-auto mb-3 size-7 text-[var(--vivida-violet)]" />
          <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            Անձնական հորոսկոպը չի սահմանափակվում Արեգակի նշանով
          </h2>
          <p className="mx-auto mt-3 max-w-md text-pretty text-base text-muted-foreground">
            Ամբողջական նատալ քարտեզը ներառում է Լուսինը, Վեներան, Մարսը,
            ասցենդենտը և բոլոր 12 տները։
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
