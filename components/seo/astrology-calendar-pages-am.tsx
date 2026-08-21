import { ArmenianLink as Link } from "@/components/i18n/international-link";
import { ArrowRight, CalendarDays, ShieldAlert, Sparkles } from "lucide-react";

import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import { articleLd, breadcrumbLd, faqLd, serializeLd } from "@/lib/seo/jsonld";
import {
  astrologyDay,
  calendarWindow,
  type AstrologyCalendarDay,
} from "@/lib/seo/astrology-calendar";
import {
  aspectAm,
  calendarDateLabelAm,
  dayAdviceAm,
  dayLeadAm,
  planetAm,
  TONE_AM,
  weekdayAm,
} from "@/lib/seo/astrology-calendar-am";
import { signByIndex } from "@/lib/zodiac";
import { ARMENIAN_SITE_URL } from "@/lib/seo/locales";
import { internationalPublicPath } from "@/lib/seo/public-paths";
import { withArmenianPrefix } from "@/lib/i18n/armenian-routes";

const SITE = ARMENIAN_SITE_URL;

function DayCard({ day }: { day: AstrologyCalendarDay }) {
  const tone = TONE_AM[day.tone];
  return (
    <Link
      href={withArmenianPrefix(`/astrologiuri-kalendari/${day.iso}`)}
      className="group rounded-2xl border border-border bg-card/55 p-4 transition hover:-translate-y-0.5 hover:border-foreground/20"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">{weekdayAm(day.date)}</p>
          <h3 className="font-semibold">{calendarDateLabelAm(day.date)}</h3>
        </div>
        <span className="text-xl" style={{ color: tone.color }}>
          {tone.icon}
        </span>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-foreground/8">
        <div
          className="h-full rounded-full"
          style={{ width: `${day.score}%`, background: tone.color }}
        />
      </div>
      <div className="mt-2 flex items-center justify-between text-xs">
        <span style={{ color: tone.color }}>{tone.label}</span>
        <span className="text-muted-foreground">Ինդեքս {day.score}/100</span>
      </div>
    </Link>
  );
}

export const CALENDAR_META_AM = {
  all: {
    title: "Աստղաբանական օրացույց. բարենպաստ և զգուշության օրեր",
    description:
      "Ամենօրյա մոլորակային ասպեկտներ, բարենպաստ ամսաթվեր և 30-օրյա աստղաբանական կանխատեսում ըստ ընթացիկ տրանզիտների:",
    path: "/astrologiuri-kalendari",
  },
  lucky: {
    title: "Բարենպաստ օրեր. հաջողակ աստղաբանական ամսաթվեր",
    description:
      "Բացահայտեք առաջիկա 90 օրերի բարենպաստ ամսաթվերը՝ հիմնված ներդաշնակ մոլորակային ասպեկտների վրա:",
    path: "/ighbliani-dgheebi",
  },
  careful: {
    title: "Զգուշության օրեր. լարված աստղաբանական ամսաթվեր",
    description:
      "Տեսեք առաջիկա 90 օրերի լարված ասպեկտներով օրերը և օգտագործեք դրանք ավելի հանգիստ և կշռադատված որոշումների համար:",
    path: "/frtxili-dgheebi",
  },
} as const;

export function AstrologyCalendarHubAm({
  filter = "all",
}: {
  filter?: "all" | "lucky" | "careful";
}) {
  const all = calendarWindow();
  const days =
    filter === "all"
      ? all.slice(0, 30)
      : all.filter((day) => day.tone === filter).slice(0, 24);
  const lucky = all.filter((day) => day.tone === "lucky").slice(0, 5);
  const careful = all.filter((day) => day.tone === "careful").slice(0, 5);

  const config =
    filter === "lucky"
      ? {
          ...CALENDAR_META_AM.lucky,
          heading: "Բարենպաստ աստղաբանական օրեր",
          intro:
            "Առաջիկա ամսաթվերը, որոնց ներդաշնակ մոլորակային ասպեկտները ստեղծում են ավելի համագործակցային ֆոն ծրագրերի, զրույցների և նախաձեռնությունների համար:",
          icon: Sparkles,
        }
      : filter === "careful"
      ? {
          ...CALENDAR_META_AM.careful,
          heading: "Զգուշության օրեր",
          intro:
            "Առաջիկա ամսաթվերը, որոնք նշանավորվում են լարված ասպեկտներով. օգտակար են դանդաղելու, մանրուքները ստուգելու և հանգիստ արձագանքելու համար:",
          icon: ShieldAlert,
        }
      : {
          ...CALENDAR_META_AM.all,
          heading: "Աստղաբանական օրացույց",
          intro:
            "Ամենօրյա մոլորակային ասպեկտներ, բարենպաստ և զգուշության ամսաթվեր առաջիկա 30 օրերի համար՝ հաշվարկված ըստ իրական տրանզիտների:",
          icon: CalendarDays,
        };

  const faq = [
    {
      q: "Ինչպե՞ս է հաշվարկվում օրվա աստղաբանական ինդեքսը:",
      a: "Ինդեքսը հաշվի է առնում մոլորակների միջև ներդաշնակ և լարված ասպեկտները, դրանց ճշգրտությունն ու ներգրավված մոլորակները: Այն նկարագրում է ընդհանուր մթնոլորտը:",
    },
    {
      q: "Արդյո՞ք բարենպաստ օրը երաշխավորում է հաջողություն:",
      a: "Ոչ: Այն ցույց է տալիս միայն ավելի համագործակցային ֆոն: Ձեր որոշումները, պատրաստվածությունն ու գործողությունները միշտ որոշիչ են:",
    },
    {
      q: "Պե՞տք է արդյոք հետաձգել կարևոր գործերը զգուշության օրերին:",
      a: "Պարտադիր չէ: Պարզապես լրացուցիչ ժամանակ նախատեսեք, ստուգեք փաստերը և խուսափեք ավելորդ հուզականությունից:",
    },
  ];

  const publicPath = internationalPublicPath(config.path);
  const url = `${SITE}${publicPath}`;
  const Icon = config.icon;
  const ld = [
    articleLd({
      url,
      headline: config.title,
      description: config.description,
      datePublished: "2026-08-13T00:00:00+04:00",
      dateModified: new Date().toISOString(),
    }),
    breadcrumbLd([
      { name: "Գլխավոր", url: SITE },
      { name: config.heading, url },
    ]),
    faqLd(faq),
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: days.map((day, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: `${calendarDateLabelAm(day.date)} — ${TONE_AM[day.tone].label}`,
        url: `${SITE}${internationalPublicPath(`/astrologiuri-kalendari/${day.iso}`)}`,
      })),
    },
  ];

  return (
    <main lang="hy" className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <Starfield count={100} shooting={2} />
      <SmartHeader locale="am" georgianPath={config.path} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeLd(ld) }}
      />
      <section className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-20 pt-8 sm:px-6 sm:pt-12">
        <header className="max-w-3xl">
          <Icon className="size-9 text-[var(--vivida-cyan)]" />
          <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            {config.heading}
          </h1>
          <p className="mt-4 text-lg leading-8 text-foreground/80">{config.intro}</p>
        </header>

        <nav className="mt-7 flex flex-wrap gap-2">
          {[
            ["/am/astrology-calendar", "Ամբողջ օրացույցը"],
            ["/am/lucky-days", "Բարենպաստ օրեր"],
            ["/am/challenging-days", "Զգուշության օրեր"],
            ["/am/moon-calendar", "Լուսնային օրացույց"],
          ].map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className={`rounded-full border px-4 py-2 text-sm ${
                href === withArmenianPrefix(config.path)
                  ? "border-[var(--vivida-cyan)]/50 bg-[var(--vivida-cyan)]/10"
                  : "border-border bg-card/55 text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {days.map((day) => (
            <DayCard key={day.iso} day={day} />
          ))}
        </div>

        {filter === "all" && (
          <div className="mt-14 grid gap-6 lg:grid-cols-2">
            <section>
              <h2 className="text-2xl font-semibold">Առաջիկա բարենպաստ օրերը</h2>
              <div className="mt-4 space-y-2">
                {lucky.map((day) => (
                  <DayCard key={day.iso} day={day} />
                ))}
              </div>
            </section>
            <section>
              <h2 className="text-2xl font-semibold">Առաջիկա զգուշության օրերը</h2>
              <div className="mt-4 space-y-2">
                {careful.map((day) => (
                  <DayCard key={day.iso} day={day} />
                ))}
              </div>
            </section>
          </div>
        )}

        <section className="mt-14 max-w-3xl">
          <h2 className="text-2xl font-semibold">Ինչպե՞ս օգտագործել այս օրացույցը</h2>
          <p className="mt-4 leading-8 text-foreground/80">
            Օրացույցը նկարագրում է ընդհանուր աստղաբանական ֆոնը: Ընտրեք ամսաթիվը, ծանոթացեք գլխավոր ասպեկտներին և օգտագործեք խորհուրդները որպես լրացուցիչ պլանավորման գործիք:
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold">Հաճախ տրվող հարցեր</h2>
          <div className="mt-5 space-y-3">
            {faq.map((item) => (
              <details key={item.q} className="rounded-2xl border border-border bg-card/50 p-5">
                <summary className="cursor-pointer font-medium">{item.q}</summary>
                <p className="mt-3 leading-7 text-foreground/78">{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      </section>
      <SiteFooter locale="am" />
    </main>
  );
}

export function AstrologyCalendarDetailAm({ date }: { date: Date }) {
  const day = astrologyDay(date);
  const advice = dayAdviceAm(day);
  const tone = TONE_AM[day.tone];
  const label = calendarDateLabelAm(day.date);
  const url = `${SITE}${internationalPublicPath(`/astrologiuri-kalendari/${day.iso}`)}`;

  const faq = [
    {
      q: `Արդյո՞ք ${label}-ը բարենպաստ օր է:`,
      a: `${advice.title}. ${advice.summary}`,
    },
    {
      q: "Արդյո՞ք այս կանխատեսումը նույնն է բոլորի համար:",
      a: "Այս էջը նկարագրում է հավաքական մոլորակային ասպեկտները: Ձեր անհատական փորձառությունը կախված է նաև ձեր նատալ քարտեզից և անձնական որոշումներից:",
    },
  ];

  const description = `${label} աստղաբանական կանխատեսում. մոլորակային ասպեկտներ, օրվա էներգիայի ինդեքս, բարենպաստ թեմաներ և գործնական խորհուրդներ:`;
  const ld = [
    articleLd({
      url,
      headline: `${label} Աստղաբանական կանխատեսում`,
      description,
      datePublished: `${day.iso}T00:00:00Z`,
      dateModified: `${day.iso}T00:00:00Z`,
    }),
    breadcrumbLd([
      { name: "Գլխավոր", url: SITE },
      { name: "Աստղաբանական օրացույց", url: `${SITE}/astrology-calendar` },
      { name: label, url },
    ]),
    faqLd(faq),
  ];

  return (
    <main lang="hy" className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <Starfield count={90} shooting={1} />
      <SmartHeader locale="am" georgianPath={`/astrologiuri-kalendari/${day.iso}`} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeLd(ld) }}
      />
      <article className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-20 pt-8 sm:px-6 sm:pt-12">
        <nav className="text-xs text-muted-foreground">
          <Link href="/am/astrology-calendar" className="hover:text-foreground">
            Աստղաբանական օրացույց
          </Link>{" "}
          / {label}
        </nav>

        <header className="mt-6 rounded-3xl border border-border bg-card/60 p-6 sm:p-9">
          <p className="text-sm" style={{ color: tone.color }}>
            {tone.icon} {advice.title} · Ինդեքս {day.score}/100
          </p>
          <h1 className="mt-3 text-balance text-3xl font-semibold sm:text-4xl">
            {label} — աստղաբանական կանխատեսում
          </h1>
          <p className="mt-4 text-lg leading-8 text-foreground/80">{dayLeadAm(day)}</p>
          <p className="mt-3 leading-7 text-foreground/75">{advice.summary}</p>
        </header>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold">Մոլորակային ասպեկտներ</h2>
          <div className="mt-5 space-y-3">
            {day.sky.aspects.length ? (
              day.sky.aspects.map((aspect) => (
                <div
                  key={`${aspect.aKa}-${aspect.bKa}-${aspect.kindKa}`}
                  className="rounded-2xl border border-border bg-card/50 p-5"
                >
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="font-semibold">
                      {aspect.aSymbol} {planetAm(aspect.aKa)} — {aspect.bSymbol}{" "}
                      {planetAm(aspect.bKa)}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      Օրբիս {aspect.orb.toFixed(1)}°
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-foreground/75">
                    {aspectAm(aspect.kindKa)} ·{" "}
                    {aspect.family === "harmonic"
                      ? "ներդաշնակ ազդեցություն"
                      : aspect.family === "tense"
                      ? "լարված ազդեցություն"
                      : "չեզոք ազդեցություն"}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-foreground/75">
                Ուժեղ լարված ասպեկտներ չկան. օրվա ռիթմը հանգիստ է:
              </p>
            )}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold">Մոլորակները կենդանակերպի նշաններում</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {day.sky.planets.map((planet) => (
              <span
                key={planet.key}
                className="rounded-full border border-border bg-card/55 px-3 py-2 text-sm"
              >
                {planet.symbol} {planetAm(planet.labelKa)} — {planet.signSymbol}{" "}
                {signByIndex(planet.signIndex).labelAm}
              </span>
            ))}
          </div>
        </section>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <section className="rounded-2xl border border-[var(--vivida-cyan)]/25 bg-[var(--vivida-cyan)]/8 p-5">
            <h2 className="font-semibold">Ի՞նչ անել</h2>
            <ul className="mt-3 space-y-2 text-sm leading-6">
              {advice.do.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </section>
          <section className="rounded-2xl border border-[var(--vivida-pink)]/25 bg-[var(--vivida-pink)]/8 p-5">
            <h2 className="font-semibold">Ինչի՞ց խուսափել</h2>
            <ul className="mt-3 space-y-2 text-sm leading-6">
              {advice.avoid.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </section>
        </div>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold">Հաճախ տրվող հարցեր</h2>
          <div className="mt-5 space-y-3">
            {faq.map((item) => (
              <details key={item.q} className="rounded-2xl border border-border bg-card/50 p-5">
                <summary className="cursor-pointer font-medium">{item.q}</summary>
                <p className="mt-3 leading-7 text-foreground/78">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link
            href="/am/lucky-days"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-2 text-sm"
          >
            Բարենպաստ օրեր <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/am/challenging-days"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-2 text-sm"
          >
            Զգուշության օրեր <ArrowRight className="size-4" />
          </Link>
        </div>
      </article>
      <SiteFooter locale="am" />
    </main>
  );
}
