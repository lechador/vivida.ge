import { computeMundaneSky, type MundaneAspect, type MundaneSky } from "@/lib/mundane-sky";

/**
 * Keep the browsable calendar useful without publishing a large block of
 * low-demand future-date URLs. Individual days are deterministic, so a
 * rolling month gives readers enough planning range while keeping crawl
 * signals focused on dates that can earn impressions soon.
 */
export const CALENDAR_DAYS = 30;

/** Only the nearest dates get the stronger sitemap discovery signal. */
export const SITEMAP_CALENDAR_DAYS = 14;
export const MONTHS_KA = [
  "იანვარი", "თებერვალი", "მარტი", "აპრილი", "მაისი", "ივნისი",
  "ივლისი", "აგვისტო", "სექტემბერი", "ოქტომბერი", "ნოემბერი", "დეკემბერი",
] as const;
export const WEEKDAYS_KA = [
  "კვირა", "ორშაბათი", "სამშაბათი", "ოთხშაბათი", "ხუთშაბათი", "პარასკევი", "შაბათი",
] as const;

export type CalendarTone = "lucky" | "balanced" | "careful";
export type AstrologyCalendarDay = {
  date: Date;
  iso: string;
  label: string;
  shortLabel: string;
  score: number;
  tone: CalendarTone;
  sky: MundaneSky;
  lead: string;
};

const IMPORTANT = new Set(["მზე", "მთვარე", "მერკური", "ვენერა", "მარსი", "იუპიტერი", "სატურნი"]);

export function dateIso(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function parseCalendarDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isNaN(date.getTime()) || dateIso(date) !== value ? null : date;
}

export function calendarDateLabel(date: Date) {
  return `${date.getUTCDate()} ${MONTHS_KA[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

function aspectWeight(aspect: MundaneAspect) {
  const importance = (IMPORTANT.has(aspect.aKa) ? 1.1 : 0.8) + (IMPORTANT.has(aspect.bKa) ? 1.1 : 0.8);
  return Math.max(0.15, 1 - aspect.orb / 8) * importance;
}

export function astrologyDay(date: Date): AstrologyCalendarDay {
  const at = new Date(date);
  at.setUTCHours(12, 0, 0, 0);
  const sky = computeMundaneSky(at, 10);
  let harmonic = 0;
  let tense = 0;
  for (const aspect of sky.aspects) {
    const weight = aspectWeight(aspect);
    if (aspect.family === "harmonic") harmonic += weight;
    else if (aspect.family === "tense") tense += weight;
    else { harmonic += weight * 0.35; tense += weight * 0.35; }
  }
  const total = harmonic + tense;
  const raw = total ? (harmonic - tense) / total : 0;
  const score = Math.max(10, Math.min(90, Math.round(50 + raw * 40)));
  const tone: CalendarTone = score >= 62 ? "lucky" : score <= 38 ? "careful" : "balanced";
  const strongest = sky.aspects[0];
  const lead = strongest
    ? `${strongest.aKa}–${strongest.bKa}: ${strongest.kindKa} დღის მთავარ ასტროლოგიურ ტონს ქმნის.`
    : "დღის ცა მკვეთრი ასპექტების გარეშე უფრო მშვიდ და მოქნილ რიტმს ქმნის.";
  return {
    date: at,
    iso: dateIso(at),
    label: calendarDateLabel(at),
    shortLabel: `${at.getUTCDate()} ${MONTHS_KA[at.getUTCMonth()]}`,
    score,
    tone,
    sky,
    lead,
  };
}

function tbilisiToday() {
  // Georgia uses UTC+4 year-round. Anchor the public Georgian calendar to
  // Tbilisi's civil date instead of the build server's UTC date.
  const localIso = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString().slice(0, 10);
  return new Date(`${localIso}T12:00:00Z`);
}

export function calendarWindow(days = CALENDAR_DAYS, start?: Date) {
  const first = new Date(start ?? tbilisiToday());
  first.setUTCHours(12, 0, 0, 0);
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(first);
    date.setUTCDate(date.getUTCDate() + index);
    return astrologyDay(date);
  });
}

export function dayAdvice(day: AstrologyCalendarDay) {
  if (day.tone === "lucky") return {
    title: "ხელსაყრელი დღე",
    summary: "ჰარმონიული ასპექტები ჭარბობს. კარგი დროა ინიციატივის, მნიშვნელოვანი საუბრისა და წინსვლისთვის — თუმცა შედეგი მაინც შენს არჩევანზეა დამოკიდებული.",
    do: ["გადადგი ერთი კონკრეტული ნაბიჯი მნიშვნელოვანი მიზნისკენ", "გამოიყენე თანამშრომლობისა და გულწრფელი საუბრის შესაძლებლობა", "დააფიქსირე იდეები და შეთავაზებები, რომლებიც ბუნებრივად ჩნდება"],
    avoid: ["არ დაეყრდნო მხოლოდ იღბალს", "არ გასცე დაუფიქრებელი ფინანსური ან პირადი დაპირება"],
  };
  if (day.tone === "careful") return {
    title: "ფრთხილი დღე",
    summary: "დაძაბული ასპექტები მეტ ყურადღებას ითხოვს. სჯობს გადაწყვეტილებები გადაამოწმო, ემოციურ რეაქციას დრო მისცე და კონფლიქტი ძალით არ გაამწვავო.",
    do: ["გადაამოწმე ფაქტები და ვადები გადაწყვეტილებამდე", "დატოვე დამატებითი დრო გზისა და საქმეებისთვის", "უპასუხე მხოლოდ მას შემდეგ, რაც ემოცია დაცხრება"],
    avoid: ["მოერიდე იმპულსურ დაპირისპირებას", "ნუ მიიღებ ასტროლოგიურ შეფასებას გარდაუვალ წინასწარმეტყველებად"],
  };
  return {
    title: "დაბალანსებული დღე",
    summary: "ჰარმონიული და დაძაბული გავლენები დაბალანსებულია. დღე საუკეთესოდ მუშაობს ზომიერი ტემპით, მკაფიო პრიორიტეტებითა და სიტუაციაზე დაკვირვებით.",
    do: ["დაასრულე დაწყებული საქმეები", "შეინარჩუნე მოქნილი გეგმა", "გაარჩიე მნიშვნელოვანი და მეორეხარისხოვანი"],
    avoid: ["ნუ იჩქარებ მხოლოდ გარეგანი ზეწოლის გამო", "არ გაფანტო ენერგია ძალიან ბევრ მიმართულებაზე"],
  };
}
