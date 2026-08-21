import { ArmenianLink as Link } from "@/components/i18n/international-link";
import { ArrowRight, Moon, Sparkles } from "lucide-react";

import { Starfield } from "@/components/landing/starfield";
import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { Button } from "@/components/ui/button";
import { formatAmDate } from "@/lib/i18n/am-date";
import { computeMoonPhase, PHASE_LABEL_AM, type PhaseKey } from "@/lib/moon-phase";
import { breadcrumbLd, faqLd, serializeLd } from "@/lib/seo/jsonld";
import { moonEvents, type MoonEvent } from "@/lib/seo/moon-events";
import { lunarDayFromAge } from "@/lib/seo/moon-reference";
import { signByIndex } from "@/lib/zodiac";
import { ARMENIAN_SITE_URL } from "@/lib/seo/locales";

const SITE = ARMENIAN_SITE_URL;
const PATH = "/mtvaris-kalendari";
const DAY = 86400000;
const YEAR = new Date().getUTCFullYear();

export const MOON_CALENDAR_AM = {
  title: `Լուսնային օրացույց ${YEAR} — Լուսինն այսօր, փուլերը և նշանը`,
  description: `Լուսնային օրացույց ${YEAR}. Լուսնի փուլն այսօր, լուսավորվածությունն ու կենդանակերպի նշանը, առաջիկա Նորալուսնի և Լիալուսնի ամսաթվերը:`,
};

const SYMBOL: Record<PhaseKey, string> = {
  new_moon: "🌑",
  waxing_crescent: "🌒",
  first_quarter: "🌓",
  waxing_gibbous: "🌔",
  full_moon: "🌕",
  waning_gibbous: "🌖",
  last_quarter: "🌗",
  waning_crescent: "🌘",
};

const PHASES: Array<{ key: PhaseKey; range: string; meaning: string }> = [
  {
    key: "new_moon",
    range: "0–2%",
    meaning: "Լուսնային ցիկլի սկիզբը: Լուսինը մոտ է Արեգակին և անտեսանելի է Երկրից:",
  },
  {
    key: "waxing_crescent",
    range: "3–33%",
    meaning: "Երեկոյան աճող բարակ մահիկ. նոր գործեր սկսելու և էներգիա հավաքելու ժամանակ:",
  },
  {
    key: "first_quarter",
    range: "մոտ 50%",
    meaning: "Սկավառակի կեսը լուսավորված է. որոշումներ կայացնելու և ընթացքը ճշգրտելու պահ:",
  },
  {
    key: "waxing_gibbous",
    range: "66–96%",
    meaning: "Լուսավորվածությունը մեծանում է՝ մոտենալով իր գագաթնակետին:",
  },
  {
    key: "full_moon",
    range: "97–100%",
    meaning: "Լուսնային սկավառակն ամբողջությամբ լուսավորված է՝ էներգիայի և արդյունքների գագաթնակետը:",
  },
  {
    key: "waning_gibbous",
    range: "96–66%",
    meaning: "Լուսավորվածությունը նվազում է. արդյունքների գնահատման և փորձի փոխանակման փուլ:",
  },
  {
    key: "last_quarter",
    range: "մոտ 50%",
    meaning: "Լուսավորված է հակառակ կողմի կեսը. վերանայման և ավելորդից ազատվելու ժամանակ:",
  },
  {
    key: "waning_crescent",
    range: "33–3%",
    meaning: "Վերջին առավոտյան մահիկը, որն ավարտում է շրջանը և տանում դեպի Նորալուսին:",
  },
];

function getSignAm(signIndex: number): string {
  return signByIndex(signIndex).labelAm;
}

function EventList({ events, label }: { events: MoonEvent[]; label: string }) {
  return (
    <ul aria-label={label} className="mt-5 grid gap-3 sm:grid-cols-2">
      {events.map((event) => (
        <li
          key={event.iso}
          className="rounded-2xl border border-border bg-card/50 p-4 ring-1 ring-foreground/5"
        >
          <div className="flex items-start gap-3">
            <span className="text-3xl">{event.kind === "new" ? "🌑" : "🌕"}</span>
            <div>
              <p className="font-semibold">{formatAmDate(event.date)}</p>
              <p className="mt-1 text-sm text-foreground/70">
                {event.snapshot.signSymbol} {getSignAm(event.snapshot.signIndex)}
              </p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function MoonCalendarPageAm() {
  const now = new Date();
  const today = computeMoonPhase(now);
  const upcomingNew = moonEvents("new");
  const upcomingFull = moonEvents("full");
  const days = Array.from({ length: 30 }, (_, index) => {
    const date = new Date(now.getTime() + index * DAY);
    return { date, snapshot: computeMoonPhase(date) };
  });

  const todaySignAm = today ? getSignAm(today.signIndex) : "";

  const faq = [
    {
      q: "Ի՞նչ լուսնային փուլ է այսօր:",
      a: today
        ? `Այսօր Լուսինը գտնվում է ${PHASE_LABEL_AM[today.phaseKey]} փուլում, մոտ ${Math.round(
            today.illumination * 100
          )}% լուսավորվածությամբ՝ ${todaySignAm} նշանում:`
        : "Փուլը թարմացվում է ավտոմատ:",
    },
    {
      q: "Ե՞րբ է հաջորդ Լիալուսինը:",
      a: upcomingFull[0]
        ? `Հաջորդ Լիալուսինը կլինի ${formatAmDate(upcomingFull[0].date)}-ին՝ ${getSignAm(
            upcomingFull[0].snapshot.signIndex
          )} նշանում:`
        : "Ամսաթիվը կհայտնվի ավտոմատ:",
    },
    {
      q: "Ե՞րբ է հաջորդ Նորալուսինը:",
      a: upcomingNew[0]
        ? `Հաջորդ Նորալուսինը կլինի ${formatAmDate(upcomingNew[0].date)}-ին՝ ${getSignAm(
            upcomingNew[0].snapshot.signIndex
          )} նշանում:`
        : "Ամսաթիվը կհայտնվի ավտոմատ:",
    },
    {
      q: "Որքա՞ն է տևում լուսնային ամբողջական ցիկլը:",
      a: "Մեկ Նորալուսնից մյուսը միջին տևողությունը կազմում է մոտ 29.5 օր:",
    },
    {
      q: "Ո՞րն է տարբերությունը լուսնային օրվա և լուսնային փուլի միջև:",
      a: "Փուլը նկարագրում է Լուսնի տեսանելի լուսավորվածությունը, իսկ լուսնային օրը հաշվարկվում է վերջին Նորալուսնից (1-ից 29 կամ 30):",
    },
  ];

  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      url: `${SITE}${PATH}`,
      name: MOON_CALENDAR_AM.title,
      description: MOON_CALENDAR_AM.description,
      inLanguage: "hy-AM",
      dateModified: now.toISOString(),
      about: { "@type": "Thing", name: "Լուսնի փուլեր" },
    },
    breadcrumbLd([
      { name: "Գլխավոր", url: SITE },
      { name: "Լուսնային օրացույց", url: `${SITE}${PATH}` },
    ]),
    faqLd(faq),
  ];

  return (
    <main lang="hy" className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_220/0.45),transparent_70%)]"
      />
      <Starfield count={120} shooting={3} />
      <SmartHeader locale="am" georgianPath={PATH} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeLd(ld) }}
      />
      <article className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-12">
        <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/am" className="hover:text-foreground">Գլխավոր</Link>
          <span>/</span>
          <span className="text-foreground/80">Լուսնային օրացույց</span>
        </nav>
        <header className="mb-8 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            <Moon className="size-3.5" />
            Լուսնային ռիթմ
          </div>
          <h1 className="mt-2 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            Լուսնային օրացույց{" "}
            <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
              {YEAR}
            </span>
          </h1>
          <p className="mt-4 text-pretty text-base leading-7 text-foreground/85 sm:text-lg">
            Լուսնի փուլն ու նշանն այսօր, առաջիկա Նորալուսնի և Լիալուսնի ամսաթվերը և 30-օրյա լուսնային տեսությունը:
          </p>
        </header>

        {today && (
          <section className="mb-10 rounded-3xl border border-[var(--vivida-violet)]/35 bg-[var(--vivida-violet)]/10 p-5 ring-1 ring-foreground/5 sm:p-7">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Թարմացվում է ամեն օր
            </p>
            <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">
              Ի՞նչ լուսնային փուլ է այսօր
            </h2>
            <p className="mt-3 text-lg leading-8 text-foreground/90">
              Այսօր՝ <strong>{formatAmDate(now)}</strong>, Լուսինը գտնվում է{" "}
              <strong>{PHASE_LABEL_AM[today.phaseKey]}</strong> փուլում: Այն{" "}
              <strong>{Math.round(today.illumination * 100)}% լուսավորված</strong> է{" "}
              <strong>
                {today.signSymbol} {todaySignAm}
              </strong>{" "}
              նշանում:
            </p>
            <dl className="mt-5 grid gap-3 sm:grid-cols-3">
              <Stat
                label="Լուսնային օր"
                value={`${lunarDayFromAge(today.ageDays)}`}
                note="Հաշվարկված Նորալուսնից"
              />
              <Stat
                label="Հաջորդ Նորալուսին"
                value={upcomingNew[0] ? formatAmDate(upcomingNew[0].date) : "—"}
                note="Առաջիկա ամսաթիվ"
              />
              <Stat
                label="Հաջորդ Լիալուսին"
                value={upcomingFull[0] ? formatAmDate(upcomingFull[0].date) : "—"}
                note="Առաջիկա ամսաթիվ"
              />
            </dl>
          </section>
        )}

        <section className="mb-14">
          <h2 className="text-3xl font-semibold">Առաջիկա Նորալուսիններ և Լիալուսիններ</h2>
          <p className="mt-3 max-w-3xl leading-7 text-foreground/80">
            Ամսաթվերը հաշվարկված են աստղագիտական էֆեմերիդներով: Բացեք իրադարձությունը՝ տեսնելու ճշգրիտ ժամը, լուսավորվածությունն ու խորհուրդները:
          </p>
          <div className="mt-8 grid gap-10 lg:grid-cols-2">
            <section>
              <h3 className="text-2xl font-semibold">Նորալուսնի ամսաթվեր</h3>
              <EventList events={upcomingNew.slice(0, 12)} label="Առաջիկա Նորալուսիններ" />
              <Link
                href="/am/akhali-mtvare"
                className="mt-4 inline-flex items-center gap-2 text-sm text-[var(--vivida-violet)]"
              >
                Նորալուսնի ամբողջական օրացույց <ArrowRight className="size-4" />
              </Link>
            </section>
            <section>
              <h3 className="text-2xl font-semibold">Լիալուսնի ամսաթվեր</h3>
              <EventList events={upcomingFull.slice(0, 12)} label="Առաջիկա Լիալուսիններ" />
              <Link
                href="/am/savse-mtvare"
                className="mt-4 inline-flex items-center gap-2 text-sm text-[var(--vivida-violet)]"
              >
                Լիալուսնի ամբողջական օրացույց <ArrowRight className="size-4" />
              </Link>
            </section>
          </div>
        </section>

        <section className="mb-14">
          <h2 className="text-3xl font-semibold">Հաջորդ 30 օրերը</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {days.map(
              ({ date, snapshot }) =>
                snapshot && (
                  <div key={date.toISOString()} className="rounded-2xl border border-border bg-card/50 p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{SYMBOL[snapshot.phaseKey]}</span>
                      <div>
                        <p className="font-semibold">{formatAmDate(date)}</p>
                        <p className="text-sm text-foreground/75">
                          {PHASE_LABEL_AM[snapshot.phaseKey]}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Լուսնային օր {lunarDayFromAge(snapshot.ageDays)} · {snapshot.signSymbol}{" "}
                          {getSignAm(snapshot.signIndex)} · {Math.round(snapshot.illumination * 100)}%
                        </p>
                      </div>
                    </div>
                  </div>
                )
            )}
          </div>
        </section>

        <section className="mb-14">
          <h2 className="text-3xl font-semibold">Լուսնի 8 փուլերը</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {PHASES.map((phase) => (
              <div key={phase.key} className="rounded-2xl border border-border bg-card/50 p-5">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{SYMBOL[phase.key]}</span>
                  <div>
                    <h3 className="font-semibold">{PHASE_LABEL_AM[phase.key]}</h3>
                    <p className="text-xs text-muted-foreground">{phase.range} լուսավորված</p>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-6 text-foreground/78">{phase.meaning}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-14 max-w-3xl">
          <h2 className="text-3xl font-semibold">Հաճախ տրվող հարցեր</h2>
          <div className="mt-5 space-y-4">
            {faq.map((item) => (
              <details key={item.q} className="rounded-2xl border border-border bg-card/45 p-5">
                <summary className="cursor-pointer font-semibold">{item.q}</summary>
                <p className="mt-3 leading-7 text-foreground/80">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <div className="rounded-2xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/12 via-card/60 to-[var(--vivida-cyan)]/12 p-7 text-center sm:p-10">
          <Sparkles className="mx-auto mb-3 size-7 text-[var(--vivida-violet)]" />
          <h2 className="text-balance text-2xl font-semibold sm:text-3xl">
            Իմացեք ձեր Լուսնի նշանը
          </h2>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            Ծննդյան ամսաթիվը, ճշգրիտ ժամը և վայրը ցույց են տալիս, թե որ կենդանակերպի նշանում էր Լուսինը ձեր ծննդյան պահին:
          </p>
          <Button asChild variant="mystic" size="lg" className="mt-6">
            <Link href="/am/natal-chart">
              Բացահայտել նատալ քարտեզը
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </article>
      <SiteFooter locale="am" />
    </main>
  );
}

function Stat({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-xl border border-border/70 bg-background/25 p-4">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-semibold tabular-nums">{value}</dd>
      <dd className="text-xs text-muted-foreground">{note}</dd>
    </div>
  );
}
