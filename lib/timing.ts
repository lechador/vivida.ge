/**
 * "Know-when" timing engine — scores the next N days for the user and surfaces
 * notable upcoming transits. Fully deterministic (reuses the transit + cross-
 * aspect machinery), so it's instant, free, and consistent with the weekly
 * forecast's scoring philosophy.
 */
import type { NatalChartJson } from "@/db/schema";
import { computeTransits, detectCrossAspects, localDateString } from "./transits";
import { ASPECTS, type AspectFamily } from "./aspects";

const ASPECT_FAMILY: Record<string, AspectFamily> = Object.fromEntries(
  ASPECTS.map((a) => [a.kind, a.family])
);
const TENSE_CONJ = new Set(["mars", "saturn", "pluto"]);
const HARMONIC_CONJ = new Set(["venus", "jupiter", "sun", "moon"]);

const POINT_WEIGHT: Record<string, number> = {
  sun: 1.6,
  moon: 1.6,
  ascendant: 1.4,
  midheaven: 1.3,
  mercury: 1.2,
  venus: 1.2,
  mars: 1.2,
};

/**
 * Transit-planet weight for the DAILY score. Fast movers (esp. the Moon) drive
 * day-to-day variation so the calendar isn't a monochrome block; slow heavy
 * transits (Saturn/Pluto) are de-emphasized here — they get their due in the
 * "notable transits" list instead of painting every day the same color.
 */
const TRANSIT_WEIGHT: Record<string, number> = {
  moon: 1.3,
  sun: 1.0,
  mercury: 1.0,
  venus: 1.0,
  mars: 0.9,
  jupiter: 0.6,
  saturn: 0.5,
  uranus: 0.4,
  neptune: 0.4,
  pluto: 0.4,
};

const WEEKDAYS_KA = ["კვ", "ორ", "სამ", "ოთხ", "ხუთ", "პარ", "შაბ"];
const MONTHS_KA = [
  "იანვარი", "თებერვალი", "მარტი", "აპრილი", "მაისი", "ივნისი",
  "ივლისი", "აგვისტო", "სექტემბერი", "ოქტომბერი", "ნოემბერი", "დეკემბერი",
];

export type DayTier = "great" | "good" | "calm" | "tough";

export type TimingDay = {
  dateIso: string; // YYYY-MM-DD (user TZ)
  dom: number; // day of month
  weekdayKa: string;
  score: number; // -100..100
  tier: DayTier;
};

export type NotableTransit = {
  dateIso: string;
  dateLabelKa: string; // "12 ივლისი"
  transit: string;
  natal: string;
  kind: string;
  family: AspectFamily;
  title: string; // "ვენერა ტრინი მთვარესთან"
  meaning: string;
};

const TRANSIT_KA: Record<string, string> = {
  venus: "ვენერა",
  mars: "მარსი",
  jupiter: "იუპიტერი",
  saturn: "სატურნი",
};
const NATAL_KA: Record<string, string> = {
  sun: "მზე",
  moon: "მთვარე",
  mercury: "მერკური",
  venus: "ვენერა",
  mars: "მარსი",
  ascendant: "ამომავალი",
  midheaven: "MC",
};
const KIND_KA: Record<string, string> = {
  conjunction: "კონიუნქცია",
  sextile: "სექსტილი",
  square: "კვადრატი",
  trine: "ტრინი",
  opposition: "ოპოზიცია",
};
const PLANET_MEANING: Record<string, string> = {
  venus: "სიყვარულის, ჰარმონიისა და სიამოვნების ენერგია",
  mars: "ენერგიის, ინიციატივისა და მოქმედების ბიძგი",
  jupiter: "ზრდის, შესაძლებლობებისა და იღბლის ტალღა",
  saturn: "პასუხისმგებლობის, სტრუქტურისა და გამოცდის პერიოდი",
};
const NATAL_AREA: Record<string, string> = {
  sun: "შენს ვინაობასა და სასიცოცხლო ენერგიას",
  moon: "შენს ემოციებსა და შინაგან სამყაროს",
  mercury: "შენს აზროვნებასა და კომუნიკაციას",
  venus: "შენს სიყვარულსა და ფასეულობებს",
  mars: "შენს მოქმედებასა და ენერგიას",
  ascendant: "შენს იმიჯსა და თვითგამოხატვას",
  midheaven: "შენს კარიერასა და საზოგადოებრივ როლს",
};
const FAMILY_TONE: Record<AspectFamily, string> = {
  harmonic: "ხელშემწყობი მომენტია — ისარგებლე.",
  tense: "შესაძლო დაძაბულობა — იყავი მოქნილი და მომთმენი.",
  neutral: "მნიშვნელოვანი აქცენტი — მიაქციე ყურადღება.",
};

const NOTABLE_TRANSITS = new Set(["venus", "mars", "jupiter", "saturn"]);
const NOTABLE_NATALS = new Set([
  "sun", "moon", "mercury", "venus", "mars", "ascendant", "midheaven",
]);

function familyOf(transit: string, kind: string): AspectFamily {
  if (kind === "conjunction") {
    if (TENSE_CONJ.has(transit)) return "tense";
    if (HARMONIC_CONJ.has(transit)) return "harmonic";
    return "neutral";
  }
  return ASPECT_FAMILY[kind] ?? "neutral";
}

function tierFor(score: number): DayTier {
  if (score >= 35) return "great";
  if (score >= 14) return "good";
  if (score > -28) return "calm"; // mild swings read as calm/neutral, not "bad"
  return "tough"; // reserved for genuinely tense days
}

export function computeTiming(
  natal: NatalChartJson,
  startDate: Date,
  timezone: string,
  days = 28
): { days: TimingDay[]; notable: NotableTransit[] } {
  const natalPoints: Record<string, { longitude: number }> = {};
  for (const [k, v] of Object.entries(natal.bodies)) {
    natalPoints[k] = { longitude: v.longitude };
  }
  if (natal.ascendant) natalPoints.ascendant = { longitude: natal.ascendant.longitude };
  if (natal.midheaven) natalPoints.midheaven = { longitude: natal.midheaven.longitude };

  const out: TimingDay[] = [];
  // (transit,natal,kind) → tightest occurrence in the window
  const notableMap = new Map<string, { item: NotableTransit; orb: number }>();

  for (let i = 0; i < days; i++) {
    const at = new Date(startDate);
    at.setUTCHours(12, 0, 0, 0);
    at.setUTCDate(at.getUTCDate() + i);

    const transits = computeTransits(at);
    const aspects = detectCrossAspects(transits, natalPoints).filter((a) => a.orb <= 5);

    let harmony = 0;
    let challenge = 0;
    for (const a of aspects.slice(0, 12)) {
      const fam = familyOf(a.transit, a.kind);
      const w =
        a.intensity * (POINT_WEIGHT[a.natal] ?? 1) * (TRANSIT_WEIGHT[a.transit] ?? 0.6);
      if (fam === "harmonic") harmony += w;
      else if (fam === "tense") challenge += w;
      else {
        harmony += w * 0.5;
        challenge += w * 0.5;
      }
    }
    const total = harmony + challenge;
    const score = total > 0 ? Math.round(((harmony - challenge) / total) * 100) : 0;

    const dateIso = localDateString(at, timezone);
    const local = new Date(`${dateIso}T12:00:00Z`);
    out.push({
      dateIso,
      dom: local.getUTCDate(),
      weekdayKa: WEEKDAYS_KA[local.getUTCDay()],
      score,
      tier: tierFor(score),
    });

    // Collect near-exact notable transits.
    for (const a of aspects) {
      if (a.orb > 1.3) continue;
      if (!NOTABLE_TRANSITS.has(a.transit) || !NOTABLE_NATALS.has(a.natal)) continue;
      const key = `${a.transit}-${a.natal}-${a.kind}`;
      const prev = notableMap.get(key);
      if (prev && prev.orb <= a.orb) continue;
      const fam = familyOf(a.transit, a.kind);
      notableMap.set(key, {
        orb: a.orb,
        item: {
          dateIso,
          dateLabelKa: `${local.getUTCDate()} ${MONTHS_KA[local.getUTCMonth()]}`,
          transit: a.transit,
          natal: a.natal,
          kind: a.kind,
          family: fam,
          title: `${TRANSIT_KA[a.transit]} ${KIND_KA[a.kind]} ${NATAL_KA[a.natal]}-თან`,
          meaning: `${PLANET_MEANING[a.transit]} ხვდება ${NATAL_AREA[a.natal]}. ${FAMILY_TONE[fam]}`,
        },
      });
    }
  }

  const notable = [...notableMap.values()]
    .sort((a, b) => a.item.dateIso.localeCompare(b.item.dateIso))
    .slice(0, 8)
    .map((e) => e.item);

  return { days: out, notable };
}
