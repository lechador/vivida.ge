import type { UserLocale } from "@/lib/i18n/locale";
import { SPREAD_POSITIONS_KA } from "@/lib/tarot/deck";
import { SPREAD_POSITIONS_EN } from "@/lib/tarot/deck-en";

export type TarotSpreadId =
  "situation" | "relationship" | "choice" | "love_5" | "yes_no";

export type TarotSpread = {
  id: TarotSpreadId;
  /** Short picker label per locale. */
  name: Record<UserLocale, string>;
  /** Card positions in draw order, per locale. */
  positions: Record<UserLocale, readonly string[]>;
  /**
   * One clause describing the spread logic for the AI prompt, per locale.
   * The "situation" clause matches the long-standing default prompt exactly.
   */
  readingLogic: Record<UserLocale, string>;
  /** Optional explicit card count, defaults to positions length. */
  cardCount?: number;
  /** Optional explicit credit cost, defaults to tarotSpreadCost(id). */
  cost?: number;
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
  {
    id: "love_5",
    name: { ka: "სასიყვარულო (5 კარტი)", en: "Love spread (5 cards)" },
    positions: {
      ka: [
        "რას გრძნობს",
        "რას მალავს",
        "რას აპირებს",
        "შენი პოზიცია",
        "ურთიერთობის გამოსავალი",
      ],
      en: [
        "What they feel",
        "What they hide",
        "What they will do",
        "Your position",
        "Relationship outcome",
      ],
    },
    readingLogic: {
      ka: "სასიყვარულო 5-კარტიანი გაშლა: რას გრძნობს, რას მალავს, რას იზამს, შენი პოზიცია და ურთიერთობის გამოსავალი",
      en: "5-card love spread: what they feel, what they hide, what they will do, your position, and relationship outcome",
    },
  },
  {
    id: "yes_no",
    name: { ka: "კი თუ არა + დრო", en: "Yes / No + Timing" },
    positions: {
      ka: ["მთავარი პასუხი (კი/არა)", "ფარული ფაქტორი", "დროის პროგნოზი"],
      en: ["Core answer (Yes/No)", "Hidden factor", "Timing forecast"],
    },
    readingLogic: {
      ka: "კი თუ არა და დროის პროგნოზი: მთავარი პასუხი (კი/არა მიმართულება), ფარული ფაქტორი და დროის პროგნოზი",
      en: "yes or no plus timing forecast: core answer direction, hidden factor, and timing window",
    },
  },
];

export function tarotSpreadById(id: unknown): TarotSpread | undefined {
  return TAROT_SPREADS.find((spread) => spread.id === id);
}

/**
 * Credit cost per spread: 15 for the 5-card love spread, 5 for yes/no,
 * 10 for the standard 3-card spreads.
 */
export function tarotSpreadCost(spreadId: TarotSpreadId): number {
  if (spreadId === "love_5") return 15;
  if (spreadId === "yes_no") return 5;
  return 10;
}
