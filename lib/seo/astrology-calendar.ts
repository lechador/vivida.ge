import { BODIES, computePositions, signByIndex } from "@/lib/astrology-local";
import { detectAspects } from "@/lib/aspects";

export type CalendarTone = "lucky" | "balanced" | "careful";

export type AstrologyCalendarDay = {
  iso: string;
  date: Date;
  label: string;
  shortLabel: string;
  tone: CalendarTone;
  score: number;
  lead: string;
  sky: {
    planets: Array<{
      key: string;
      symbol: string;
      labelKa: string;
      signIndex: number;
      signKa: string;
      signSymbol: string;
    }>;
    aspects: Array<{
      aKa: string;
      bKa: string;
      aSymbol: string;
      bSymbol: string;
      kindKa: string;
      family: "harmonic" | "tense" | "neutral";
      orb: number;
    }>;
  };
};

export const SITEMAP_CALENDAR_DAYS = 30;

export const WEEKDAYS_KA = [
  "კვირა",
  "ორშაბათი",
  "სამშაბათი",
  "ოთხშაბათი",
  "ხუთშაბათი",
  "პარასკევი",
  "შაბათი",
];

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

const ASPECT_KA: Record<string, { label: string; family: "harmonic" | "tense" | "neutral" }> = {
  conjunction: { label: "შეერთება", family: "neutral" },
  sextile: { label: "სექსტილი", family: "harmonic" },
  square: { label: "კვადრატი", family: "tense" },
  trine: { label: "ტრინი", family: "harmonic" },
  opposition: { label: "ოპოზიცია", family: "tense" },
};

export function calendarDateLabel(date: Date, short = false): string {
  const day = date.getUTCDate();
  const month = MONTHS_KA[date.getUTCMonth()] ?? "";
  const year = date.getUTCFullYear();
  return short ? `${day} ${month}` : `${day} ${month}, ${year}`;
}

export function parseCalendarDate(iso: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const d = new Date(`${iso}T12:00:00Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function astrologyDay(dateInput: Date): AstrologyCalendarDay {
  const iso = dateInput.toISOString().slice(0, 10);
  const date = new Date(`${iso}T12:00:00Z`);
  const positions = computePositions(date);
  const rawAspects = detectAspects(positions).slice(0, 8);

  const planets = positions.map((p) => {
    const sign = signByIndex(p.signIndex);
    return {
      key: p.key,
      symbol: p.symbol,
      labelKa: p.labelKa,
      signIndex: p.signIndex,
      signKa: sign.labelKa,
      signSymbol: sign.symbol,
    };
  });

  let harmonicCount = 0;
  let tenseCount = 0;

  const aspects = rawAspects.map((a) => {
    const bodyA = BODIES.find((b) => b.key === a.a);
    const bodyB = BODIES.find((b) => b.key === a.b);
    const meta = ASPECT_KA[a.kind] ?? { label: a.kind, family: "neutral" as const };
    if (meta.family === "harmonic") harmonicCount++;
    if (meta.family === "tense") tenseCount++;
    return {
      aKa: bodyA?.labelKa ?? a.a,
      bKa: bodyB?.labelKa ?? a.b,
      aSymbol: bodyA?.symbol ?? "✦",
      bSymbol: bodyB?.symbol ?? "✦",
      kindKa: meta.label,
      family: meta.family,
      orb: a.orb,
    };
  });

  const rawScore = 62 + harmonicCount * 9 - tenseCount * 8;
  const score = Math.max(25, Math.min(95, rawScore));
  const tone: CalendarTone =
    score >= 70 ? "lucky" : score <= 48 ? "careful" : "balanced";

  const moon = planets.find((p) => p.key === "moon");
  const lead =
    tone === "lucky"
      ? `დღის ცაზე ჰარმონიული ასპექტები ჭარბობს${moon ? `, მთვარე კი ${moon.signKa}-ში მოძრაობს` : ""}. ხელსაყრელი ფონია დაგეგმვისა და თანამშრომლობისთვის.`
      : tone === "careful"
        ? `დღის ასპექტები მეტ დაკვირვებასა და სიმშვიდეს ითხოვს${moon ? `, მთვარე ${moon.signKa}-შია` : ""}. ნუ იჩქარებ მნიშვნელოვანი გადაწყვეტილებების მიღებას.`
        : `დაბალანსებული ასტროლოგიური ფონია${moon ? `, მთვარე ${moon.signKa}-ში გადის` : ""}. კარგი დღეა ყოველდღიური საქმეების თანმიმდევრულად შესასრულებლად.`;

  return {
    iso,
    date,
    label: calendarDateLabel(date, false),
    shortLabel: calendarDateLabel(date, true),
    tone,
    score,
    lead,
    sky: { planets, aspects },
  };
}

export function calendarWindow(days = 45, startFrom = new Date()): AstrologyCalendarDay[] {
  const baseIso = startFrom.toISOString().slice(0, 10);
  const start = new Date(`${baseIso}T12:00:00Z`);
  return Array.from({ length: days }, (_, idx) => {
    const d = new Date(start.getTime() + idx * 86400000);
    return astrologyDay(d);
  });
}

export function dayAdvice(day: AstrologyCalendarDay): {
  title: string;
  summary: string;
  do: string[];
  avoid: string[];
} {
  if (day.tone === "lucky") {
    return {
      title: "ხელსაყრელი დღე",
      summary:
        "ჰარმონიული ასპექტები ხელს უწყობს ინიციატივას, შეხვედრებსა და კონსტრუქციულ ნაბიჯებს.",
      do: [
        "დაგეგმე მნიშვნელოვანი საუბარი ან პრეზენტაცია",
        "გადადგი პირველი ნაბიჯი ახალ საქმეში",
        "გამოიყენე დღის ენერგია თანამშრომლობისთვის",
      ],
      avoid: [
        "ყურადღების ბევრ წვრილმანზე გაფანტვა",
        "გადაჭარბებული დაპირებების გაცემა",
      ],
    };
  }
  if (day.tone === "careful") {
    return {
      title: "ფრთხილი დღე",
      summary:
        "დაძაბული ასპექტების გამო სჯობს მშვიდი ტემპი, დეტალების გადამოწმება და ემოციური პაუზა.",
      do: [
        "გადაამოწმე დოკუმენტები და შეთანხმებები",
        "დაიტოვე დროის რეზერვი შეხვედრებს შორის",
        "დაასრულე უკვე დაწყებული საქმეები",
      ],
      avoid: [
        "იმპულსური ფინანსური ან კარიერული ნაბიჯები",
        "კონფლიქტის ცხელ გულზე გამწვავება",
      ],
    };
  }
  return {
    title: "დაბალანსებული დღე",
    summary:
      "ცის ფონი ზომიერია — წარმატება შენს ფოკუსსა და თანმიმდევრულობაზეა დამოკიდებული.",
    do: [
      "მიჰყევი წინასწარ გაწერილ გეგმას",
      "დაუთმე დრო როგორც სამუშაოს, ისე დასვენებას",
    ],
    avoid: [
      "საქმეების ბოლო წუთამდე გადადება",
      "ზედმეტი გადატვირთვა",
    ],
  };
}
