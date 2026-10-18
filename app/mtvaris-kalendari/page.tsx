import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { unstable_cache } from "next/cache";
import { ArrowRight, Moon, Sparkles } from "lucide-react";

import { Starfield } from "@/components/landing/starfield";
import { LunarPhaseDisc } from "@/components/brand/celestial-icons";
import { PaidNextStep } from "@/components/seo/paid-next-step";
import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { Button } from "@/components/ui/button";
import { TrackedPublicLink } from "@/components/seo/tracked-public-link";
import { PopularTools } from "@/components/nav/popular-tools";
import {
  computeMoonPhase,
  type MoonPhaseSnapshot,
  type PhaseKey,
} from "@/lib/moon-phase";
import {
  creditPacksForCountry,
  formatBillingAmount,
} from "@/lib/billing-config";
import { CREDIT_COST } from "@/lib/credits-config";
import {
  LUNAR_DAY_NOTES,
  PHASE_GUIDE,
  lunarDayFromAge,
} from "@/lib/seo/moon-reference";
import { breadcrumbLd, faqLd, serializeLd } from "@/lib/seo/jsonld";
import {
  moonCalendarEnCopy,
  MoonCalendarPageEn,
} from "@/components/seo/moon-calendar-en";

import { getRequestLocale } from "@/lib/i18n/request-locale";
import { tbilisiCalendarParts, tbilisiNoonUtc } from "@/lib/moon-calendar-date";
import {
  englishSiteHref,
  DEFAULT_OG_IMAGE,
  localizedAlternates,
} from "@/lib/seo/locales";

const SITE_URL = "https://www.vivida.ge";
const PAGE_URL = `${SITE_URL}/mtvaris-kalendari`;
const DAY_MS = 24 * 60 * 60 * 1000;

const titleForYear = (year: number) =>
  `მთვარის კალენდარი ${year}, მთვარე დღეს, ფაზა და ნიშანი`;
/**
 * The Latin spelling is in the description on purpose: GSC shows this page
 * sitting at position ~9 for "mtvaris kalendari" (168 impressions / 1 click
 * in 28 days). The hypothesis is that people who type Latin don't recognise
 * an all-Georgian snippet, so Google has nothing to bold for them. Keeping
 * the token here, not in the title, tests that without uglifying the SERP
 * line for the far larger Georgian-script audience.
 */
const descriptionForYear = (year: number) =>
  `მთვარის კალენდარი ${year} (mtvaris kalendari): რომელ ფაზაშია მთვარე დღეს, რომელ ნიშანშია და რამდენად არის განათებული. ახალი და სავსე მთვარის თარიღები საქართველოს დროით, თვე-თვე.`;

function kaMetadata(year: number): Metadata {
  const title = titleForYear(year);
  const description = descriptionForYear(year);
  return {
    title: { absolute: title },
    description,
    keywords: [
      "მთვარის კალენდარი",
      `მთვარის კალენდარი ${year}`,
      `მთვარის დღეების კალენდარი ${year}`,
      "მთვარე დღეს",
      "მთვარის ფაზა დღეს",
      "მთვარის ფაზები",
      "ახალი მთვარის კალენდარი",
      "ახალი მთვარე კალენდარი",
      "სავსე მთვარის კალენდარი",
      `სავსე მთვარე რომელ რიცხვშია ${year}`,
      "mtvaris kalendari",
    ],
    alternates: localizedAlternates(
      "/mtvaris-kalendari",
      "/mtvaris-kalendari",
      "ka",
    ),
    robots: { index: true, follow: true },
    openGraph: {
      images: [DEFAULT_OG_IMAGE],
      type: "website",
      url: PAGE_URL,
      title,
      description,
      siteName: "Vivida",
      locale: "ka_GE",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export async function generateMetadata(): Promise<Metadata> {
  await connection();
  const currentYear = tbilisiCalendarParts(new Date()).year;
  const locale = await getRequestLocale();
  if (locale === "ka") return kaMetadata(currentYear);
  if (locale === "en") {
    const path = "/mtvaris-kalendari";
    const { title, description } = moonCalendarEnCopy(currentYear);
    return {
      title: { absolute: title },
      description,
      keywords: [
        "moon calendar",
        `moon calendar ${currentYear}`,
        "moon phase today",
        "next full moon",
        "next new moon",
      ],
      alternates: localizedAlternates(path, path, "en"),
      openGraph: {
        images: [DEFAULT_OG_IMAGE],
        type: "website",
        url: englishSiteHref(path, false),
        title,
        description,
        siteName: "Vivida",
        locale: "en_US",
      },
      twitter: { card: "summary_large_image", title, description },
    };
  }
  return kaMetadata(currentYear);
}

const MONTHS_KA = [
  "იანვარი",
  "თებერვალი",
  "მარტი",
  "აპრილი",
  "მაისი",
  "ივნისი",
  "ივლისი",
  "აგვისტო",
  "სექტემბერი",
  "ოქტომბერი",
  "ნოემბერი",
  "დეკემბერი",
];
const WEEKDAYS_KA = ["კვ", "ორშ", "სამ", "ოთხ", "ხუთ", "პარ", "შაბ"];
const PHASE_SYMBOL: Record<PhaseKey, string> = {
  new_moon: "🌑",
  waxing_crescent: "🌒",
  first_quarter: "🌓",
  waxing_gibbous: "🌔",
  full_moon: "🌕",
  waning_gibbous: "🌖",
  last_quarter: "🌗",
  waning_crescent: "🌘",
};

type Day = { date: Date; snapshot: MoonPhaseSnapshot | null };
type MajorEvent = {
  kind: "new" | "full";
  date: Date;
  snapshot: MoonPhaseSnapshot;
};

function formatDateKa(date: Date, includeYear = true) {
  const p = tbilisiCalendarParts(date);
  return `${p.day} ${MONTHS_KA[p.month]}${includeYear ? ` ${p.year}` : ""}`;
}

const SYNODIC_MONTH_MS = 29.530588853 * DAY_MS;
const KNOWN_NEW_MOON_MS = Date.UTC(2000, 0, 6, 18, 14);

function eventScore(
  snapshot: MoonPhaseSnapshot | null,
  kind: MajorEvent["kind"],
) {
  if (!snapshot) return -1;
  return kind === "full" ? snapshot.illumination : 1 - snapshot.illumination;
}

/** Selects the strongest daily sample around a mean-lunation estimate. */
function refineEvent(estimate: Date, kind: MajorEvent["kind"]) {
  let best = estimate;
  let bestScore = -1;
  for (let offset = -2; offset <= 2; offset++) {
    const candidate = new Date(estimate.getTime() + offset * DAY_MS);
    const score = eventScore(computeMoonPhase(candidate), kind);
    if (score > bestScore) {
      best = candidate;
      bestScore = score;
    }
  }
  return best;
}

/** Seeds each lunation from a known epoch, then refines it with project ephemerides. */
function majorEventsForYears(startYear: number, endYear: number): MajorEvent[] {
  const start = Date.UTC(startYear, 0, 1) - 2 * DAY_MS;
  const end = Date.UTC(endYear + 1, 0, 1) + 2 * DAY_MS;
  const firstCycle =
    Math.floor((start - KNOWN_NEW_MOON_MS) / SYNODIC_MONTH_MS) - 1;
  const lastCycle = Math.ceil((end - KNOWN_NEW_MOON_MS) / SYNODIC_MONTH_MS) + 1;
  const events: MajorEvent[] = [];
  for (let cycle = firstCycle; cycle <= lastCycle; cycle++) {
    for (const kind of ["new", "full"] as const) {
      const offset = kind === "new" ? 0 : SYNODIC_MONTH_MS / 2;
      const estimate = new Date(
        KNOWN_NEW_MOON_MS + cycle * SYNODIC_MONTH_MS + offset,
      );
      const date = refineEvent(estimate, kind);
      const snapshot = computeMoonPhase(date);
      const year = tbilisiCalendarParts(date).year;
      if (snapshot && year >= startYear && year <= endYear)
        events.push({ kind, date, snapshot });
    }
  }
  return events.sort((a, b) => a.date.getTime() - b.date.getTime());
}

// Keep the expensive, year-stable ephemeris in Next's persistent data cache.
// Dates are serialized explicitly because cached values may cross processes.
const cachedAnnualEvents = unstable_cache(
  async (year: number) =>
    majorEventsForYears(year, year + 1).map(({ date, ...event }) => ({
      ...event,
      dateIso: date.toISOString(),
    })),
  ["moon-calendar-annual-v1"],
  { revalidate: 30 * 86400 },
);

function EventList({ events, label }: { events: MajorEvent[]; label: string }) {
  return (
    <ul
      aria-label={label}
      className="mt-4 grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2"
    >
      {events.map((event) => (
        <li
          key={`${event.kind}-${event.date.toISOString()}`}
          className="bg-card p-4"
        >
          <div className="flex items-start gap-3">
            <span
              aria-hidden
              className="grid size-10 shrink-0 place-items-center rounded-sm border border-border bg-background/60"
            >
              <LunarPhaseDisc
                phaseKey={event.kind === "new" ? "new_moon" : "full_moon"}
                size={26}
              />
            </span>
            <div>
              <p className="font-mono text-sm font-semibold tabular-nums text-foreground">
                {formatDateKa(event.date)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                საქართველოს დრო · {event.snapshot.signSymbol}{" "}
                {event.snapshot.signKa}-ში
              </p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default async function MoonCalendarPage() {
  await connection();
  const locale = await getRequestLocale();
  if (locale === "en") return <MoonCalendarPageEn />;
  const now = new Date();
  const currentYear = tbilisiCalendarParts(now).year;
  const title = titleForYear(currentYear);
  const description = descriptionForYear(currentYear);
  const todayNoonUtc = tbilisiNoonUtc(now);
  const todaySnapshot = computeMoonPhase(now);
  const days: Day[] = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(todayNoonUtc.getTime() + i * DAY_MS);
    return { date, snapshot: computeMoonPhase(date) };
  });
  const annualEvents = (await cachedAnnualEvents(currentYear)).map(
    ({ dateIso, ...event }) => ({ ...event, date: new Date(dateIso) }),
  );
  const yearEvents = annualEvents.filter(
    (event) => tbilisiCalendarParts(event.date).year === currentYear,
  );
  const newMoons = yearEvents.filter((event) => event.kind === "new");
  const fullMoons = yearEvents.filter((event) => event.kind === "full");
  const nextNew = annualEvents.find(
    (event) => event.kind === "new" && event.date >= now,
  );
  const nextFull = annualEvents.find(
    (event) => event.kind === "full" && event.date >= now,
  );

  const faq = [
    {
      q: "მთვარის რომელი ფაზაა დღეს?",
      a: todaySnapshot
        ? `${formatDateKa(now)}-ს მთვარის ფაზაა ${todaySnapshot.phaseLabelKa}; განათებულია დაახლოებით ${Math.round(todaySnapshot.illumination * 100)}% და მთვარე ${todaySnapshot.signKa}-შია.`
        : "დღევანდელი ფაზა კალენდრის ზედა ნაწილში ყოველდღიურად ახლდება.",
    },
    {
      q: `სავსე მთვარე რომელ რიცხვშია ${currentYear} წელს?`,
      a: `${currentYear} წლის სავსე მთვარის ყველა თარიღი მოცემულია ამ გვერდის „სავსე მთვარის თარიღების“ სექციაში. უახლოესი სავსე მთვარეა ${nextFull ? formatDateKa(nextFull.date) : "კალენდარში მითითებულ თარიღში"}.`,
    },
    {
      q: "როდის არის შემდეგი ახალი მთვარე?",
      a: nextNew
        ? `შემდეგი ახალი მთვარეა ${formatDateKa(nextNew.date)}, საქართველოს კალენდარული თარიღით, ${nextNew.snapshot.signKa}-ში.`
        : "თარიღი კალენდარში ყოველდღიურად ახლდება.",
    },
    {
      q: "რამდენ ხანს გრძელდება მთვარის სრული ციკლი?",
      a: "ახალი მთვარიდან მომდევნო ახალ მთვარემდე საშუალოდ 29.5 დღე გადის. ფაზის ზუსტი პიკი კონკრეტული მომენტია, თუმცა ვიზუალურად ცვლილება თანდათანობით ჩანს.",
    },
    {
      q: "რამდენი ფაზა აქვს მთვარეს?",
      a: `მთვარეს რვა ფაზა აქვს: ${PHASE_GUIDE.map((p) => p.labelKa).join(", ")}. თითოეულის განათების დიაპაზონი და მნიშვნელობა ამ გვერდის „მთვარის ფაზები“ სექციაშია.`,
    },
    {
      q: "რა განსხვავებაა მთვარის დღესა და მთვარის ფაზას შორის?",
      a: "მთვარის ფაზა აღწერს, დისკოს რა ნაწილი ჩანს განათებული, სულ რვა ფაზაა. მთვარის დღე კი ახალი მთვარიდან გასული დღეების ნომერია და 1-დან 29-ან 30-მდე იცვლება. ერთი ფაზა რამდენიმე მთვარის დღეს მოიცავს.",
    },
    {
      q: "დღეს მერამდენე მთვარის დღეა?",
      a: todaySnapshot
        ? `დღეს ${lunarDayFromAge(todaySnapshot.ageDays)}-ე მთვარის დღეა. ნომერი ყოველდღიურად ახლდება, ხოლო მომდევნო 30 დღის მთვარის დღეები კალენდრის სიაშია მითითებული.`
        : "მთვარის დღის ნომერი გვერდის ზედა ნაწილში ყოველდღიურად ახლდება.",
    },
    {
      q: "mtvaris kalendari და მთვარის კალენდარი ერთსა და იმავეს ნიშნავს?",
      a: "დიახ. „mtvaris kalendari“ ქართული ფრაზის ლათინური ასოებით დაწერილი ფორმაა; ამ გვერდზე ორივე ძიების შესაბამისი ინფორმაციაა ქართულად.",
    },
  ];

  const webPageLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": PAGE_URL,
    url: PAGE_URL,
    name: title,
    description,
    inLanguage: "ka-GE",
    dateModified: now.toISOString(),
    about: { "@type": "Thing", name: "მთვარის ფაზები" },
  };
  const ld = [
    webPageLd,
    breadcrumbLd([
      { name: "მთავარი", url: SITE_URL },
      { name: "მთვარის კალენდარი", url: PAGE_URL },
    ]),
    faqLd(faq),
  ];

  return (
    <main className="relative isolate flex min-h-screen flex-col overflow-hidden bg-background">
      <Starfield count={48} />
      <SmartHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeLd(ld) }}
      />

      <article className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-16 pt-8 sm:px-6 sm:pb-24 sm:pt-12">
        <nav
          aria-label="სანავიგაციო ბილიკი"
          className="mb-8 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground"
        >
          <Link href="/" className="hover:text-foreground">
            მთავარი
          </Link>
          <span aria-hidden>/</span>
          <span aria-current="page" className="text-foreground/80">
            მთვარის კალენდარი
          </span>
        </nav>

        <header className="mb-8 border-b border-border pb-8">
          <div className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
            <Moon aria-hidden className="size-3.5" />
            ცის რიტმი · მთვარის ეფემერიდა
          </div>
          <h1 className="mt-2 text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            მთვარის კალენდარი{" "}
            <span className="font-mono text-primary">{currentYear}</span>
          </h1>
          <p className="mt-4 max-w-2xl text-pretty text-[15px] leading-relaxed text-muted-foreground sm:text-base">
            მთვარის დღეების კალენდარი: დღევანდელი ფაზა, განათება და ზოდიაქოს
            ნიშანი, სრული წლის ახალი და სავსე მთვარის თარიღები, ასევე მომდევნო
            30 დღის ყოველდღიური მიმოხილვა.
          </p>
        </header>

        <nav
          aria-label="მთვარის კალენდრის სექციები"
          className="mb-8 inline-flex flex-wrap rounded-md border border-border bg-card p-1"
        >
          {[
            ["#moon-today", "დღეს"],
            ["#next-days", "შემდეგი 30 დღე"],
            ["#year-calendar", "ახალი და სავსე მთვარე"],
          ].map(([href, label]) => (
            <TrackedPublicLink
              key={href}
              href={href}
              event="moon"
              target={href.slice(1)}
              feature="moon_calendar"
              surface="section_nav"
              className="rounded-sm px-4 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground"
            >
              {label}
            </TrackedPublicLink>
          ))}
        </nav>

        {todaySnapshot && (
          <section
            aria-labelledby="moon-today"
            className="mb-10 rounded-md border border-border bg-card p-6 sm:p-8"
          >
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
                  დღევანდელი ტელემეტრია · განახლებულია ყოველდღიურად
                </p>
                <h2
                  id="moon-today"
                  className="mt-2 scroll-mt-24 text-2xl font-semibold tracking-tight sm:text-3xl"
                >
                  მთვარის რომელი ფაზაა დღეს?
                </h2>
                <p className="mt-3 text-base leading-relaxed text-foreground/90 sm:text-lg">
                  დღეს, <strong className="font-mono">{formatDateKa(now)}</strong>,
                  მთვარის ფაზაა <strong>{todaySnapshot.phaseLabelKa}</strong>.
                  განათებულია{" "}
                  <strong className="font-mono tabular-nums text-primary">
                    {Math.round(todaySnapshot.illumination * 100)}%
                  </strong>{" "}
                  და მდებარეობს{" "}
                  <strong>
                    {todaySnapshot.signSymbol} {todaySnapshot.signKa}-ში
                  </strong>
                  .
                </p>
              </div>
              <div className="shrink-0">
                <LunarPhaseDisc
                  phaseAngle={todaySnapshot.phaseAngle}
                  size={72}
                />
              </div>
            </div>
            <dl className="mt-6 grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-3">
              <div className="bg-background/60 p-4">
                <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  დღეს მთვარის დღეა
                </dt>
                <dd className="mt-1.5 font-mono text-lg font-semibold tabular-nums text-foreground">
                  {lunarDayFromAge(todaySnapshot.ageDays)}-ე
                </dd>
                <dd className="mt-0.5 text-xs text-muted-foreground">
                  ახალი მთვარიდან დათვლილი
                </dd>
              </div>
              <div className="bg-background/60 p-4">
                <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  უახლოესი ახალი მთვარე
                </dt>
                <dd className="mt-1.5 font-mono text-lg font-semibold tabular-nums text-foreground">
                  {nextNew ? formatDateKa(nextNew.date) : "—"}
                </dd>
                <dd className="mt-0.5 text-xs text-muted-foreground">
                  საქართველოს კალენდარული თარიღი
                </dd>
              </div>
              <div className="bg-background/60 p-4">
                <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  უახლოესი სავსე მთვარე
                </dt>
                <dd className="mt-1.5 font-mono text-lg font-semibold tabular-nums text-foreground">
                  {nextFull ? formatDateKa(nextFull.date) : "—"}
                </dd>
                <dd className="mt-0.5 text-xs text-muted-foreground">
                  საქართველოს კალენდარული თარიღი
                </dd>
              </div>
            </dl>
          </section>
        )}

        <div className="mb-10">
          <PaidNextStep
            title="კალენდარი ყველასია, პროგნოზი კი შენი"
            body="ფაზა და მთვარის დღე საერთო ცაა. პირადი პროგნოზი მას შენს ნატალურ რუკას ადარებს და გეუბნება, ეს კვირა შენთვის რას ნიშნავს."
            ctaHref="/signup?next=%2Fdashboard"
            ctaLabel="მიიღე პირადი პროგნოზი"
            priceNote={`7-დღიანი პროგნოზი ${CREDIT_COST.weeklyForecast} კრედიტი · კრედიტები ${formatBillingAmount(creditPacksForCountry("GE")[0].amountMinor, "gel", "ka")}-დან, ერთჯერადად`}
          />
        </div>

        <div className="mb-12">
          <PopularTools placement="moon_after_today" publicEntry />
        </div>

        <section aria-labelledby="year-calendar" className="mb-16">
          <h2
            id="year-calendar"
            className="scroll-mt-24 text-2xl font-semibold tracking-tight sm:text-3xl"
          >
            {currentYear} წლის მთვარის კალენდარი
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            ქვემოთ მოცემულია წლის ყველა ახალი და სავსე მთვარის გამოთვლილი თარიღი
            და ზოდიაქოს ნიშანი საქართველოსთვის. არსებული ძრავა დღიური სიზუსტით
            მუშაობს, ამიტომ საათს არ ვუთითებთ.
          </p>
          <div className="mt-8 grid gap-10 lg:grid-cols-2">
            <section aria-labelledby="new-moon-dates">
              <h3 id="new-moon-dates" className="text-xl font-semibold">
                ახალი მთვარის თარიღები
              </h3>
              <EventList
                events={newMoons}
                label={`${currentYear} წლის ახალი მთვარის კალენდარი`}
              />
              <Link
                href="/akhali-mtvare"
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                ახალი მთვარის სრული კალენდარი და მნიშვნელობა{" "}
                <ArrowRight aria-hidden className="size-4" />
              </Link>
            </section>
            <section aria-labelledby="full-moon-dates">
              <h3 id="full-moon-dates" className="text-xl font-semibold">
                სავსე მთვარის თარიღები
              </h3>
              <EventList
                events={fullMoons}
                label={`${currentYear} წლის სავსე მთვარის კალენდარი`}
              />
              <Link
                href="/savse-mtvare"
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                სავსე მთვარის სრული კალენდარი და მნიშვნელობა{" "}
                <ArrowRight aria-hidden className="size-4" />
              </Link>
            </section>
          </div>
        </section>

        <section aria-labelledby="next-days" className="mb-16">
          <h2
            id="next-days"
            className="scroll-mt-24 text-2xl font-semibold tracking-tight sm:text-3xl"
          >
            მთვარის ფაზები · შემდეგი 30 დღე
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            ყოველდღიური სია აჩვენებს რვაფაზიან კატეგორიას და მთვარის ზოდიაქოს
            ნიშანს. ფაზის ზუსტი პიკებისთვის გამოიყენე ზემოთ მოცემული წლიური
            თარიღები.
          </p>
          <ul className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-3 md:grid-cols-5">
            {days.map((day) => {
              const p = tbilisiCalendarParts(day.date);
              const snapshot = day.snapshot;
              return (
                <li
                  key={day.date.toISOString()}
                  className="bg-card p-3.5"
                >
                  <div className="flex items-baseline justify-between gap-1.5 border-b border-border/60 pb-2">
                    <time
                      dateTime={`${p.year}-${String(p.month + 1).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`}
                      className="font-mono text-base font-semibold tabular-nums text-foreground"
                    >
                      {p.day}
                    </time>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      {MONTHS_KA[p.month]} · {WEEKDAYS_KA[p.weekday]}
                    </span>
                  </div>
                  {snapshot ? (
                    <div className="mt-2.5 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                        <LunarPhaseDisc
                          phaseAngle={snapshot.phaseAngle}
                          size={18}
                        />
                        <span className="truncate">{snapshot.phaseLabelKa}</span>
                      </div>
                      <p className="text-[11px] text-primary">
                        {snapshot.signSymbol} {snapshot.signKa}
                      </p>
                      <p className="font-mono text-[10px] tabular-nums text-muted-foreground">
                        {lunarDayFromAge(snapshot.ageDays)}-ე მთვარის დღე
                      </p>
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-muted-foreground">—</p>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        {/* Eight-phase reference */}
        <section aria-labelledby="phase-guide" className="mb-16">
          <h2
            id="phase-guide"
            className="text-2xl font-semibold tracking-tight sm:text-3xl"
          >
            მთვარის ფაზები · რვავე ფაზა თანმიმდევრობით
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            სრული ციკლი დაახლოებით 29.5 დღეს გრძელდება და რვა ფაზას მოიცავს.
            თითოეულთან მითითებულია განათების დიაპაზონი, ციკლის რომელ დღეებზე
            მოდის და რას ნიშნავს ტრადიციულად.
          </p>
          <div className="mt-6 grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2">
            {PHASE_GUIDE.map((p) => (
              <article
                key={p.key}
                className={`p-5 ${todaySnapshot?.phaseKey === p.key ? "bg-secondary/45" : "bg-card"}`}
              >
                <div className="flex items-center gap-3.5">
                  <LunarPhaseDisc phaseKey={p.key} size={32} />
                  <div className="min-w-0">
                    <h3 className="font-semibold tracking-tight text-foreground">
                      {p.labelKa}
                    </h3>
                    <p className="font-mono text-[11px] tabular-nums text-muted-foreground">
                      {p.labelEn} · {p.illuminationKa} · {p.daysKa}
                    </p>
                  </div>
                  {todaySnapshot?.phaseKey === p.key && (
                    <span className="ml-auto shrink-0 font-mono text-[10px] uppercase tracking-[0.16em] text-primary">
                      ● დღეს
                    </span>
                  )}
                </div>
                <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
                  {p.meaningKa}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* Lunar days */}
        <section aria-labelledby="lunar-days" className="mb-16">
          <h2
            id="lunar-days"
            className="text-2xl font-semibold tracking-tight sm:text-3xl"
          >
            მთვარის დღეები · რა არის და როგორ ითვლება
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            მთვარის დღე ფაზის სინონიმი არ არის. ეს ახალი მთვარიდან გასული
            დღეების ათვლაა: ახალი მთვარის დღეს იწყება პირველი მთვარის დღე და
            ციკლი 29-ე ან 30-ე დღეს სრულდება.
          </p>
          <div className="mt-6 grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2">
            {LUNAR_DAY_NOTES.map((d) => (
              <article key={d.range} className="bg-card p-5">
                <div className="flex items-baseline gap-2.5">
                  <span className="rounded-sm border border-border bg-background/60 px-2 py-0.5 font-mono text-xs font-semibold tabular-nums text-primary">
                    {d.range}
                  </span>
                  <h3 className="font-semibold tracking-tight text-foreground">
                    {d.titleKa}
                  </h3>
                </div>
                <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
                  {d.bodyKa}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mb-16 grid gap-px overflow-hidden rounded-md border border-border bg-border md:grid-cols-2">
          <div className="bg-card p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-foreground">
              რას ნიშნავს მთვარის ფაზები
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
              მთვარის ფაზა არის დედამიწიდან დანახული განათებული ნაწილის
              ცვლილება. ციკლი იწყება ახალი მთვარით, გადის მზარდ ნამგალს, პირველ
              მეოთხედსა და მზარდ გიბუსს, აღწევს სავსე მთვარეს და შემდეგ კლებადი
              გიბუსის, ბოლო მეოთხედისა და კლებადი ნამგლის გავლით კვლავ ახალ
              მთვარეს უბრუნდება.
            </p>
          </div>
          <div className="bg-card p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-foreground">
              როგორ გამოვიყენოთ მთვარის კალენდარი
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
              ასტრონომიული დაკვირვებისთვის შეარჩიე ფაზა: სუსტი მთვარის შუქი
              ბნელი ცის სანახავად გამოგადგება, სავსე მთვარე კი თავად მთვარის
              მარტივად დასაკვირვებლად. ასტროლოგიურ პრაქტიკაში ზოგი ადამიანი ახალ
              მთვარეს მიზნების დასახვას, სავსეს კი შეჯამებას უკავშირებს, ეს
              სიმბოლური ტრადიციაა.
            </p>
          </div>
        </section>

        <section className="mb-16 rounded-md border border-border bg-card p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-foreground">
            ასტრონომიული მონაცემი და ასტროლოგიური ინტერპრეტაცია
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
            <strong className="text-foreground">
              ასტრონომიული მონაცემებია
            </strong>{" "}
            ფაზის პიკის დრო, განათების პროცენტი და მთვარის ცაზე მდებარეობა.{" "}
            <strong className="text-foreground">
              ასტროლოგიური ინტერპრეტაცია
            </strong>{" "}
            კი ფაზასა და ზოდიაქოს ნიშანს სიმბოლურ მნიშვნელობას ანიჭებს; ის
            მეცნიერულ პროგნოზად ან მნიშვნელოვანი გადაწყვეტილების ერთადერთ
            საფუძვლად არ უნდა მივიჩნიოთ.
          </p>
        </section>

        <aside
          aria-labelledby="related-guides"
          className="mb-16"
        >
          <h2 id="related-guides" className="mb-4 text-xl font-semibold">
            დაკავშირებული კალენდრები და გზამკვლევები
          </h2>
          <nav
            aria-label="მთვარესთან დაკავშირებული გვერდები"
            className="grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2 lg:grid-cols-3"
          >
            {[
              ["/akhali-mtvare", "ახალი მთვარის კალენდარი"],
              ["/savse-mtvare", "სავსე მთვარის კალენდარი"],
              ["/astrologiuri-kalendari", "დღის ასტროლოგიური კალენდარი"],
              ["/dabnelebebi", "მზისა და მთვარის დაბნელებები"],
              ["/nataluri-ruka", "ნატალური რუკა და მთვარის ნიშანი"],
              ["/zodiac/mtvare", "მთვარე ზოდიაქოს ნიშნებში"],
            ].map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className="flex items-center justify-between bg-card px-4 py-3.5 text-sm text-foreground transition-colors hover:bg-secondary/45"
              >
                <span>{label}</span>
                <ArrowRight aria-hidden className="size-4 text-muted-foreground" />
              </Link>
            ))}
          </nav>
        </aside>

        <section aria-labelledby="faq-heading" className="mb-16 max-w-3xl">
          <h2
            id="faq-heading"
            className="mb-4 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground"
          >
            ხშირად დასმული კითხვები
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
              ნატალური რუკა
            </p>
            <h2 className="mt-2 text-balance text-2xl font-semibold tracking-tight">
              იპოვე შენი მთვარის ნიშანი
            </h2>
            <p className="mt-2 text-pretty text-sm text-muted-foreground">
              დაბადების თარიღი, ზუსტი დრო და ადგილი გვიჩვენებს, რომელ ნიშანში იყო
              მთვარე შენი დაბადებისას.
            </p>
          </div>
          <Button asChild size="lg" className="shrink-0">
            <Link href="/nataluri-ruka">ნატალური რუკის შექმნა</Link>
          </Button>
        </div>
      </article>
      <SiteFooter />
    </main>
  );
}
