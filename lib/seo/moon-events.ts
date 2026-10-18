import { computeMoonPhase, type MoonPhaseSnapshot } from "@/lib/moon-phase";
import { tbilisiCalendarParts } from "@/lib/moon-calendar-date";

export type MoonEventKind = "new" | "full";

export type MoonEvent = {
  kind: MoonEventKind;
  iso: string;
  date: Date;
  label: string;
  exactTimeKa: string;
  snapshot: MoonPhaseSnapshot;
};

export type Eclipse = {
  slug: string;
  date: string;
  type: "solar" | "lunar";
  subtype: string;
  title: string;
  description: string;
  visibility: string;
  source: string;
};

export const MOON_EVENT_DAYS = 365;
export const SITEMAP_MOON_EVENT_DAYS = 180;

const MONTHS_KA_GEN = [
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

const DAY_MS = 86400000;
const SYNODIC_MONTH_MS = 29.530588853 * DAY_MS;
const KNOWN_NEW_MOON_MS = Date.UTC(2000, 0, 6, 18, 14);

export function moonEvents(
  kind: MoonEventKind,
  days = MOON_EVENT_DAYS,
  fromDate: Date = new Date(),
): MoonEvent[] {
  const startMs = fromDate.getTime() - 2 * DAY_MS;
  const endMs = fromDate.getTime() + days * DAY_MS;
  const firstCycle = Math.floor((startMs - KNOWN_NEW_MOON_MS) / SYNODIC_MONTH_MS) - 1;
  const lastCycle = Math.ceil((endMs - KNOWN_NEW_MOON_MS) / SYNODIC_MONTH_MS) + 1;
  const results: MoonEvent[] = [];

  for (let cycle = firstCycle; cycle <= lastCycle; cycle++) {
    const offset = kind === "new" ? 0 : SYNODIC_MONTH_MS / 2;
    const estimate = new Date(KNOWN_NEW_MOON_MS + cycle * SYNODIC_MONTH_MS + offset);
    if (estimate.getTime() < startMs || estimate.getTime() > endMs) continue;
    const snapshot = computeMoonPhase(estimate);
    if (!snapshot) continue;
    const parts = tbilisiCalendarParts(estimate);
    const iso = `${parts.year}-${String(parts.month + 1).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
    const label = `${parts.day} ${MONTHS_KA_GEN[parts.month]} ${parts.year}`;
    const exactTimeKa = `${ new Intl.DateTimeFormat("ka-GE", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Tbilisi",
    }).format(estimate)} (თბილისის დროით)`;
    results.push({
      kind,
      iso,
      date: estimate,
      label,
      exactTimeKa,
      snapshot,
    });
  }

  return results;
}

export function moonEventForDate(
  kind: MoonEventKind,
  iso: string,
): MoonEvent | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return undefined;
  const target = new Date(`${iso}T12:00:00+04:00`);
  if (Number.isNaN(target.getTime())) return undefined;
  const windowStart = new Date(target.getTime() - 20 * DAY_MS);
  const candidates = moonEvents(kind, 45, windowStart);
  const exact = candidates.find((c) => c.iso === iso);
  if (exact) return exact;
  const snapshot = computeMoonPhase(target);
  if (!snapshot) return undefined;
  const parts = tbilisiCalendarParts(target);
  return {
    kind,
    iso,
    date: target,
    label: `${parts.day} ${MONTHS_KA_GEN[parts.month]} ${parts.year}`,
    exactTimeKa: "12:00 (თბილისის დროით)",
    snapshot,
  };
}

export const ECLIPSES: Eclipse[] = [
  {
    slug: "2026-08-12-solar-eclipse",
    date: "2026-08-12",
    type: "solar",
    subtype: "სრული",
    title: "2026 წლის 12 აგვისტოს მზის სრული დაბნელება",
    description:
      "მზის სრული დაბნელება, რომელიც გაივლის არქტიკას, გრენლანდიას, ისლანდიასა და ესპანეთს, ხოლო ნაწილობრივი ფაზა გამოჩნდება ევროპის დიდ ნაწილში.",
    visibility:
      "სრული ფაზა: გრენლანდია, ისლანდია, ესპანეთი. ნაწილობრივი ფაზა: ევროპა და ჩრდილოეთ აფრიკა.",
    source: "https://science.nasa.gov/eclipses/",
  },
  {
    slug: "2026-08-28-lunar-eclipse",
    date: "2026-08-28",
    type: "lunar",
    subtype: "ნაწილობრივი",
    title: "2026 წლის 28 აგვისტოს მთვარის ნაწილობრივი დაბნელება",
    description:
      "ღრმა ნაწილობრივი მთვარის დაბნელება თევზების ნიშანში, რომელიც ხილული იქნება ევროპაში, აფრიკასა და ამერიკაში.",
    visibility:
      "ევროპა, აფრიკა, ჩრდილოეთ და სამხრეთ ამერიკა, დასავლეთ აზია.",
    source: "https://science.nasa.gov/eclipses/",
  },
  {
    slug: "2027-02-06-solar-eclipse",
    date: "2027-02-06",
    type: "solar",
    subtype: "რგოლისებრი",
    title: "2027 წლის 6 თებერვლის მზის რგოლისებრი დაბნელება",
    description:
      "რგოლისებრი მზის დაბნელება მერწყულის ნიშანში სამხრეთ ამერიკისა და დასავლეთ აფრიკის თავზე.",
    visibility: "სამხრეთ ამერიკა, ატლანტის ოკეანე, დასავლეთ და სამხრეთ აფრიკა.",
    source: "https://science.nasa.gov/eclipses/",
  },
  {
    slug: "2027-08-02-solar-eclipse",
    date: "2027-08-02",
    type: "solar",
    subtype: "სრული",
    title: "2027 წლის 2 აგვისტოს მზის სრული დაბნელება",
    description:
      "21-ე საუკუნის ერთ-ერთი ყველაზე ხანგრძლივი სრული მზის დაბნელება, რომლის ნაწილობრივი ფაზა საქართველოდანაც ხილული იქნება.",
    visibility:
      "სრული ფაზა: სამხრეთ ესპანეთი, ჩრდილოეთ აფრიკა, ახლო აღმოსავლეთი. ნაწილობრივი ფაზა: საქართველო, მთელი ევროპა და დასავლეთ აზია.",
    source: "https://science.nasa.gov/eclipses/",
  },
];
