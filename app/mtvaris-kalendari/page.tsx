import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Moon, Sparkles } from "lucide-react";

import { Starfield } from "@/components/landing/starfield";
import { ReportPromo } from "@/components/report/report-promo";
import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { Button } from "@/components/ui/button";
import { computeMoonPhase, type MoonPhaseSnapshot, type PhaseKey } from "@/lib/moon-phase";
import { PopularSearches } from "@/components/seo/popular-searches";
import {
  LUNAR_DAY_NOTES,
  MOON_LATIN_QUERIES,
  PHASE_GUIDE,
  lunarDayFromAge,
} from "@/lib/seo/moon-reference";
import { breadcrumbLd, faqLd, serializeLd } from "@/lib/seo/jsonld";
import { MOON_CALENDAR_EN, MoonCalendarPageEn } from "@/components/seo/moon-calendar-en";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { DEFAULT_OG_IMAGE, localizedAlternates } from "@/lib/seo/locales";

const SITE_URL = "https://www.vivida.ge";
const PAGE_URL = `${SITE_URL}/mtvaris-kalendari`;
const TBILISI_OFFSET_MS = 4 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export const revalidate = 86400;

const CURRENT_YEAR = new Date(Date.now() + TBILISI_OFFSET_MS).getUTCFullYear();
const TITLE = `მთვარის კალენდარი ${CURRENT_YEAR} — მთვარე დღეს, ფაზა და ნიშანი`;
/**
 * The Latin spelling is in the description on purpose: GSC shows this page
 * sitting at position ~9 for "mtvaris kalendari" (168 impressions / 1 click
 * in 28 days). The hypothesis is that people who type Latin don't recognise
 * an all-Georgian snippet, so Google has nothing to bold for them. Keeping
 * the token here — not in the title — tests that without uglifying the SERP
 * line for the far larger Georgian-script audience.
 */
const DESCRIPTION = `მთვარის კალენდარი ${CURRENT_YEAR} (mtvaris kalendari): რომელ ფაზაშია მთვარე დღეს, რომელ ნიშანშია და რამდენად არის განათებული. ახალი და სავსე მთვარის თარიღები საქართველოს დროით, თვე-თვე.`;

const KA_METADATA: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  keywords: [
    "მთვარის კალენდარი",
    `მთვარის კალენდარი ${CURRENT_YEAR}`,
    `მთვარის დღეების კალენდარი ${CURRENT_YEAR}`,
    "მთვარე დღეს",
    "მთვარის ფაზა დღეს",
    "მთვარის ფაზები",
    "ახალი მთვარის კალენდარი",
    "ახალი მთვარე კალენდარი",
    "სავსე მთვარის კალენდარი",
    `სავსე მთვარე რომელ რიცხვშია ${CURRENT_YEAR}`,
    "mtvaris kalendari",
  ],
  alternates: localizedAlternates("/mtvaris-kalendari", "/mtvaris-kalendari", "ka"),
  robots: { index: true, follow: true },
  openGraph: {
    images: [DEFAULT_OG_IMAGE],
    type: "website",
    url: PAGE_URL,
    title: TITLE,
    description: DESCRIPTION,
    siteName: "Vivida",
    locale: "ka_GE",
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  if (locale === "ka") return KA_METADATA;
  if (locale === "en") {
    const path = "/mtvaris-kalendari"; const { title, description } = MOON_CALENDAR_EN;
    return { title: { absolute: title }, description, keywords: ["moon calendar", `moon calendar ${CURRENT_YEAR}`, "moon phase today", "next full moon", "next new moon"], alternates: localizedAlternates(path, path, "en"), openGraph: { images: [DEFAULT_OG_IMAGE], type: "website", url: `https://www.vividaastro.com${path}`, title, description, siteName: "Vivida", locale: "en_US" }, twitter: { card: "summary_large_image", title, description } };
  }
  return KA_METADATA;
}

const MONTHS_KA = [
  "იანვარი", "თებერვალი", "მარტი", "აპრილი", "მაისი", "ივნისი",
  "ივლისი", "აგვისტო", "სექტემბერი", "ოქტომბერი", "ნოემბერი", "დეკემბერი",
];
const WEEKDAYS_KA = ["კვ", "ორშ", "სამ", "ოთხ", "ხუთ", "პარ", "შაბ"];
const PHASE_SYMBOL: Record<PhaseKey, string> = {
  new_moon: "🌑", waxing_crescent: "🌒", first_quarter: "🌓", waxing_gibbous: "🌔",
  full_moon: "🌕", waning_gibbous: "🌖", last_quarter: "🌗", waning_crescent: "🌘",
};

type Day = { date: Date; snapshot: MoonPhaseSnapshot | null };
type MajorEvent = { kind: "new" | "full"; date: Date; snapshot: MoonPhaseSnapshot };

function tbilisiParts(date: Date) {
  const local = new Date(date.getTime() + TBILISI_OFFSET_MS);
  return {
    year: local.getUTCFullYear(), month: local.getUTCMonth(), day: local.getUTCDate(),
    weekday: local.getUTCDay(), hour: local.getUTCHours(), minute: local.getUTCMinutes(),
  };
}

function formatDateKa(date: Date, includeYear = true) {
  const p = tbilisiParts(date);
  return `${p.day} ${MONTHS_KA[p.month]}${includeYear ? ` ${p.year}` : ""}`;
}

const SYNODIC_MONTH_MS = 29.530588853 * DAY_MS;
const KNOWN_NEW_MOON_MS = Date.UTC(2000, 0, 6, 18, 14);

function eventScore(snapshot: MoonPhaseSnapshot | null, kind: MajorEvent["kind"]) {
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
    if (score > bestScore) { best = candidate; bestScore = score; }
  }
  return best;
}

/** Seeds each lunation from a known epoch, then refines it with project ephemerides. */
function majorEventsForYears(startYear: number, endYear: number): MajorEvent[] {
  const start = Date.UTC(startYear, 0, 1) - 2 * DAY_MS;
  const end = Date.UTC(endYear + 1, 0, 1) + 2 * DAY_MS;
  const firstCycle = Math.floor((start - KNOWN_NEW_MOON_MS) / SYNODIC_MONTH_MS) - 1;
  const lastCycle = Math.ceil((end - KNOWN_NEW_MOON_MS) / SYNODIC_MONTH_MS) + 1;
  const events: MajorEvent[] = [];
  for (let cycle = firstCycle; cycle <= lastCycle; cycle++) {
    for (const kind of ["new", "full"] as const) {
      const offset = kind === "new" ? 0 : SYNODIC_MONTH_MS / 2;
      const estimate = new Date(KNOWN_NEW_MOON_MS + cycle * SYNODIC_MONTH_MS + offset);
      const date = refineEvent(estimate, kind);
      const snapshot = computeMoonPhase(date);
      const year = tbilisiParts(date).year;
      if (snapshot && year >= startYear && year <= endYear) events.push({ kind, date, snapshot });
    }
  }
  return events.sort((a, b) => a.date.getTime() - b.date.getTime());
}

function EventList({ events, label }: { events: MajorEvent[]; label: string }) {
  return (
    <ul aria-label={label} className="mt-5 grid gap-3 sm:grid-cols-2">
      {events.map((event) => (
        <li key={`${event.kind}-${event.date.toISOString()}`} className="rounded-2xl border border-border bg-card/50 p-4 ring-1 ring-foreground/5">
          <div className="flex items-start gap-3">
            <span aria-hidden className="text-3xl">{event.kind === "new" ? "🌑" : "🌕"}</span>
            <div>
              <p className="font-semibold">{formatDateKa(event.date)}</p>
              <p className="mt-1 text-sm text-foreground/70">საქართველოს კალენდარული თარიღი · {event.snapshot.signSymbol} {event.snapshot.signKa}-ში</p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default async function MoonCalendarPage() {
  if ((await getRequestLocale()) === "en") return <MoonCalendarPageEn />;
  const now = new Date();
  const localToday = tbilisiParts(now);
  const todayNoonUtc = new Date(Date.UTC(localToday.year, localToday.month, localToday.day, 8));
  const todaySnapshot = computeMoonPhase(now);
  const days: Day[] = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(todayNoonUtc.getTime() + i * DAY_MS);
    return { date, snapshot: computeMoonPhase(date) };
  });
  const annualEvents = majorEventsForYears(CURRENT_YEAR, CURRENT_YEAR + 1);
  const yearEvents = annualEvents.filter((event) => tbilisiParts(event.date).year === CURRENT_YEAR);
  const newMoons = yearEvents.filter((event) => event.kind === "new");
  const fullMoons = yearEvents.filter((event) => event.kind === "full");
  const nextNew = annualEvents.find((event) => event.kind === "new" && event.date >= now);
  const nextFull = annualEvents.find((event) => event.kind === "full" && event.date >= now);

  const faq = [
    {
      q: "მთვარის რომელი ფაზაა დღეს?",
      a: todaySnapshot
        ? `${formatDateKa(now)}-ს მთვარის ფაზაა ${todaySnapshot.phaseLabelKa}; განათებულია დაახლოებით ${Math.round(todaySnapshot.illumination * 100)}% და მთვარე ${todaySnapshot.signKa}-შია.`
        : "დღევანდელი ფაზა კალენდრის ზედა ნაწილში ყოველდღიურად ახლდება.",
    },
    {
      q: `სავსე მთვარე რომელ რიცხვშია ${CURRENT_YEAR} წელს?`,
      a: `${CURRENT_YEAR} წლის სავსე მთვარის ყველა თარიღი მოცემულია ამ გვერდის „სავსე მთვარის თარიღების“ სექციაში. უახლოესი სავსე მთვარეა ${nextFull ? formatDateKa(nextFull.date) : "კალენდარში მითითებულ თარიღში"}.`,
    },
    {
      q: "როდის არის შემდეგი ახალი მთვარე?",
      a: nextNew ? `შემდეგი ახალი მთვარეა ${formatDateKa(nextNew.date)}, საქართველოს კალენდარული თარიღით, ${nextNew.snapshot.signKa}-ში.` : "თარიღი კალენდარში ყოველდღიურად ახლდება.",
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
      a: "მთვარის ფაზა აღწერს, დისკოს რა ნაწილი ჩანს განათებული — სულ რვა ფაზაა. მთვარის დღე კი ახალი მთვარიდან გასული დღეების ნომერია და 1-დან 29-ან 30-მდე იცვლება. ერთი ფაზა რამდენიმე მთვარის დღეს მოიცავს.",
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
    name: TITLE,
    description: DESCRIPTION,
    inLanguage: "ka-GE",
    dateModified: now.toISOString(),
    about: { "@type": "Thing", name: "მთვარის ფაზები" },
  };
  const ld = [
    webPageLd,
    breadcrumbLd([{ name: "მთავარი", url: SITE_URL }, { name: "მთვარის კალენდარი", url: PAGE_URL }]),
    faqLd(faq),
  ];

  return (
    <main className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_220/0.45),transparent_70%)]" />
      <Starfield count={120} shooting={3} />
      <SmartHeader />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeLd(ld) }} />

      <article className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-12">
        <nav aria-label="სანავიგაციო ბილიკი" className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">მთავარი</Link><span aria-hidden>/</span>
          <span aria-current="page" className="text-foreground/80">მთვარის კალენდარი</span>
        </nav>

        <header className="mb-8 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground"><Moon aria-hidden className="size-3.5" />ცის რიტმი</div>
          <h1 className="mt-2 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            მთვარის კალენდარი <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">{CURRENT_YEAR}</span>
          </h1>
          <p className="mt-4 text-pretty text-base leading-7 text-foreground/85 sm:text-lg">მთვარის დღეების კალენდარი: დღევანდელი ფაზა, განათება და ზოდიაქოს ნიშანი, სრული წლის ახალი და სავსე მთვარის თარიღები, ასევე მომდევნო 30 დღის ყოველდღიური მიმოხილვა.</p>
        </header>

        {todaySnapshot && (
          <section aria-labelledby="moon-today" className="mb-10 rounded-3xl border border-[var(--vivida-violet)]/35 bg-[var(--vivida-violet)]/10 p-5 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-7">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">განახლებულია ყოველდღიურად</p>
            <h2 id="moon-today" className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">მთვარის რომელი ფაზაა დღეს?</h2>
            <p className="mt-3 text-lg leading-8 text-foreground/90">დღეს, <strong>{formatDateKa(now)}</strong>, მთვარის ფაზაა <strong>{todaySnapshot.phaseLabelKa}</strong>. განათებულია <strong>{Math.round(todaySnapshot.illumination * 100)}%</strong> და მდებარეობს <strong>{todaySnapshot.signSymbol} {todaySnapshot.signKa}-ში</strong>.</p>
            <dl className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-border/70 bg-background/25 p-4"><dt className="text-xs text-muted-foreground">დღეს მთვარის დღეა</dt><dd className="mt-1 font-semibold tabular-nums">{lunarDayFromAge(todaySnapshot.ageDays)}-ე</dd><dd className="text-xs text-muted-foreground">ახალი მთვარიდან დათვლილი</dd></div>
              <div className="rounded-xl border border-border/70 bg-background/25 p-4"><dt className="text-xs text-muted-foreground">უახლოესი ახალი მთვარე</dt><dd className="mt-1 font-semibold">{nextNew ? formatDateKa(nextNew.date) : "—"}</dd><dd className="text-xs text-muted-foreground">საქართველოს კალენდარული თარიღი</dd></div>
              <div className="rounded-xl border border-border/70 bg-background/25 p-4"><dt className="text-xs text-muted-foreground">უახლოესი სავსე მთვარე</dt><dd className="mt-1 font-semibold">{nextFull ? formatDateKa(nextFull.date) : "—"}</dd><dd className="text-xs text-muted-foreground">საქართველოს კალენდარული თარიღი</dd></div>
            </dl>
          </section>
        )}

        <section aria-labelledby="year-calendar" className="mb-14">
          <h2 id="year-calendar" className="text-3xl font-semibold tracking-tight">{CURRENT_YEAR} წლის მთვარის კალენდარი</h2>
          <p className="mt-3 max-w-3xl leading-7 text-foreground/80">ქვემოთ მოცემულია წლის ყველა ახალი და სავსე მთვარის გამოთვლილი თარიღი და ზოდიაქოს ნიშანი საქართველოსთვის. არსებული ძრავა დღიური სიზუსტით მუშაობს, ამიტომ საათს არ ვუთითებთ.</p>
          <div className="mt-8 grid gap-10 lg:grid-cols-2">
            <section aria-labelledby="new-moon-dates">
              <h3 id="new-moon-dates" className="text-2xl font-semibold">ახალი მთვარის თარიღები</h3>
              <EventList events={newMoons} label={`${CURRENT_YEAR} წლის ახალი მთვარის კალენდარი`} />
              <Link href="/akhali-mtvare" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[var(--vivida-violet)] hover:underline">ახალი მთვარის სრული კალენდარი და მნიშვნელობა <ArrowRight aria-hidden className="size-4" /></Link>
            </section>
            <section aria-labelledby="full-moon-dates">
              <h3 id="full-moon-dates" className="text-2xl font-semibold">სავსე მთვარის თარიღები</h3>
              <EventList events={fullMoons} label={`${CURRENT_YEAR} წლის სავსე მთვარის კალენდარი`} />
              <Link href="/savse-mtvare" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[var(--vivida-violet)] hover:underline">სავსე მთვარის სრული კალენდარი და მნიშვნელობა <ArrowRight aria-hidden className="size-4" /></Link>
            </section>
          </div>
        </section>

        <section aria-labelledby="next-days" className="mb-14">
          <h2 id="next-days" className="text-3xl font-semibold tracking-tight">მთვარის ფაზები — შემდეგი 30 დღე</h2>
          <p className="mt-3 max-w-3xl leading-7 text-foreground/80">ყოველდღიური სია აჩვენებს რვაფაზიან კატეგორიას და მთვარის ზოდიაქოს ნიშანს. ფაზის ზუსტი პიკებისთვის გამოიყენე ზემოთ მოცემული წლიური თარიღები.</p>
          <ul className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
            {days.map((day) => {
              const p = tbilisiParts(day.date); const snapshot = day.snapshot;
              return <li key={day.date.toISOString()} className="rounded-xl border border-border bg-card/45 p-3 ring-1 ring-foreground/5">
                <div className="flex items-baseline gap-1.5"><time dateTime={`${p.year}-${String(p.month + 1).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`} className="text-lg font-semibold tabular-nums">{p.day}</time><span className="text-[11px] text-muted-foreground">{MONTHS_KA[p.month]} · {WEEKDAYS_KA[p.weekday]}</span></div>
                {snapshot ? <><p className="mt-1 text-xs text-foreground/85"><span aria-hidden>{PHASE_SYMBOL[snapshot.phaseKey]}</span> {snapshot.phaseLabelKa}</p><p className="mt-1 text-[11px] text-[var(--vivida-cyan)]">{snapshot.signSymbol} {snapshot.signKa}</p><p className="mt-0.5 text-[11px] text-muted-foreground tabular-nums">{lunarDayFromAge(snapshot.ageDays)}-ე მთვარის დღე</p></> : <p className="mt-1 text-xs text-muted-foreground">—</p>}
              </li>;
            })}
          </ul>
        </section>

        {/* Eight-phase reference. The page ranked ~p16 for "მთვარის ფაზები"
            while only offering a single paragraph on it — this section is
            the actual answer to that query. */}
        <section aria-labelledby="phase-guide" className="mb-14">
          <h2 id="phase-guide" className="text-3xl font-semibold tracking-tight">მთვარის ფაზები — რვავე ფაზა თანმიმდევრობით</h2>
          <p className="mt-3 max-w-3xl leading-7 text-foreground/80">სრული ციკლი დაახლოებით 29.5 დღეს გრძელდება და რვა ფაზას მოიცავს. თითოეულთან მითითებულია განათების დიაპაზონი, ციკლის რომელ დღეებზე მოდის და რას ნიშნავს ტრადიციულად.</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {PHASE_GUIDE.map((p) => (
              <article key={p.key} className={`rounded-2xl border p-5 ring-1 ring-foreground/5 ${todaySnapshot?.phaseKey === p.key ? "border-[var(--vivida-violet)]/50 bg-[var(--vivida-violet)]/10" : "border-border bg-card/45"}`}>
                <div className="flex items-center gap-2.5">
                  <span aria-hidden className="text-2xl">{p.symbol}</span>
                  <div className="min-w-0">
                    <h3 className="font-semibold tracking-tight">{p.labelKa}</h3>
                    <p className="text-[11px] text-muted-foreground">{p.labelEn} · {p.illuminationKa} · {p.daysKa}</p>
                  </div>
                  {todaySnapshot?.phaseKey === p.key && <span className="ml-auto shrink-0 rounded-full bg-[var(--vivida-violet)]/20 px-2 py-0.5 text-[10px] font-medium text-[var(--vivida-violet)]">დღეს</span>}
                </div>
                <p className="mt-3 text-[14px] leading-relaxed text-foreground/85">{p.meaningKa}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Lunar days — a distinct traditional system the page never covered,
            yet it ranked ~p23 for "მთვარის დღეების კალენდარი". */}
        <section aria-labelledby="lunar-days" className="mb-14">
          <h2 id="lunar-days" className="text-3xl font-semibold tracking-tight">მთვარის დღეები — რა არის და როგორ ითვლება</h2>
          <p className="mt-3 max-w-3xl leading-7 text-foreground/80">მთვარის დღე ფაზის სინონიმი არ არის. ეს ახალი მთვარიდან გასული დღეების ათვლაა: ახალი მთვარის დღეს იწყება პირველი მთვარის დღე და ციკლი 29-ე ან 30-ე დღეს სრულდება. ზემოთ, 30-დღიან სიაში, თითოეულ თარიღთან სწორედ ეს ნომერია მითითებული.</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {LUNAR_DAY_NOTES.map((d) => (
              <article key={d.range} className="rounded-2xl border border-border bg-card/45 p-5 ring-1 ring-foreground/5">
                <div className="flex items-baseline gap-2.5">
                  <span className="rounded-lg bg-[var(--vivida-cyan)]/15 px-2.5 py-1 text-sm font-semibold tabular-nums text-[var(--vivida-cyan)]">{d.range}</span>
                  <h3 className="font-semibold tracking-tight">{d.titleKa}</h3>
                </div>
                <p className="mt-3 text-[14px] leading-relaxed text-foreground/85">{d.bodyKa}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mb-14 grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card/50 p-6"><h2 className="text-2xl font-semibold">რას ნიშნავს მთვარის ფაზები</h2><p className="mt-4 leading-8 text-foreground/80">მთვარის ფაზა არის დედამიწიდან დანახული განათებული ნაწილის ცვლილება. ციკლი იწყება ახალი მთვარით, გადის მზარდ ნამგალს, პირველ მეოთხედსა და მზარდ გიბუსს, აღწევს სავსე მთვარეს და შემდეგ კლებადი გიბუსის, ბოლო მეოთხედისა და კლებადი ნამგლის გავლით კვლავ ახალ მთვარეს უბრუნდება.</p></div>
          <div className="rounded-2xl border border-border bg-card/50 p-6"><h2 className="text-2xl font-semibold">როგორ გამოვიყენოთ მთვარის კალენდარი</h2><p className="mt-4 leading-8 text-foreground/80">ასტრონომიული დაკვირვებისთვის შეარჩიე ფაზა: სუსტი მთვარის შუქი ბნელი ცის სანახავად გამოგადგება, სავსე მთვარე კი თავად მთვარის მარტივად დასაკვირვებლად. ასტროლოგიურ პრაქტიკაში ზოგი ადამიანი ახალ მთვარეს მიზნების დასახვას, სავსეს კი შეჯამებას უკავშირებს — ეს სიმბოლური ტრადიციაა.</p></div>
        </section>

        <section className="mb-14 rounded-2xl border border-border bg-card/55 p-6 sm:p-8">
          <h2 className="text-2xl font-semibold">ასტრონომიული მონაცემი და ასტროლოგიური ინტერპრეტაცია</h2>
          <p className="mt-4 max-w-3xl leading-8 text-foreground/80"><strong className="text-foreground">ასტრონომიული მონაცემებია</strong> ფაზის პიკის დრო, განათების პროცენტი და მთვარის ცაზე მდებარეობა. <strong className="text-foreground">ასტროლოგიური ინტერპრეტაცია</strong> კი ფაზასა და ზოდიაქოს ნიშანს სიმბოლურ მნიშვნელობას ანიჭებს; ის მეცნიერულ პროგნოზად ან მნიშვნელოვანი გადაწყვეტილების ერთადერთ საფუძვლად არ უნდა მივიჩნიოთ.</p>
        </section>

        <aside aria-labelledby="related-guides" className="mb-14 rounded-2xl border border-border bg-card/55 p-6">
          <h2 id="related-guides" className="text-2xl font-semibold">დაკავშირებული კალენდრები და გზამკვლევები</h2>
          <nav aria-label="მთვარესთან დაკავშირებული გვერდები" className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["/akhali-mtvare", "ახალი მთვარის კალენდარი"], ["/savse-mtvare", "სავსე მთვარის კალენდარი"],
              ["/astrologiuri-kalendari", "დღის ასტროლოგიური კალენდარი"], ["/dabnelebebi", "მზისა და მთვარის დაბნელებები"],
              ["/nataluri-ruka", "ნატალური რუკა და მთვარის ნიშანი"], ["/zodiac/mtvare", "მთვარე ზოდიაქოს ნიშნებში"],
            ].map(([href, label]) => <Link key={href} href={href} className="flex items-center justify-between rounded-xl border border-border px-4 py-3 text-sm transition hover:border-[var(--vivida-violet)]/50 hover:bg-card/80"><span>{label}</span><ArrowRight aria-hidden className="size-4" /></Link>)}
          </nav>
        </aside>

        <section aria-labelledby="faq-heading" className="mb-14 max-w-3xl">
          <h2 id="faq-heading" className="text-3xl font-semibold tracking-tight">ხშირად დასმული კითხვები</h2>
          <div className="mt-5 space-y-4">{faq.map((item) => <details key={item.q} className="rounded-2xl border border-border bg-card/45 p-5"><summary className="cursor-pointer font-semibold">{item.q}</summary><p className="mt-3 leading-7 text-foreground/80">{item.a}</p></details>)}</div>
        </section>

        <PopularSearches queries={MOON_LATIN_QUERIES} className="mb-14 mt-0" />

        <ReportPromo className="mt-16" />
        <div className="mt-6 rounded-2xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/12 via-card/60 to-[var(--vivida-cyan)]/12 p-7 text-center ring-1 ring-foreground/5 sm:p-10">
          <Sparkles aria-hidden className="mx-auto mb-3 size-7 text-[var(--vivida-violet)]" />
          <h2 className="text-balance text-2xl font-semibold sm:text-3xl">იპოვე შენი მთვარის ნიშანი</h2>
          <p className="mx-auto mt-3 max-w-md text-pretty text-muted-foreground">დაბადების თარიღი, ზუსტი დრო და ადგილი გვიჩვენებს, რომელ ნიშანში იყო მთვარე შენი დაბადებისას.</p>
          <Button asChild variant="mystic" size="lg" className="mt-6"><Link href="/nataluri-ruka">ნატალური რუკის შექმნა</Link></Button>
        </div>
      </article>
      <SiteFooter />
    </main>
  );
}
