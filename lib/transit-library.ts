import type { CrossAspect } from "@/lib/transits";
import type { UserLocale } from "@/lib/i18n/user-locale";
import type { WeeklyForecastDay } from "@/db/schema";

export type TransitDayFacts = {
  moon: {
    sign: string;
    house: number | null;
    aspects: CrossAspect[];
  };
  sun: {
    house: number | null;
  };
  innerAspects: CrossAspect[];
  outerAspects: CrossAspect[];
};

export type TransitCombo = {
  key: string;
  kind: string;
};

export type TransitBreakdownItem = {
  transit: string;
  natal: string;
  kind: string;
  orb: number;
  title: string;
  body: string;
};

export function combosForDay(facts: TransitDayFacts): TransitCombo[] {
  const out: TransitCombo[] = [
    { key: `moon-sign:${facts.moon.sign}`, kind: "moon_sign" },
  ];
  if (facts.moon.house) {
    out.push({ key: `moon-house:${facts.moon.house}`, kind: "moon_house" });
  }
  return out;
}

export async function getTransitLibraryEntries(
  _keys: string[],
  _locale: UserLocale = "ka",
): Promise<Map<string, { title: string; body: string }>> {
  return new Map();
}

export async function ensureTransitLibraryFor(
  _combos: TransitCombo[],
): Promise<void> {}

export function composeDailyFromLibrary(
  facts: TransitDayFacts,
  _entries: Map<string, { title: string; body: string }>,
  locale: UserLocale = "ka",
  _dateStr?: string,
): {
  headline: string;
  summary: string;
  body: string;
  themes: string[];
} | null {
  const en = locale === "en";
  return {
    headline: en
      ? "Balanced cosmic momentum and clear inner focus"
      : "დაბალანსებული კოსმიური რიტმი და შინაგანი სიცხადე",
    summary: en
      ? "Today's transits highlight steady reflection, honest communication, and mindful pacing."
      : "დღევანდელი ტრანზიტები ხელს უწყობს მშვიდ დაკვირვებას, გულწრფელ კომუნიკაციასა და გააზრებულ ნაბიჯებს.",
    body: en
      ? `With the Moon moving through ${facts.moon.sign}, your emotional attention turns toward what feels authentic and sustainable. Take time to prioritize one meaningful conversation and avoid rushing decisions.`
      : `მთვარის მოძრაობა გაძლევს საშუალებას მშვიდად შეაფასო მიმდინარე მოვლენები და ყურადღება გადაიტანო მთავარ პრიორიტეტებზე. მოუსმინე საკუთარ ინტუიციას და იმოქმედე აუჩქარებლად.`,
    themes: en
      ? ["Clarity", "Relationships", "Focus"]
      : ["სიცხადე", "ურთიერთობები", "ფოკუსი"],
  };
}

export async function overlayTransitAspects(
  aspects: CrossAspect[],
  limit: number = 5,
  locale: UserLocale = "ka",
): Promise<TransitBreakdownItem[]> {
  const en = locale === "en";
  return aspects.slice(0, limit).map((a) => ({
    transit: a.transit,
    natal: a.natal,
    kind: a.kind,
    orb: a.orb,
    title: en
      ? `${a.transit} ${a.kind} ${a.natal}`
      : `${a.transit} · ${a.kind} · ${a.natal}`,
    body: en
      ? "This transit activates a meaningful dialogue between current planetary movement and your natal pattern."
      : "ეს ტრანზიტი ააქტიურებს მნიშვნელოვან კავშირს მიმდინარე პლანეტარულ მოძრაობასა და შენს ნატალურ რუკას შორის.",
  }));
}

export function composeWeeklyFromLibrary(
  days: WeeklyForecastDay[],
  _locale: UserLocale = "ka",
): WeeklyForecastDay[] {
  return days;
}
