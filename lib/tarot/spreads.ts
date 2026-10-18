export type TarotSpreadId = "situation" | "love" | "choice";

export type TarotSpread = {
  id: TarotSpreadId;
  name: { ka: string; en: string };
  positions: { ka: [string, string, string]; en: [string, string, string] };
};

export const TAROT_SPREADS: readonly TarotSpread[] = [
  {
    id: "situation",
    name: { ka: "სიტუაციის გაშლა", en: "Situation Spread" },
    positions: {
      ka: ["ფესვი", "ახლა", "მიმართულება"],
      en: ["Root", "Present", "Direction"],
    },
  },
  {
    id: "love",
    name: { ka: "ურთიერთობა", en: "Relationship" },
    positions: {
      ka: ["შენ", "პარტნიორი", "კავშირის დინამიკა"],
      en: ["You", "Partner", "Connection"],
    },
  },
  {
    id: "choice",
    name: { ka: "არჩევანი (A / B)", en: "Two Paths (A / B)" },
    positions: {
      ka: ["გზა A", "გზა B", "მთავარი გასაღები"],
      en: ["Path A", "Path B", "Key Insight"],
    },
  },
] as const;

export function tarotSpreadById(id: unknown): TarotSpread | null {
  if (typeof id !== "string") return null;
  return TAROT_SPREADS.find((s) => s.id === id) ?? null;
}
