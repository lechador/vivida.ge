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
    name: { ka: "სიტუაცია", en: "Situation", am: "Իրավիճակ" },
    positions: {
      ka: SPREAD_POSITIONS_KA,
      en: SPREAD_POSITIONS_EN,
      am: ["անցյալ / արմատ", "ներկա / առանցք", "ապագա / ուղի"],
    },
    readingLogic: {
      ka: "წარსული/ფესვი, აწმყო/ბირთვი, მომავალი/გზა",
      en: "past/root, present/core, future/path",
      am: "անցյալ/արմատ, ներկա/միջուկ, ապագա/ուղի",
    },
  },
  {
    id: "relationship",
    name: { ka: "ურთიერთობა", en: "Relationship", am: "Հարաբերություն" },
    positions: {
      ka: ["ჩემი საჭიროება", "დაძაბულობა", "შესაძლო ნაბიჯი"],
      en: ["My need", "The tension", "A possible step"],
      am: ["Իմ կարիքը", "Լարվածությունը", "Հնարավոր քայլը"],
    },
    readingLogic: {
      ka: "ურთიერთობის დინამიკა: ჩემი საჭიროება, დაძაბულობა, შესაძლო ნაბიჯი",
      en: "relationship dynamic: my need, the tension, a possible step",
      am: "հարաբերության դինամիկա. իմ կարիքը, լարվածությունը, հնարավոր քայլը",
    },
  },
  {
    id: "choice",
    name: { ka: "ორი გზა", en: "Two paths", am: "Երկու ուղի" },
    positions: {
      ka: ["პირველი გზა", "მეორე გზა", "საერთო რჩევა"],
      en: ["First path", "Second path", "Shared counsel"],
      am: ["Առաջին ուղի", "Երկրորդ ուղի", "Ընդհանուր խորհուրդ"],
    },
    readingLogic: {
      ka: "ორი გზის შედარება: პირველი გზა, მეორე გზა, საერთო რჩევა",
      en: "comparing two paths: first path, second path, shared counsel",
      am: "երկու ուղիների համեմատություն. առաջին ուղի, երկրորդ ուղի, ընդհանուր խորհուրդ",
    },
  },
];

export function tarotSpreadById(id: unknown): TarotSpread | undefined {
  return TAROT_SPREADS.find((spread) => spread.id === id);
}
