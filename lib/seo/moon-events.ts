import {
  computeMoonPhase,
  utcDateString,
  type MoonPhaseSnapshot,
} from "@/lib/moon-phase";
import {
  MONTHS_KA,
  dateIso,
  parseCalendarDate,
} from "@/lib/seo/astrology-calendar";

export type MoonEventKind = "full" | "new";
export type MoonEvent = {
  kind: MoonEventKind;
  date: Date;
  iso: string;
  label: string;
  snapshot: MoonPhaseSnapshot;
  exactTimeKa: string;
};
const eventCache = new Map<string, MoonEvent[]>();
const eventSnapshotCache = new Map<string, MoonPhaseSnapshot | null>();

/** Moon event scans use noon-UTC transits, even for hourly refine candidates. */
function eventSnapshot(date: Date): MoonPhaseSnapshot | null {
  const key = utcDateString(date);
  if (eventSnapshotCache.has(key)) return eventSnapshotCache.get(key) ?? null;
  const snapshot = computeMoonPhase(date);
  if (eventSnapshotCache.size >= 512) eventSnapshotCache.clear();
  eventSnapshotCache.set(key, snapshot);
  return snapshot;
}

/**
 * Publish detail pages only when an event is close enough to be useful. The
 * previous 550-day window created many orphan-like future URLs that Google
 * discovered but did not crawl.
 */
export const MOON_EVENT_DAYS = 210;

/** The sitemap prioritises roughly the next four lunations of each kind. */
export const SITEMAP_MOON_EVENT_DAYS = 120;

function tbilisiStart(asOf: Date) {
  const iso = new Date(asOf.getTime() + 4 * 3600000).toISOString().slice(0, 10);
  return new Date(`${iso}T00:00:00Z`);
}

function closeness(snapshot: MoonPhaseSnapshot | null, kind: MoonEventKind) {
  if (!snapshot) return -1;
  return kind === "full" ? snapshot.illumination : 1 - snapshot.illumination;
}

function refine(day: Date, kind: MoonEventKind) {
  let best = new Date(day);
  let bestValue = -1;
  for (let hour = -18; hour <= 42; hour++) {
    const at = new Date(day.getTime() + hour * 3600000);
    const value = closeness(eventSnapshot(at), kind);
    if (value > bestValue) {
      bestValue = value;
      best = at;
    }
  }
  return best;
}

export function moonEvents(
  kind: MoonEventKind,
  days = MOON_EVENT_DAYS,
  asOf = new Date(),
) {
  const start = tbilisiStart(asOf);
  const cacheKey = `${kind}-${days}-${start.toISOString()}`;
  const cached = eventCache.get(cacheKey);
  if (cached) return cached;
  const samples = Array.from({ length: days + 2 }, (_, i) => {
    const date = new Date(start);
    date.setUTCDate(date.getUTCDate() + i - 1);
    date.setUTCHours(12, 0, 0, 0);
    return { date, value: closeness(eventSnapshot(date), kind) };
  });
  const events: MoonEvent[] = [];
  for (let i = 1; i < samples.length - 1; i++) {
    if (
      samples[i].value < samples[i - 1].value ||
      samples[i].value < samples[i + 1].value ||
      samples[i].value < 0.985
    )
      continue;
    const exact = refine(samples[i].date, kind);
    const local = new Date(exact.getTime() + 4 * 3600000);
    const iso = dateIso(local);
    if (events.some((event) => event.iso === iso)) continue;
    const snapshot = eventSnapshot(exact);
    if (!snapshot) continue;
    events.push({
      kind,
      date: exact,
      iso,
      label: `${local.getUTCDate()} ${MONTHS_KA[local.getUTCMonth()]} ${local.getUTCFullYear()}`,
      snapshot,
      exactTimeKa: `${String(local.getUTCHours()).padStart(2, "0")}:${String(local.getUTCMinutes()).padStart(2, "0")} (თბილისის დრო)`,
    });
  }
  if (eventCache.size > 12) eventCache.clear();
  eventCache.set(cacheKey, events);
  return events;
}

/**
 * Resolve a detail URL from its own date rather than today's upcoming list.
 * That list intentionally has a short discovery horizon, but a URL already
 * published or linked must keep working after the event passes. The focused
 * seven-day scan still verifies that the requested date is an actual event.
 */
export function moonEventForDate(
  kind: MoonEventKind,
  iso: string,
): MoonEvent | null {
  const date = parseCalendarDate(iso);
  if (!date) return null;

  // The site began publishing these pages in 2026. Keep requests within a
  // useful calendar range so malformed or extreme years never reach the
  // ephemeris calculation.
  const year = date.getUTCFullYear();
  if (year < 2026 || year > 2100) return null;

  date.setUTCDate(date.getUTCDate() - 3);
  return moonEvents(kind, 7, date).find((event) => event.iso === iso) ?? null;
}

export type Eclipse = {
  slug: string;
  date: string;
  title: string;
  type: "solar" | "lunar";
  subtype: string;
  visibility: string;
  description: string;
  source: string;
};

/** NASA eclipse catalogs, upcoming from July 2026 through 2028. */
export const ECLIPSES: Eclipse[] = [
  {
    slug: "2026-08-12-mzis-sruli-dabneleba",
    date: "2026-08-12",
    title: "მზის სრული დაბნელება — 12 აგვისტო 2026",
    type: "solar",
    subtype: "სრული",
    visibility:
      "სრული ფაზა: გრენლანდია, ისლანდია, ესპანეთი, რუსეთი და პორტუგალიის მცირე ნაწილი; ნაწილობრივი ფაზა — ევროპისა და სხვა ფართო რეგიონებიდან.",
    description: "მთვარე მზის დისკოს სრულად ფარავს სრული ფაზის ვიწრო ზოლში.",
    source:
      "https://science.nasa.gov/eclipses/future-eclipses/total-solar-eclipse-on-august-12-2026/",
  },
  {
    slug: "2026-08-28-mtvaris-nawilobrivi-dabneleba",
    date: "2026-08-28",
    title: "მთვარის ნაწილობრივი დაბნელება — 28 აგვისტო 2026",
    type: "lunar",
    subtype: "ნაწილობრივი",
    visibility: "აღმოსავლეთ წყნარი ოკეანე, ამერიკა, ევროპა და აფრიკა.",
    description: "მთვარის ნაწილი დედამიწის მთავარ ჩრდილში შევა.",
    source: "https://science.nasa.gov/moon/eclipses/",
  },
  {
    slug: "2027-02-06-mzis-rgolisebri-dabneleba",
    date: "2027-02-06",
    title: "მზის რგოლისებრი დაბნელება — 6 თებერვალი 2027",
    type: "solar",
    subtype: "რგოლისებრი",
    visibility:
      "ჩილე, არგენტინა და ატლანტიკა; ნაწილობრივი ფაზა სამხრეთ ამერიკისა და აფრიკის ნაწილებში.",
    description:
      "მთვარე მზეს ცენტრში ფარავს, მაგრამ მზის ნათელი რგოლი ხილული რჩება.",
    source: "https://science.nasa.gov/eclipses/future-eclipses/",
  },
  {
    slug: "2027-02-20-mtvaris-naxevarchrdilovani-dabneleba",
    date: "2027-02-20",
    title: "მთვარის ნახევარჩრდილოვანი დაბნელება — 20 თებერვალი 2027",
    type: "lunar",
    subtype: "ნახევარჩრდილოვანი",
    visibility:
      "ამერიკა, ევროპა, აფრიკა, აზია, დასავლეთი ავსტრალია და ანტარქტიდა.",
    description: "მთვარე დედამიწის სუსტ გარე ჩრდილში გადის და ოდნავ ბნელდება.",
    source: "https://science.nasa.gov/moon/eclipses/",
  },
  {
    slug: "2027-07-18-mtvaris-naxevarchrdilovani-dabneleba",
    date: "2027-07-18",
    title: "მთვარის ნახევარჩრდილოვანი დაბნელება — 18 ივლისი 2027",
    type: "lunar",
    subtype: "ნახევარჩრდილოვანი",
    visibility: "ანტარქტიდა, ავსტრალია და ინდოეთის ოკეანის რეგიონი.",
    description:
      "ძალიან სუსტი ნახევარჩრდილოვანი დაბნელება, რომლის შემჩნევაც რთულია.",
    source: "https://eclipse.gsfc.nasa.gov/LEdecade/LEdecade2021.html",
  },
  {
    slug: "2027-08-02-mzis-sruli-dabneleba",
    date: "2027-08-02",
    title: "მზის სრული დაბნელება — 2 აგვისტო 2027",
    type: "solar",
    subtype: "სრული",
    visibility:
      "ესპანეთის სამხრეთი, ჩრდილოეთი აფრიკა, ახლო აღმოსავლეთი და არაბეთის ნახევარკუნძულის ნაწილი.",
    description:
      "ხანგრძლივი სრული მზის დაბნელება, ფართო ნაწილობრივი ხილვადობით.",
    source: "https://science.nasa.gov/eclipses/future-eclipses/",
  },
  {
    slug: "2027-08-17-mtvaris-naxevarchrdilovani-dabneleba",
    date: "2027-08-17",
    title: "მთვარის ნახევარჩრდილოვანი დაბნელება — 17 აგვისტო 2027",
    type: "lunar",
    subtype: "ნახევარჩრდილოვანი",
    visibility: "წყნარი ოკეანის რეგიონი და მიმდებარე ტერიტორიები.",
    description: "მთვარის სიკაშკაშე დედამიწის ნახევარჩრდილში მცირედ იცვლება.",
    source: "https://eclipse.gsfc.nasa.gov/LEdecade/LEdecade2021.html",
  },
  {
    slug: "2028-01-12-mtvaris-nawilobrivi-dabneleba",
    date: "2028-01-12",
    title: "მთვარის ნაწილობრივი დაბნელება — 12 იანვარი 2028",
    type: "lunar",
    subtype: "ნაწილობრივი",
    visibility: "ამერიკა, ევროპა და აფრიკა.",
    description: "მთვარის მცირე ნაწილი დედამიწის მთავარ ჩრდილში შევა.",
    source: "https://eclipse.gsfc.nasa.gov/LEdecade/LEdecade2021.html",
  },
  {
    slug: "2028-01-26-mzis-rgolisebri-dabneleba",
    date: "2028-01-26",
    title: "მზის რგოლისებრი დაბნელება — 26 იანვარი 2028",
    type: "solar",
    subtype: "რგოლისებრი",
    visibility:
      "ეკვადორი, პერუ, ბრაზილია, სურინამი, ესპანეთი და პორტუგალია; ნაწილობრივი ფაზა უფრო ფართო რეგიონში.",
    description: "მთვარის გარშემო მზის ნათელი რგოლი რჩება.",
    source: "https://eclipse.gsfc.nasa.gov/SEdecade/SEdecade2021.html",
  },
  {
    slug: "2028-07-06-mtvaris-nawilobrivi-dabneleba",
    date: "2028-07-06",
    title: "მთვარის ნაწილობრივი დაბნელება — 6 ივლისი 2028",
    type: "lunar",
    subtype: "ნაწილობრივი",
    visibility: "ევროპა, აფრიკა, აზია და ავსტრალია.",
    description: "დედამიწის მთავარი ჩრდილი მთვარის დისკოს ნაწილს დაფარავს.",
    source: "https://eclipse.gsfc.nasa.gov/LEdecade/LEdecade2021.html",
  },
  {
    slug: "2028-07-22-mzis-sruli-dabneleba",
    date: "2028-07-22",
    title: "მზის სრული დაბნელება — 22 ივლისი 2028",
    type: "solar",
    subtype: "სრული",
    visibility:
      "ავსტრალია და ახალი ზელანდია; ნაწილობრივი ფაზა სამხრეთ-აღმოსავლეთ აზიისა და წყნარი ოკეანის ნაწილებში.",
    description: "სრული დაბნელების ზოლში მზის კორონა გამოჩნდება.",
    source:
      "https://eclipse.gsfc.nasa.gov/SEgoogle/SEgoogle2001/SE2028Jul22Tgoogle.html",
  },
  {
    slug: "2028-12-31-mtvaris-sruli-dabneleba",
    date: "2028-12-31",
    title: "მთვარის სრული დაბნელება — 31 დეკემბერი 2028",
    type: "lunar",
    subtype: "სრული",
    visibility: "ევროპა, აფრიკა, აზია, ავსტრალია და წყნარი ოკეანე.",
    description:
      "მთვარე მთლიანად შევა დედამიწის მთავარ ჩრდილში და მოწითალო შეფერილობა შეიძლება მიიღოს.",
    source: "https://eclipse.gsfc.nasa.gov/LEdecade/LEdecade2021.html",
  },
];
