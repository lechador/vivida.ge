import Link from "next/link";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import { ALL_SLUGS, ZODIAC_DATES, signMetaBySlug } from "@/lib/seo/zodiac-dates";
import { SIGNS_CONTENT } from "@/lib/seo/zodiac-content";
import { VIEW_PATH } from "@/lib/sign-horoscope";
import { signColor } from "@/lib/zodiac";
import { ZODIAC_SIGN_AM } from "@/lib/zodiac-sign-am";
import { AM_MONTHS, AM_MONTHS_GENITIVE } from "@/lib/i18n/am-date";
import { ARMENIAN_SITE_URL, DEFAULT_OG_IMAGE, localizedAlternates } from "@/lib/seo/locales";

export type ArmenianPeriod = "week" | "month";

export const PERIOD_AM = {
  week: {
    path: "/horoskopi/kvireuli",
    viewPath: VIEW_PATH.week,
    title: "Շաբաթական հորոսկոպ. Կենդանակերպի բոլոր 12 նշանները",
    description: "Կարդացեք այս շաբաթվա հորոսկոպը կենդանակերպի բոլոր 12 նշանների համար՝ գործնական խորհուրդներ հարաբերությունների, աշխատանքի և անձնական աճի համար:",
    heading: "Այս շաբաթվա հորոսկոպը",
    intro: "Ընտրեք ձեր կենդանակերպի նշանը շաբաթական հորոսկոպի համար: Օգտագործեք խորհուրդները առաջնահերթությունները հստակեցնելու և ճիշտ որոշումներ կայացնելու համար:",
    cadence: "Շաբաթական ուղեցույց",
    cta: "Կարդալ ամբողջական շաբաթական հորոսկոպը →",
    faq: [
      { q: "Ե՞րբ է թարմացվում շաբաթական հորոսկոպը:", a: "Շաբաթական հորոսկոպը թարմացվում է ամեն երկուշաբթի:" },
      { q: "Արևի՞, թե՞ ասցենդենտի նշանով պետք է կարդալ:", a: "Սկսեք ձեր Արևի նշանից, ապա կարդացեք նաև ասցենդենտը: Ամբողջական պատկեր ստանալու համար հաշվարկեք ձեր նատալ քարտեզը:" },
      { q: "Արդյո՞ք շաբաթական հորոսկոպը կանխատեսում է ճշգրիտ իրադարձություններ:", a: "Ոչ: Այն առաջարկում է աստղաբանական միտումներ և ինքնաճանաչման թեմաներ, ոչ թե անխուսափելի իրադարձություններ:" },
    ],
  },
  month: {
    path: "/horoskopi/tviuri",
    viewPath: VIEW_PATH.month,
    title: "Ամսական հորոսկոպ. Կենդանակերպի բոլոր 12 նշանները",
    description: "Կարդացեք այս ամսվա հորոսկոպը կենդանակերպի բոլոր 12 նշանների համար՝ սեր, կարիերա, ֆինանսներ և անձնական զարգացում:",
    heading: "Այս ամսվա հորոսկոպը",
    intro: "Ընտրեք ձեր կենդանակերպի նշանը ամսական հորոսկոպի համար: Օգտագործեք այն պլանավորման և նպատակներին հասնելու համար:",
    cadence: "Ամսական ուղեցույց",
    cta: "Կարդալ ամբողջական ամսական հորոսկոպը →",
    faq: [
      { q: "Ե՞րբ է թարմացվում ամսական հորոսկոպը:", a: "Ամսական հորոսկոպը թարմացվում է յուրաքանչյուր օրացուցային ամսվա առաջին օրը:" },
      { q: "Ի՞նչ է հաշվի առնում ամսական հորոսկոպը:", a: "Այն արտացոլում է Արևի նշանի հիմնական միտումները: Անհատական պատկերի համար կարևոր են նաև ասցենդենտը և ընթացիկ տարանցումները:" },
      { q: "Արդյո՞ք ամսական հորոսկոպը անձնական խորհրդատվություն է:", a: "Ոչ: Այն ծառայում է ինքնավերլուծության և ընդհանուր կողմնորոշման համար:" },
    ],
  },
} as const;

export function periodHubMetadataAm(period: ArmenianPeriod) {
  const config = PERIOD_AM[period];
  const path = `/am${config.path}`;
  const url = `${ARMENIAN_SITE_URL}${config.path}`;
  return {
    title: { absolute: `${config.title} — Vivida` },
    description: config.description,
    alternates: localizedAlternates(path, config.path, "am"),
    openGraph: {
      images: [DEFAULT_OG_IMAGE],
      type: "website" as const,
      url,
      title: config.title,
      description: config.description,
      siteName: "Vivida",
      locale: "hy_AM",
    },
    twitter: { card: "summary_large_image" as const, title: config.title, description: config.description },
  };
}

function startOfWeek(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay();
  result.setDate(result.getDate() - ((day + 6) % 7));
  return result;
}

export function PeriodHoroscopeHubAm({ period }: { period: ArmenianPeriod }) {
  const config = PERIOD_AM[period];
  const now = new Date();
  const weekStart = startOfWeek(now);
  const dateLabel = period === "week"
    ? `${weekStart.getDate()} ${AM_MONTHS_GENITIVE[weekStart.getMonth()]}-ի շաբաթը`
    : `${AM_MONTHS[now.getMonth()]} ${now.getFullYear()}`;
  const url = `${ARMENIAN_SITE_URL}${config.path}`;
  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: config.title,
      description: config.description,
      url,
      inLanguage: "hy-AM",
      mainEntity: {
        "@type": "ItemList",
        itemListElement: ALL_SLUGS.map((sign, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: `${signMetaBySlug(sign)!.labelAm || sign} ${config.cadence.toLowerCase()}`,
          url: `${ARMENIAN_SITE_URL}/zodiac/${sign}/${config.viewPath}`,
        })),
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: config.faq.map((item) => ({
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
      <Starfield count={120} shooting={3} />
      <SmartHeader locale="am" georgianPath={config.path} />
      {ld.map((item, index) => (
        <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }} />
      ))}
      <section className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-12">
        <nav className="mb-6 flex gap-2 text-xs text-muted-foreground">
          <Link href="/am">Գլխավոր</Link>
          <span>/</span>
          <Link href="/am/horoscope">Հորոսկոպ</Link>
          <span>/</span>
          <span className="text-foreground/80">{config.cadence}</span>
        </nav>
        <header className="mb-6 max-w-3xl">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">{dateLabel}</div>
          <h1 className="mt-2 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">{config.heading}</h1>
          <p className="mt-4 text-pretty text-base text-foreground/85 sm:text-lg">{config.intro}</p>
        </header>
        <div className="mb-10 flex flex-wrap gap-2">
          <Link href="/am/horoscope" className="rounded-full border border-border bg-card/55 px-4 py-1.5 text-sm">
            Օրական հորոսկոպ
          </Link>
          <Link
            href={`/am${PERIOD_AM.week.path}`}
            className={`rounded-full border px-4 py-1.5 text-sm ${
              period === "week"
                ? "border-[var(--vivida-violet)]/50 bg-[var(--vivida-violet)]/15"
                : "border-border bg-card/55"
            }`}
          >
            Շաբաթական հորոսկոպ
          </Link>
          <Link
            href={`/am${PERIOD_AM.month.path}`}
            className={`rounded-full border px-4 py-1.5 text-sm ${
              period === "month"
                ? "border-[var(--vivida-violet)]/50 bg-[var(--vivida-violet)]/15"
                : "border-border bg-card/55"
            }`}
          >
            Ամսական հորոսկոպ
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ALL_SLUGS.map((sign) => {
            const meta = signMetaBySlug(sign)!;
            const profile = ZODIAC_SIGN_AM[sign];
            const accent = signColor(meta);
            const name = meta.labelAm || meta.labelKa;
            const summary =
              period === "week"
                ? `Այս շաբաթ օգտագործիր ${profile.strengths[0].toLowerCase()} հատկանիշը և զգուշացիր ${profile.challenges[0].toLowerCase()}-ից:`
                : `Այս ամիսը նպաստում է կայուն աճին ${profile.strengths.slice(0, 2).join(" և ").toLowerCase()} միջոցով:`;
            return (
              <Link
                key={sign}
                href={`/am/zodiac/${sign}/${config.viewPath}`}
                className="group rounded-2xl border border-border bg-card/55 p-5 transition hover:bg-card/80"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="grid size-12 place-items-center rounded-xl text-2xl"
                    style={{
                      color: accent,
                      background: `color-mix(in oklch, ${accent} 18%, transparent)`,
                    }}
                  >
                    {SIGNS_CONTENT[sign].symbol}
                  </div>
                  <div>
                    <h2 className="font-semibold">{name}</h2>
                    <div className="text-[11px] text-muted-foreground">{ZODIAC_DATES[sign].rangeAm}</div>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-foreground/85">{summary}</p>
                <div className="mt-3 text-xs text-muted-foreground group-hover:text-foreground">{config.cta}</div>
              </Link>
            );
          })}
        </div>
        <section className="mt-12">
          <h2 className="text-xl font-semibold">{config.cadence} ըստ կենդանակերպի նշանի</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {ALL_SLUGS.map((sign) => {
              const meta = signMetaBySlug(sign)!;
              const name = meta.labelAm || meta.labelKa;
              return (
                <Link
                  key={sign}
                  href={`/am/zodiac/${sign}/${config.viewPath}`}
                  className="rounded-xl border border-border/60 bg-card/40 px-3.5 py-2.5 text-sm font-medium"
                >
                  {name} {period === "week" ? "շաբաթական" : "ամսական"} հորոսկոպ
                </Link>
              );
            })}
          </div>
        </section>
        <section className="mt-12">
          <h2 className="mb-4 text-2xl font-semibold">Հաճախ տրվող հարցեր</h2>
          <div className="space-y-3">
            {config.faq.map((item) => (
              <details key={item.q} className="rounded-2xl border border-border bg-card/50 p-5">
                <summary className="cursor-pointer font-medium">{item.q}</summary>
                <p className="mt-3 leading-7 text-foreground/85">{item.a}</p>
              </details>
            ))}
          </div>
        </section>
        <div className="mt-14 rounded-2xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/12 via-card/60 to-[var(--vivida-cyan)]/12 p-7 text-center sm:p-10">
          <Sparkles className="mx-auto mb-3 size-7 text-[var(--vivida-violet)]" />
          <h2 className="text-2xl font-semibold sm:text-3xl">Արևի նշանը միայն մեկ շերտ է</h2>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            Հաշվարկիր քո ամբողջական նատալ քարտեզը՝ Լուսինը, ասցենդենտը, մոլորակներն ու տները բացահայտելու համար:
          </p>
          <Button asChild variant="mystic" size="lg" className="mt-6">
            <Link href="/am/natal-chart">Հաշվարկել ծննդյան քարտեզը</Link>
          </Button>
        </div>
      </section>
      <SiteFooter locale="am" />
    </main>
  );
}
