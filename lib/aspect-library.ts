/**
 * Reusable per-aspect interpretation library.
 *
 * "Sun conjunction Moon" reads identically for every user who has it, so
 * instead of a per-user AI call, we generate each of the 390 possible
 * (planetA, planetB, kind) combinations once, store it here, and reuse it.
 * The report's aspect section reads from here at render time instead of
 * calling the model, the same pattern already used for placements (see
 * lib/interpretation-library.ts).
 *
 * All entries are AI-generated with a high-quality model (rich, natural
 * Georgian). Rows flagged `edited` are never overwritten by regeneration.
 */

import { inArray } from "drizzle-orm";

import { db } from "@/db";
import { aspectInterpretationLibrary } from "@/db/schema";
import { BODIES } from "./zodiac";
import { aspectKey, type AspectKind } from "./aspects";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

/** Same higher-quality model used for the sign-placement library. */
export const ASPECT_LIBRARY_MODEL = "google/gemini-3.8-flash";

/** The 13 chart points that can participate in an aspect. */
export const ASPECT_BODIES = [
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

export const ASPECT_KINDS: AspectKind[] = [
  "conjunction",
  "sextile",
  "square",
  "trine",
  "opposition",
];

const KIND_KA: Record<AspectKind, string> = {
  conjunction: "შეერთება (conjunction)",
  sextile: "სექსტილი (sextile)",
  square: "კვადრატი (square)",
  trine: "ტრინი (trine)",
  opposition: "ოპოზიცია (opposition)",
};

/** Tone guidance per aspect family, keeps the model from writing every
 *  aspect as generically "good" or "bad". */
const KIND_DYNAMIC_KA: Record<AspectKind, string> = {
  conjunction:
    "ორი ენერგია ერთმანეთში ერწყმის და ერთ ძალად მოქმედებს, არც კონფლიქტი, არც შვება, უბრალოდ შერწყმა, რომლის ხასიათი პლანეტებზეა დამოკიდებული.",
  sextile:
    "ორი ენერგია ბუნებრივად თანამშრომლობს, ადვილად ხელმისაწვდომი შესაძლებლობა, რომელიც მოქმედებას საჭიროებს გასააქტიურებლად.",
  square:
    "ორი ენერგია ერთმანეთს ეწინააღმდეგება, შინაგანი ხახუნი და დაძაბულობა, რომელიც ზრდის ყველაზე ძლიერი წყაროა, თუმცა თავიდან რთულად იგრძნობა.",
  trine:
    "ორი ენერგია ჰარმონიულად და ბუნებრივად მიედინება, ნიჭი და სიმარტივე, რომელიც ხანდახან თვითკმაყოფილებაშიც შეიძლება გადაიზარდოს.",
  opposition:
    "ორი ენერგია ერთმანეთის საპირისპირო პოლუსზეა, ცნობიერების საჭიროება ბალანსის საპოვნელად ორ უკიდურესობას შორის.",
};

export function libraryKindKa(kind: AspectKind): string {
  return KIND_KA[kind] ?? kind;
}

export function aspectLibraryKey(
  a: string,
  b: string,
  kind: AspectKind,
): string {
  return aspectKey(a, b, kind);
}

export type AspectPlacement = { a: string; b: string; kind: AspectKind };

/** Every possible aspect combo: C(13,2) pairs × 5 kinds = 390. */
export function allAspectCombos(): AspectPlacement[] {
  const out: AspectPlacement[] = [];
  for (let i = 0; i < ASPECT_BODIES.length; i++) {
    for (let j = i + 1; j < ASPECT_BODIES.length; j++) {
      for (const kind of ASPECT_KINDS) {
        out.push({ a: ASPECT_BODIES[i], b: ASPECT_BODIES[j], kind });
      }
    }
  }
  return out;
}

/**
 * Batched read: returns a Map of key → body for the requested keys. Pure
 * read, never generates. Used by the read-time overlay so editing a library
 * row reflects for every user on their next view.
 */
export async function getAspectLibraryEntries(
  keys: string[],
): Promise<Map<string, string>> {
  if (keys.length === 0) return new Map();
  const rows = await db
    .select({
      key: aspectInterpretationLibrary.key,
      body: aspectInterpretationLibrary.body,
    })
    .from(aspectInterpretationLibrary)
    .where(inArray(aspectInterpretationLibrary.key, keys));
  return new Map(rows.map((r) => [r.key, r.body]));
}

const SYSTEM_PROMPT =
  "შენ ხარ გამოცდილი ქართველი ასტროლოგი და მწერალი. წერ ბუნებრივ, მდიდარ, " +
  "ლიტერატურულ ქართულად, გრამატიკულად უნაკლო, ცოცხალი და კონკრეტული. " +
  "თავიდან აიცილე თარგმანის სტილი, გამეორებები და კლიშეები " +
  '("ვარსკვლავები გელიან", "მიენდე სამყაროს").';

/** Build the user prompt for a single (a, b, kind) aspect combo. */
export function buildAspectPrompt(
  a: string,
  b: string,
  kind: AspectKind,
): string {
  const aMeta = BODIES[a];
  const bMeta = BODIES[b];
  const aLabel = aMeta?.labelKa ?? a;
  const bLabel = bMeta?.labelKa ?? b;
  const aMeaning = aMeta?.meaningKa ?? "";
  const bMeaning = bMeta?.meaningKa ?? "";
  const kindKa = KIND_KA[kind];
  const dynamic = KIND_DYNAMIC_KA[kind];
  return (
    `დაწერე ნატალური ასპექტის ინტერპრეტაცია: "${aLabel} ${kindKa} ${bLabel}".\n` +
    `${aLabel}, ${aMeaning}. ${bLabel}, ${bMeaning}.\n` +
    `ამ ასპექტის ბუნება: ${dynamic}\n\n` +
    `6-8 წინადადება (დაახ. 130-170 სიტყვა), "შენ"-ის ფორმა, თბილი და კონკრეტული. ` +
    `ახსენი: როგორ ერწყმის/ეჯახება ეს ორი ენერგია ერთმანეთს ცხოვრებაში, ` +
    `ერთი კონკრეტული ხელშესახები მაგალითი, და ერთი პრაქტიკული რჩევა ამ ` +
    `დინამიკასთან სამუშაოდ. დააბრუნე მხოლოდ ტექსტი, სათაურის, ` +
    `ფორმატირების და ფრჩხილების გარეშე.`
  );
}

interface OpenRouterJson {
  choices?: Array<{ message?: { content?: string } }>;
  error?: { message: string };
}

/** Generate a single reusable aspect interpretation. Throws on API/empty errors. */
export async function generateAspectEntry(
  a: string,
  b: string,
  kind: AspectKind,
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY missing");

  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": "https://vivida.ge",
      "X-Title": "Vivida aspect library",
    },
    body: JSON.stringify({
      model: ASPECT_LIBRARY_MODEL,
      reasoning: { effort: "low" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildAspectPrompt(a, b, kind) },
      ],
      temperature: 0.8,
      // Leave headroom for reasoning so the
      // answer isn't truncated by the thinking budget.
      max_tokens: 12000,
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`OpenRouter ${res.status}: ${text.slice(0, 300)}`);
  }
  const json = (await res.json()) as OpenRouterJson;
  if (json.error) throw new Error(`OpenRouter: ${json.error.message}`);
  const body = json.choices?.[0]?.message?.content?.trim();
  if (!body) throw new Error(`empty entry for ${a}-${b}-${kind}`);
  return body;
}

/**
 * Ensure library rows exist for the given aspect placements, generating any
 * missing ones (one AI call each) and persisting them. Returns a key → body
 * map for the requested placements. Background path, never blocks a render.
 */
export async function ensureAspectLibraryFor(
  placements: AspectPlacement[],
): Promise<Map<string, string>> {
  const keys = placements.map((p) => aspectLibraryKey(p.a, p.b, p.kind));
  const have = await getAspectLibraryEntries(keys);
  const missing = placements.filter(
    (p) => !have.has(aspectLibraryKey(p.a, p.b, p.kind)),
  );
  if (missing.length === 0) return have;

  for (const p of missing) {
    try {
      const body = await generateAspectEntry(p.a, p.b, p.kind);
      const key = aspectLibraryKey(p.a, p.b, p.kind);
      await db
        .insert(aspectInterpretationLibrary)
        .values({
          key,
          planetA: [p.a, p.b].sort()[0],
          planetB: [p.a, p.b].sort()[1],
          kind: p.kind,
          body,
          model: ASPECT_LIBRARY_MODEL,
        })
        .onConflictDoNothing();
      have.set(key, body);
    } catch (err) {
      console.warn(
        `[aspect-library] generate failed for ${p.a}-${p.b}-${p.kind}:`,
        (err as Error).message,
      );
    }
  }
  return have;
}
