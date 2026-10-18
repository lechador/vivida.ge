import type { UserLocale } from "@/lib/i18n/locale";
import { SPREAD_POSITIONS_KA } from "@/lib/tarot/deck";
import { SPREAD_POSITIONS_EN } from "@/lib/tarot/deck-en";

export type TarotSpreadId = "situation" | "relationship" | "choice";

export type TarotSpread = {
  id: TarotSpreadId;
  /** Short picker label per locale. */
  name: Record<UserLocale, string>;
  /** Card positions in draw order, per locale. */
  positions: Record<UserLocale, readonly [string, string, string]>;
  /**
   * One clause describing the spread logic for the AI prompt, per locale.
   * The "situation" clause matches the long-standing default prompt exactly.
   */
  readingLogic: Record<UserLocale, string>;
};

export const TAROT_SPREADS: readonly TarotSpread[] = [
  {
    id: "situation",
    name: { ka: "სიტუაცია", en: "Situation" },
    positions: {
      ka: SPREAD_POSITIONS_KA,
      en: SPREAD_POSITIONS_EN,
    },
    readingLogic: {
      ka: "წარსული/ფესვი, აწმყო/ბირთვი, მომავალი/გზა",
      en: "past/root, present/core, future/path",
    },
  },
  {
    id: "relationship",
    name: { ka: "ურთიერთობა", en: "Relationship" },
    positions: {
      ka: ["ჩემი საჭიროება", "დაძაბულობა", "შესაძლო ნაბიჯი"],
      en: ["My need", "The tension", "A possible step"],
    },
    readingLogic: {
      ka: "ურთიერთობის დინამიკა: ჩემი საჭიროება, დაძაბულობა, შესაძლო ნაბიჯი",
      en: "relationship dynamic: my need, the tension, a possible step",
    },
  },
  {
    id: "choice",
    name: { ka: "ორი გზა", en: "Two paths" },
    positions: {
      ka: ["პირველი გზა", "მეორე გზა", "საერთო რჩევა"],
      en: ["First path", "Second path", "Shared counsel"],
    },
    readingLogic: {
      ka: "ორი გზის შედარება: პირველი გზა, მეორე გზა, საერთო რჩევა",
      en: "comparing two paths: first path, second path, shared counsel",
    },
  },
];

export function tarotSpreadById(id: unknown): TarotSpread | undefined {
  return TAROT_SPREADS.find((spread) => spread.id === id);
}
