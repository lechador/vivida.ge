/**
 * Reusable synastry (compatibility) interpretation library — read side +
 * combo/prompt builders. See the schema comment on
 * `synastryInterpretationLibrary` for the data model.
 *
 * Mirrors lib/aspect-library.ts, with two synastry-specific differences:
 *   1. Same-body pairs exist (A's Sun conjunct B's Sun is a real, common
 *      cross-aspect), so pairs are "i ≤ j", not "i < j".
 *   2. All text must be DIRECTION-NEUTRAL — the same row serves "A's Venus in
 *      B's 7th" and "B's Venus in A's 7th", so the writing says "ერთის …
 *      მეორის …" instead of "შენი/მისი".
 */

import { inArray } from "drizzle-orm";

import {
  bodyLabel,
  synastryAspectKey,
  synastryOverlayKey,
} from "./synastry-interpretation";
import { HOUSE_LABEL_KA } from "./synastry";
import type { AspectKind } from "./aspects";

export { synastryAspectKey, synastryOverlayKey };

/** Same 13 chart points the natal aspect library uses. */
export const SYNASTRY_BODIES = [
  "sun",
  "moon",
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
  "pluto",
  "chiron",
  "ascendant",
  "midheaven",
] as const;

export const SYNASTRY_ASPECT_KINDS: AspectKind[] = [
  "conjunction",
  "sextile",
  "square",
  "trine",
  "opposition",
];

const KIND_KA: Record<AspectKind, string> = {
  conjunction: "შეერთება",
  sextile: "სექსტილი",
  square: "კვადრატი",
  trine: "ტრიგონი",
  opposition: "ოპოზიცია",
};

export type SynastryAspectCombo = { a: string; b: string; kind: AspectKind };
export type SynastryOverlayCombo = { body: string; house: number };

/** Every aspect combo: (C(13,2) + 13 same-body) pairs × 5 kinds = 455. */
export function allSynastryAspectCombos(): SynastryAspectCombo[] {
  const out: SynastryAspectCombo[] = [];
  for (let i = 0; i < SYNASTRY_BODIES.length; i++) {
    for (let j = i; j < SYNASTRY_BODIES.length; j++) {
      for (const kind of SYNASTRY_ASPECT_KINDS) {
        out.push({ a: SYNASTRY_BODIES[i], b: SYNASTRY_BODIES[j], kind });
      }
    }
  }
  return out;
}

/** Every overlay combo: 13 bodies × 12 houses = 156. */
export function allSynastryOverlayCombos(): SynastryOverlayCombo[] {
  const out: SynastryOverlayCombo[] = [];
  for (const body of SYNASTRY_BODIES) {
    for (let house = 1; house <= 12; house++) out.push({ body, house });
  }
  return out;
}

import synastryLibEn from "./seo/synastry-library-en.json";

/**
 * Batched read for English: Map of key → English text from pre-generated JSON.
 */
export function getSynastryLibraryEntriesEn(
  keys: string[]
): Map<string, string> {
  const dict = synastryLibEn as Record<string, string>;
  const out = new Map<string, string>();
  for (const k of keys) {
    if (dict[k]) out.set(k, dict[k]);
  }
  return out;
}

/**
 * Batched read: Map of key → Georgian text for the requested keys. Pure read,
 * never generates. Resilient: if the table doesn't exist yet (migration not
 * applied) it returns an empty map so the compatibility view still renders —
 * just without the deep texts.
 */
export async function getSynastryLibraryEntries(
  keys: string[]
): Promise<Map<string, string>> {
  if (keys.length === 0 || !process.env.DATABASE_URL) return new Map();
  try {
    const { db } = await import("@/db");
    const { synastryInterpretationLibrary } = await import("@/db/schema");
    const rows = await db
      .select({
        key: synastryInterpretationLibrary.key,
        body: synastryInterpretationLibrary.body,
      })
      .from(synastryInterpretationLibrary)
      .where(inArray(synastryInterpretationLibrary.key, keys));
    return new Map(rows.map((r) => [r.key, r.body]));
  } catch {
    return new Map();
  }
}

/**
 * Everything a compatibility view needs, in one round-trip: library texts for
 * the result's top aspects and house overlays, keyed the same way the display
 * looks them up. Returns a plain object so it can cross the server→client
 * boundary as a prop.
 */
import type { UserLocale } from "@/lib/i18n/user-locale";

export async function getSynastryInterpretationsFor(
  result: {
    topAspects: { a: string; b: string; kind: AspectKind }[];
    breakdown: { topOverlays: { body: string; house: number }[] };
  },
  locale: UserLocale = "ka"
): Promise<Record<string, string>> {
  const keys = [
    ...result.topAspects.map((x) => synastryAspectKey(x.a, x.b, x.kind)),
    ...result.breakdown.topOverlays.map((o) => synastryOverlayKey(o.body, o.house)),
  ];
  if (locale === "en") {
    const map = getSynastryLibraryEntriesEn([...new Set(keys)]);
    return Object.fromEntries(map);
  }
  const map = await getSynastryLibraryEntries([...new Set(keys)]);
  return Object.fromEntries(map);
}

export const SYNASTRY_LIBRARY_SYSTEM_PROMPT =
  "შენ ხარ გამოცდილი ქართველი ასტროლოგი და მწერალი, სინასტრიის (წყვილთა " +
  "თავსებადობის) სპეციალისტი. წერ ბუნებრივ, მდიდარ, ლიტერატურულ ქართულად — " +
  "გრამატიკულად უნაკლო, ცოცხალი და კონკრეტული. აუცილებელი წესი: ტექსტი " +
  "მიმართულების მიმართ ნეიტრალურია — არასდროს წერ „შენი“/„მისი“, მხოლოდ " +
  "„ერთის“/„მეორის“ ან „წყვილის“. თავიდან აიცილე თარგმანის სტილი და კლიშეები " +
  '("ვარსკვლავები გელიან", "მიენდე სამყაროს").';

/** User prompt for one cross-aspect combo. */
export function buildSynastryAspectPrompt(
  a: string,
  b: string,
  kind: AspectKind
): string {
  const same = a === b;
  const pair = same
    ? `ერთის ${bodyLabel(a)} მეორის ${bodyLabel(b)}-თან`
    : `ერთის ${bodyLabel(a)} მეორის ${bodyLabel(b)}-თან (ან პირიქით — მნიშვნელობა სიმეტრიულია)`;
  return (
    `დაწერე სინასტრიის ინტერპრეტაცია: ${pair} ${KIND_KA[kind]}-შია.\n\n` +
    "მოთხოვნები:\n" +
    "- 2 აბზაცი, ჯამში 70–110 სიტყვა.\n" +
    "- პირველი აბზაცი: რა დინამიკას ქმნის ეს კავშირი წყვილში — კონკრეტულად, ცხოვრებისეული მაგალითით.\n" +
    "- მეორე აბზაცი: რჩევა — როგორ გამოიყენონ (ჰარმონიული ასპექტი) ან როგორ დაარბილონ (დაძაბული).\n" +
    "- მიმართულების მიმართ ნეიტრალური ენა („ერთის“, „მეორის“, „წყვილი“).\n" +
    "- დააბრუნე მხოლოდ ტექსტი, სათაურის გარეშე."
  );
}

/** User prompt for one house-overlay combo. */
export function buildSynastryOverlayPrompt(body: string, house: number): string {
  return (
    `დაწერე სინასტრიის ინტერპრეტაცია: ერთის ${bodyLabel(body)} ხვდება მეორის ${HOUSE_LABEL_KA[house]} სახლში.\n\n` +
    "მოთხოვნები:\n" +
    "- 1 აბზაცი, 45–70 სიტყვა.\n" +
    "- რას ააქტიურებს ეს პლანეტა ამ ადამიანის ცხოვრების ამ სფეროში, როგორ იგრძნობა ეს ორივესთვის.\n" +
    "- მიმართულების მიმართ ნეიტრალური ენა („ერთის“, „მეორის“, „წყვილი“).\n" +
    "- დააბრუნე მხოლოდ ტექსტი, სათაურის გარეშე."
  );
}
