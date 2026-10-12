import { EnglishLink as Link } from "@/components/i18n/international-link";
import { Accent } from "@/components/en/editorial";
import { unstable_cache } from "next/cache";
import { ArrowRight, Moon, Sparkles } from "lucide-react";

import { Starfield } from "@/components/landing/starfield";
import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { PopularTools } from "@/components/nav/popular-tools";
import { Button } from "@/components/ui/button";
import {
  computeMoonPhase,
  PHASE_LABEL_EN,
  type PhaseKey,
} from "@/lib/moon-phase";
import { breadcrumbLd, faqLd, serializeLd } from "@/lib/seo/jsonld";
import {
  MOON_EVENT_DAYS,
  moonEvents,
  type MoonEvent,
} from "@/lib/seo/moon-events";
import { lunarDayFromAge } from "@/lib/seo/moon-reference";
import { tbilisiCalendarParts, tbilisiNoonUtc } from "@/lib/moon-calendar-date";

const SITE = "https://www.vividaastro.com";
const PATH = "/mtvaris-kalendari";
const DAY = 86400000;
// A Tbilisi date in the key refreshes upcoming events at local midnight.
// Only event lists are cached; today's phase and the 30-day view stay live.
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
export const moonCalendarEnCopy = (year: number) => ({
  title: `Moon Calendar ${year}: Today's Phase and Zodiac Sign`,
  description: `Moon calendar for ${year}: today's phase, illumination and zodiac sign, upcoming New and Full Moon dates, and a daily 30-day lunar forecast.`,
});
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
    meaning:
      "The lunar cycle begins. The Moon is close to the Sun and is usually invisible from Earth.",
  },
  {
    key: "waxing_crescent",
    range: "3–33%",
    meaning:
      "A thin evening crescent grows, traditionally linked with first steps and building momentum.",
  },
  {
    key: "first_quarter",
    range: "about 50%",
    meaning:
      "Half the disk is illuminated, a phase associated with decisions and active adjustment.",
  },
  {
    key: "waxing_gibbous",
    range: "66–96%",
    meaning:
      "More than half the Moon is lit as the cycle moves toward culmination.",
  },
  {
    key: "full_moon",
    range: "97–100%",
    meaning:
      "The lunar disk is fully illuminated, marking the brightest and most visible phase.",
  },
  {
    key: "waning_gibbous",
    range: "96–66%",
    meaning:
      "Illumination begins to decrease, traditionally connected with reflection and sharing results.",
  },
  {
    key: "last_quarter",
    range: "about 50%",
    meaning:
      "Half the disk is illuminated from the opposite side, a phase of review and release.",
  },
  {
    key: "waning_crescent",
    range: "33–3%",
    meaning:
      "The final morning crescent closes the cycle and leads toward the next New Moon.",
  },
];

function dateEn(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Tbilisi",
  }).format(date);
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
            <span className="text-3xl">
              {event.kind === "new" ? "🌑" : "🌕"}
            </span>
            <div>
              <p className="font-semibold">{dateEn(event.date)}</p>
              <p className="mt-1 text-sm text-foreground/70">
                {event.snapshot.signSymbol} {event.snapshot.signEn} · Tbilisi
                date
              </p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export async function MoonCalendarPageEn() {
  const now = new Date();
  const year = tbilisiCalendarParts(now).year;
  const copy = moonCalendarEnCopy(year);
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
      q: "What Moon phase is it today?",
      a: today
        ? `Today the Moon is in its ${PHASE_LABEL_EN[today.phaseKey]} phase, approximately ${Math.round(today.illumination * 100)}% illuminated, and moving through ${today.signEn}.`
        : "Today's phase updates automatically at the top of this page.",
    },
    {
      q: "When is the next Full Moon?",
      a: upcomingFull[0]
        ? `The next Full Moon peaks on ${dateEn(upcomingFull[0].date)}, in ${upcomingFull[0].snapshot.signEn}.`
        : "The next date will appear automatically.",
    },
    {
      q: "When is the next New Moon?",
      a: upcomingNew[0]
        ? `The next New Moon peaks on ${dateEn(upcomingNew[0].date)}, in ${upcomingNew[0].snapshot.signEn}.`
        : "The next date will appear automatically.",
    },
    {
      q: "How long is a complete lunar cycle?",
      a: "The average time from one New Moon to the next is about 29.5 days. An exact phase peaks at a single moment, while visible change happens gradually.",
    },
    {
      q: "What is the difference between a lunar day and a Moon phase?",
      a: "A phase describes the visible portion of the illuminated lunar disk. A lunar day counts days since the most recent New Moon, usually from 1 through 29 or 30.",
    },
  ];
  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      url: `${SITE}${PATH}`,
      name: copy.title,
      description: copy.description,
      inLanguage: "en",
      dateModified: now.toISOString(),
      about: { "@type": "Thing", name: "Moon phases" },
    },
    breadcrumbLd([
      { name: "Home", url: SITE },
      { name: "Moon calendar", url: `${SITE}${PATH}` },
    ]),
    faqLd(faq),
  ];
  return (
    <main
      lang="en"
      className="relative isolate flex min-h-screen flex-col overflow-hidden"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_220/0.45),transparent_70%)]"
      />
      <Starfield count={120} shooting={3} />
      <SmartHeader locale="en" georgianPath={PATH} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeLd(ld) }}
      />
      <article className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-12">
        <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/">Home</Link>
          <span>/</span>
          <span className="text-foreground/80">Moon calendar</span>
        </nav>
        <header className="mb-8 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            <Moon className="size-3.5" />
            Lunar rhythm
          </div>
          <h1 className="font-display mt-2 text-balance text-4xl font-medium tracking-tight sm:text-5xl">
            Moon Calendar <Accent>{year}</Accent>
          </h1>
          <p className="mt-4 text-pretty text-base leading-7 text-foreground/85 sm:text-lg">
            Today’s Moon phase and zodiac sign, upcoming New and Full Moon
            dates, and a daily 30-day lunar overview.
          </p>
        </header>
        {today && (
          <section className="mb-10 rounded-3xl border border-[var(--vivida-violet)]/35 bg-[var(--vivida-violet)]/10 p-5 ring-1 ring-foreground/5 sm:p-7">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Updated daily
            </p>
            <h2 className="font-display mt-2 text-2xl font-medium sm:text-3xl">
              What Moon phase is it today?
            </h2>
            <p className="mt-3 text-lg leading-8 text-foreground/90">
              Today, <strong>{dateEn(now)}</strong>, the Moon is in its{" "}
              <strong>{PHASE_LABEL_EN[today.phaseKey]}</strong> phase. It is{" "}
              <strong>
                {Math.round(today.illumination * 100)}% illuminated
              </strong>{" "}
              in{" "}
              <strong>
                {today.signSymbol} {today.signEn}
              </strong>
              .
            </p>
            <dl className="mt-5 grid gap-3 sm:grid-cols-3">
              <Stat
                label="Lunar day"
                value={`${lunarDayFromAge(today.ageDays)}`}
                note="Counted from the New Moon"
              />
              <Stat
                label="Next New Moon"
                value={upcomingNew[0] ? dateEn(upcomingNew[0].date) : "—"}
                note="Tbilisi calendar date"
              />
              <Stat
                label="Next Full Moon"
                value={upcomingFull[0] ? dateEn(upcomingFull[0].date) : "—"}
                note="Tbilisi calendar date"
              />
            </dl>
          </section>
        )}
        <div className="mb-10">
          <PopularTools locale="en" placement="moon_after_today" publicEntry />
        </div>
        <section className="mb-14">
          <h2 className="font-display text-3xl font-medium">
            Upcoming New and Full Moons
          </h2>
          <p className="mt-3 max-w-3xl leading-7 text-foreground/80">
            Dates are calculated from the project’s ephemeris and shown for
            Tbilisi. Open an event for its exact time, illumination, zodiac
            sign, and practical guide.
          </p>
          <div className="mt-8 grid gap-10 lg:grid-cols-2">
            <section>
              <h3 className="text-2xl font-semibold">New Moon dates</h3>
              <EventList
                events={upcomingNew.slice(0, 12)}
                label="Upcoming New Moons"
              />
              <Link
                href="/akhali-mtvare"
                className="mt-4 inline-flex items-center gap-2 text-sm text-[var(--vivida-violet)]"
              >
                Complete New Moon calendar <ArrowRight className="size-4" />
              </Link>
            </section>
            <section>
              <h3 className="text-2xl font-semibold">Full Moon dates</h3>
              <EventList
                events={upcomingFull.slice(0, 12)}
                label="Upcoming Full Moons"
              />
              <Link
                href="/savse-mtvare"
                className="mt-4 inline-flex items-center gap-2 text-sm text-[var(--vivida-violet)]"
              >
                Complete Full Moon calendar <ArrowRight className="size-4" />
              </Link>
            </section>
          </div>
        </section>
        <section className="mb-14">
          <h2 className="font-display text-3xl font-medium">
            The next 30 days
          </h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {days.map(
              ({ date, snapshot }) =>
                snapshot && (
                  <div
                    key={date.toISOString()}
                    className="rounded-2xl border border-border bg-card/50 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">
                        {SYMBOL[snapshot.phaseKey]}
                      </span>
                      <div>
                        <p className="font-semibold">{dateEn(date)}</p>
                        <p className="text-sm text-foreground/75">
                          {PHASE_LABEL_EN[snapshot.phaseKey]}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Lunar day {lunarDayFromAge(snapshot.ageDays)} ·{" "}
                          {snapshot.signSymbol} {snapshot.signEn} ·{" "}
                          {Math.round(snapshot.illumination * 100)}%
                        </p>
                      </div>
                    </div>
                  </div>
                ),
            )}
          </div>
        </section>
        <section className="mb-14">
          <h2 className="font-display text-3xl font-medium">
            The eight Moon phases
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {PHASES.map((phase) => (
              <div
                key={phase.key}
                className="rounded-2xl border border-border bg-card/50 p-5"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{SYMBOL[phase.key]}</span>
                  <div>
                    <h3 className="font-semibold">
                      {PHASE_LABEL_EN[phase.key]}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {phase.range} illuminated
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-6 text-foreground/78">
                  {phase.meaning}
                </p>
              </div>
            ))}
          </div>
        </section>
        <section className="mb-14 max-w-3xl">
          <h2 className="font-display text-3xl font-medium">
            Frequently asked questions
          </h2>
          <div className="mt-5 space-y-4">
            {faq.map((item) => (
              <details
                key={item.q}
                className="rounded-2xl border border-border bg-card/45 p-5"
              >
                <summary className="cursor-pointer font-semibold">
                  {item.q}
                </summary>
                <p className="mt-3 leading-7 text-foreground/80">{item.a}</p>
              </details>
            ))}
          </div>
        </section>
        <div className="rounded-2xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/12 via-card/60 to-[var(--vivida-cyan)]/12 p-7 text-center sm:p-10">
          <Sparkles className="mx-auto mb-3 size-7 text-[var(--vivida-violet)]" />
          <h2 className="font-display text-balance text-2xl font-medium sm:text-3xl">
            Find your Moon sign
          </h2>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            Your birth date, exact time, and location reveal the zodiac sign
            occupied by the Moon when you were born.
          </p>
          <Button asChild variant="mystic" size="lg" className="mt-6">
            <Link href="/natal-chart">Calculate my birth chart</Link>
          </Button>
        </div>
      </article>
      <SiteFooter locale="en" />
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
    <div className="rounded-xl border border-border/70 bg-background/25 p-4">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-semibold tabular-nums">{value}</dd>
      <dd className="text-xs text-muted-foreground">{note}</dd>
    </div>
  );
}
