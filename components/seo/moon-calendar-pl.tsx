import { PolishLink as Link } from "@/components/i18n/international-link";
import { Accent } from "@/components/en/editorial";
import { unstable_cache } from "next/cache";
import { ArrowRight, Moon } from "lucide-react";

import { Starfield } from "@/components/landing/starfield";
import { LunarPhaseDisc } from "@/components/brand/celestial-icons";
import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { PopularTools } from "@/components/nav/popular-tools";
import { Button } from "@/components/ui/button";
import {
  computeMoonPhase,
  PHASE_LABEL_PL,
  type PhaseKey,
} from "@/lib/moon-phase";
import { breadcrumbLd, faqLd, serializeLd } from "@/lib/seo/jsonld";
import {
  MOON_EVENT_DAYS,
  moonEvents,
  type MoonEvent,
} from "@/lib/seo/moon-events";
import { lunarDayFromAge } from "@/lib/seo/moon-reference";
import { moonCalendarPlCopy } from "@/lib/seo/moon-calendar-pl-copy";
import { tbilisiCalendarParts, tbilisiNoonUtc } from "@/lib/moon-calendar-date";

const SITE = "https://www.vividaastro.com";
const PATH = "/pl/kalendarz-ksiezycowy";
const DAY = 86400000;

const cachedUpcomingEvents = unstable_cache(
  async (dayKey: string) => {
    const asOf = new Date(`${dayKey}T00:00:00+04:00`);
    const serialize = (kind: "new" | "full") =>
      moonEvents(kind, MOON_EVENT_DAYS, asOf).map(({ date, ...event }) => ({
        ...event,
        dateIso: date.toISOString(),
      }));
    return { newEvents: serialize("new"), fullEvents: serialize("full") };
  },
  ["moon-calendar-upcoming-v2"],
  { revalidate: 86400 },
);

const PHASES_PL: Array<{ key: PhaseKey; range: string; meaning: string }> = [
  {
    key: "new_moon",
    range: "0–2%",
    meaning:
      "Początek cyklu lunarnego. Księżyc znajduje się blisko Słońca i pozostaje niewidoczny z Ziemi. Czas intencji i nowych początków.",
  },
  {
    key: "waxing_crescent",
    range: "3–33%",
    meaning:
      "Cienki sierp Księżyca rośnie na wieczornym niebie. Faza sprzyjająca stawianiu pierwszych kroków i budowaniu impetu.",
  },
  {
    key: "first_quarter",
    range: "ok. 50%",
    meaning:
      "Oświetlona jest dokładnie połowa tarczy. Czas podejmowania decyzji, pokonywania pierwszych wyzwań i korekty kursu.",
  },
  {
    key: "waxing_gibbous",
    range: "66–96%",
    meaning:
      "Ponad połowa tarczy jest widoczna. Energia cyklu zmierza ku kulminacji, dopracowywaniu szczegółów i domykaniu projektów.",
  },
  {
    key: "full_moon",
    range: "97–100%",
    meaning:
      "Tarcza Księżyca jest całkowicie oświetlona. Najjaśniejsza faza cyklu, związana z pełnią emocji, owocami działań i jasnością widzenia.",
  },
  {
    key: "waning_gibbous",
    range: "96–66%",
    meaning:
      "Oświetlenie zaczyna stopniowo maleć. Tradycyjnie czas refleksji, wdzięczności i dzielenia się zebranym doświadczeniem.",
  },
  {
    key: "last_quarter",
    range: "ok. 50%",
    meaning:
      "Połowa tarczy oświetlona z przeciwnej strony. Faza podsumowań, zwalniania tempa i odpuszczania tego, co już nie służy.",
  },
  {
    key: "waning_crescent",
    range: "33–3%",
    meaning:
      "Ostatni poranny sierp zamyka cykl. Czas regeneracji, wyciszenia i przygotowania na kolejny nów.",
  },
];

function datePl(date: Date) {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Warsaw",
  }).format(date);
}

function EventList({ events, label }: { events: MoonEvent[]; label: string }) {
  return (
    <ul
      aria-label={label}
      className="mt-4 grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2"
    >
      {events.map((event) => (
        <li key={event.iso} className="bg-card p-4">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-sm border border-border bg-background/60">
              <LunarPhaseDisc
                phaseKey={event.kind === "new" ? "new_moon" : "full_moon"}
                size={26}
              />
            </span>
            <div>
              <p className="font-mono text-sm font-semibold tabular-nums text-foreground">
                {datePl(event.date)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {event.snapshot.signSymbol} {event.snapshot.signPl} · Warszawa
              </p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export async function MoonCalendarPagePl() {
  const now = new Date();
  const year = tbilisiCalendarParts(now).year;
  const copy = moonCalendarPlCopy(year);
  const today = computeMoonPhase(now);
  const dayKey = tbilisiNoonUtc(now).toISOString().slice(0, 10);
  const cachedEvents = await cachedUpcomingEvents(dayKey);
  const revive = (events: typeof cachedEvents.newEvents): MoonEvent[] =>
    events.map(({ dateIso, ...event }) => ({
      ...event,
      date: new Date(dateIso),
    }));
  const upcomingNew = revive(cachedEvents.newEvents);
  const upcomingFull = revive(cachedEvents.fullEvents);
  const noon = tbilisiNoonUtc(now);
  const days = Array.from({ length: 30 }, (_, index) => {
    const date = new Date(noon.getTime() + index * DAY);
    return { date, snapshot: computeMoonPhase(date) };
  });

  const faq = [
    {
      q: "Jaką fazę ma dzisiaj Księżyc?",
      a: today
        ? `Dzisiaj Księżyc znajduje się w fazie: ${PHASE_LABEL_PL[today.phaseKey]}, jest oświetlony w około ${Math.round(today.illumination * 100)}% i przebywa w znaku ${today.signPl}.`
        : "Dzisiejsza faza aktualizuje się automatycznie u góry strony.",
    },
    {
      q: "Kiedy jest najbliższa pełnia Księżyca?",
      a: upcomingFull[0]
        ? `Najbliższa pełnia Księżyca nastąpi ${datePl(upcomingFull[0].date)} w znaku ${upcomingFull[0].snapshot.signPl}.`
        : "Najbliższa data pojawi się automatycznie.",
    },
    {
      q: "Kiedy jest najbliższy nów Księżyca?",
      a: upcomingNew[0]
        ? `Najbliższy nów Księżyca nastąpi ${datePl(upcomingNew[0].date)} w znaku ${upcomingNew[0].snapshot.signPl}.`
        : "Najbliższa data pojawi się automatycznie.",
    },
    {
      q: "Jak długo trwa pełny cykl księżycowy?",
      a: "Średni czas od jednego nowiu do kolejnego wynosi około 29,5 dnia (miesiąc synodyczny). Ścisły szczyt fazy trwa jeden moment, a zmiany na niebie zachodzą stopniowo każdego dnia.",
    },
    {
      q: "Czym różni się dzień księżycowy od fazy Księżyca?",
      a: "Faza opisuje stopień oświetlenia widocznej z Ziemi tarczy. Dzień księżycowy to kolejny dzień cyklu liczony od momentu ostatniego nowiu (zwykle od 1 do 29 lub 30).",
    },
  ];

  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      url: `${SITE}${PATH}`,
      name: copy.title,
      description: copy.description,
      inLanguage: "pl",
      dateModified: now.toISOString(),
      about: { "@type": "Thing", name: "Fazy Księżyca" },
    },
    breadcrumbLd([
      { name: "Start", url: `${SITE}/pl` },
      { name: "Kalendarz księżycowy", url: `${SITE}${PATH}` },
    ]),
    faqLd(faq),
  ];

  return (
    <main
      lang="pl"
      className="relative isolate flex min-h-screen flex-col overflow-hidden bg-background"
    >
      <Starfield count={48} />
      <SmartHeader locale="pl" georgianPath="/mtvaris-kalendari" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeLd(ld) }}
      />
      <article className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-16 pt-8 sm:px-6 sm:pb-24 sm:pt-12">
        <nav className="mb-8 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Start
          </Link>
          <span>/</span>
          <span className="text-foreground/80">Kalendarz księżycowy</span>
        </nav>
        <header className="mb-8 border-b border-border pb-8">
          <div className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
            <Moon className="size-3.5" />
            Rytm Lunarny · Efemeryda
          </div>
          <h1 className="font-display mt-2 text-balance text-4xl font-normal tracking-[-0.02em] sm:text-5xl">
            Kalendarz Księżycowy <Accent>{year}</Accent>
          </h1>
          <p className="mt-4 max-w-2xl text-pretty text-[15px] leading-relaxed text-muted-foreground sm:text-base">
            Aktualna faza Księżyca i znak zodiaku, nadchodzące daty nowiu i
            pełni oraz 30-dniowy przegląd księżycowy dzień po dniu.
          </p>
        </header>
        {today && (
          <section className="mb-10 rounded-md border border-border bg-card p-6 sm:p-8">
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
                  Telemetria Dnia · Aktualizowana Codziennie
                </p>
                <h2 className="font-display mt-2 text-2xl font-normal sm:text-3xl">
                  W jakiej fazie jest dzisiaj Księżyc?
                </h2>
                <p className="mt-3 text-base leading-relaxed text-foreground/90 sm:text-lg">
                  Dziś, <strong className="font-mono">{datePl(now)}</strong>,
                  Księżyc znajduje się w fazie{" "}
                  <strong>{PHASE_LABEL_PL[today.phaseKey]}</strong>. Jest{" "}
                  <strong className="font-mono tabular-nums text-primary">
                    oświetlony w {Math.round(today.illumination * 100)}%
                  </strong>{" "}
                  w znaku{" "}
                  <strong>
                    {today.signSymbol} {today.signPl}
                  </strong>
                  .
                </p>
              </div>
              <div className="shrink-0">
                <LunarPhaseDisc phaseAngle={today.phaseAngle} size={72} />
              </div>
            </div>
            <dl className="mt-6 grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-3">
              <Stat
                label="Dzień księżycowy"
                value={`${lunarDayFromAge(today.ageDays)}`}
                note="Liczony od ostatniego nowiu"
              />
              <Stat
                label="Najbliższy Nów"
                value={upcomingNew[0] ? datePl(upcomingNew[0].date) : "—"}
                note="Czas środkowoeuropejski"
              />
              <Stat
                label="Najbliższa Pełnia"
                value={upcomingFull[0] ? datePl(upcomingFull[0].date) : "—"}
                note="Czas środkowoeuropejski"
              />
            </dl>
          </section>
        )}
        <div className="mb-12">
          <PopularTools locale="pl" placement="moon_after_today" publicEntry />
        </div>
        <section className="mb-16">
          <h2 className="font-display text-3xl font-normal">
            Nadchodzące Nowie i Pełnie Księżyca
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Daty obliczane są z precyzyjnych efemeryd astronomicznych. Przejdź
            do szczegółowego przewodnika po danym wydarzeniu, aby poznać
            dokładny czas kulminacji, stopień oświetlenia i znak zodiaku.
          </p>
          <div className="mt-8 grid gap-10 lg:grid-cols-2">
            <section>
              <h3 className="text-xl font-semibold">Daty nowiu Księżyca</h3>
              <EventList
                events={upcomingNew.slice(0, 12)}
                label="Nadchodzące nowie"
              />
              <Link
                href="/akhali-mtvare"
                className="mt-4 inline-flex items-center gap-2 text-sm text-primary hover:underline"
              >
                Kompletny kalendarz nowiu <ArrowRight className="size-4" />
              </Link>
            </section>
            <section>
              <h3 className="text-xl font-semibold">Daty pełni Księżyca</h3>
              <EventList
                events={upcomingFull.slice(0, 12)}
                label="Nadchodzące pełnie"
              />
              <Link
                href="/savse-mtvare"
                className="mt-4 inline-flex items-center gap-2 text-sm text-primary hover:underline"
              >
                Kompletny kalendarz pełni <ArrowRight className="size-4" />
              </Link>
            </section>
          </div>
        </section>
        <section className="mb-16">
          <h2 className="font-display text-3xl font-normal">
            Prognoza na najbliższe 30 dni
          </h2>
          <div className="mt-5 grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {days.map(
              ({ date, snapshot }) =>
                snapshot && (
                  <div key={date.toISOString()} className="bg-card p-4">
                    <div className="flex items-start gap-3.5">
                      <LunarPhaseDisc
                        phaseAngle={snapshot.phaseAngle}
                        size={28}
                        className="mt-0.5"
                      />
                      <div>
                        <p className="font-mono text-sm font-semibold tabular-nums text-foreground">
                          {datePl(date)}
                        </p>
                        <p className="mt-0.5 text-sm text-foreground/85">
                          {PHASE_LABEL_PL[snapshot.phaseKey]}
                        </p>
                        <p className="mt-1 font-mono text-xs tabular-nums text-muted-foreground">
                          Dzień {lunarDayFromAge(snapshot.ageDays)} ·{" "}
                          {snapshot.signSymbol} {snapshot.signPl} ·{" "}
                          {Math.round(snapshot.illumination * 100)}%
                        </p>
                      </div>
                    </div>
                  </div>
                ),
            )}
          </div>
        </section>
        <section className="mb-16">
          <h2 className="font-display text-3xl font-normal">
            Osiem faz Księżyca
          </h2>
          <div className="mt-5 grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2">
            {PHASES_PL.map((phase) => (
              <div key={phase.key} className="bg-card p-5">
                <div className="flex items-center gap-3.5">
                  <LunarPhaseDisc phaseKey={phase.key} size={32} />
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {PHASE_LABEL_PL[phase.key]}
                    </h3>
                    <p className="font-mono text-xs tabular-nums text-muted-foreground">
                      {phase.range} oświetlenia
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {phase.meaning}
                </p>
              </div>
            ))}
          </div>
        </section>
        <section className="mb-16 max-w-3xl">
          <h2 className="mb-4 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Często zadawane pytania
          </h2>
          <div className="divide-y divide-border overflow-hidden rounded-md border border-border bg-card">
            {faq.map((item) => (
              <details key={item.q} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 font-medium text-foreground transition-colors hover:bg-secondary/30 [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span className="font-mono text-sm text-muted-foreground transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="border-t border-border/60 bg-background/40 px-5 py-4 text-sm leading-relaxed text-muted-foreground">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </section>
        <div className="flex flex-col justify-between gap-6 rounded-md border border-border bg-card p-6 sm:flex-row sm:items-center sm:p-8">
          <div className="max-w-xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
              Horoskop Urodzeniowy
            </p>
            <h2 className="font-display mt-2 text-balance text-2xl font-normal sm:text-3xl">
              Poznaj swój znak Księżyca
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Twoja data, godzina i miasto urodzenia określają dokładną pozycję
              Księżyca w chwili Twoich narodzin. Odkryj swój kosmiczny profil.
            </p>
          </div>
          <Button asChild size="lg" className="shrink-0">
            <Link href="/nataluri-ruka">Oblicz mój kosmogram</Link>
          </Button>
        </div>
      </article>
      <SiteFooter locale="pl" />
    </main>
  );
}

function Stat({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="bg-background/60 p-4">
      <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1.5 font-mono text-lg font-semibold tabular-nums text-foreground">
        {value}
      </dd>
      <dd className="mt-0.5 text-xs text-muted-foreground">{note}</dd>
    </div>
  );
}
