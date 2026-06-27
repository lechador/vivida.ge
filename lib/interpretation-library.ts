/**
 * Reusable per-placement interpretation library.
 *
 * These are the sign-level texts that read identically for everyone with the
 * same placement (e.g. "Sun in Scorpio"). We generate each once, store it in
 * the `interpretation_library` table, and reuse it across all users — the
 * report's Big Three + planet sections read from here at render time instead
 * of a per-user AI call. That makes reports assemble instantly, keeps wording
 * consistent, and lets the copy be edited centrally (admin panel).
 *
 * All subjects are AI-generated with a high-quality model (rich, natural
 * Georgian). Rows flagged `edited` are never overwritten by regeneration.
 */

import { inArray } from "drizzle-orm";

import { db } from "@/db";
import { interpretationLibrary } from "@/db/schema";
import { SIGNS, signByIndex } from "./zodiac";
import type { NatalChartJson } from "@/db/schema";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

/**
 * Higher-quality model for the library copy — these texts are written once and
 * reused for everyone, so we spend the better model here (richer, more natural
 * Georgian) rather than the fast model used for per-request generation.
 */
export const LIBRARY_MODEL = "google/gemini-3.1-pro-preview";

/** Subjects whose sign-level text is reusable (Big Three + planets). */
export const LIBRARY_SUBJECTS = [
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
  "ascendant",
] as const;

export type LibrarySubject = (typeof LIBRARY_SUBJECTS)[number];

const SUBJECT_KA: Record<LibrarySubject, string> = {
  sun: "მზე",
  moon: "მთვარე",
  mercury: "მერკური",
  venus: "ვენერა",
  mars: "მარსი",
  jupiter: "იუპიტერი",
  saturn: "სატურნი",
  uranus: "ურანი",
  neptune: "ნეპტუნი",
  pluto: "პლუტონი",
  ascendant: "ამომავალი ნიშანი",
};

/** What each subject governs — keeps the AI text focused on the right theme. */
const SUBJECT_DOMAIN_KA: Record<LibrarySubject, string> = {
  sun: "ბირთვი, იდენტობა, სასიცოცხლო ენერგია და თვითგამოხატვა",
  moon: "ემოციები, შინაგანი სამყარო და რა გაძლევს უსაფრთხოებას",
  mercury: "აზროვნება, კომუნიკაცია, სწავლა და გადაწყვეტილებები",
  venus: "სიყვარული, ფასეულობები, ესთეტიკა და ურთიერთობების სტილი",
  mars: "მოქმედება, ენერგია, სურვილი და როგორ იცავ თავს",
  jupiter: "ზრდა, იღბალი, რწმენა და სად ეძებ აზრს",
  saturn: "დისციპლინა, პასუხისმგებლობა, საზღვრები და ცხოვრებისეული გაკვეთილები",
  uranus: "ცვლილება, ორიგინალურობა, თავისუფლება და მოულოდნელობა",
  neptune: "ოცნება, ინტუიცია, სულიერება და შემოქმედებითი წარმოსახვა",
  pluto: "ღრმა ტრანსფორმაცია, ძალა, კონტროლი და აღორძინება",
  ascendant: "პირველი შთაბეჭდილება — როგორ აღგიქვამენ სხვები პირველი შეხვედრისას",
};

const SIGN_KA: Record<string, string> = Object.fromEntries(
  SIGNS.map((s) => [s.key, s.labelKa])
);

export function libraryKey(subject: string, sign: string): string {
  return `${subject}:${sign}`;
}

export type Placement = { subject: LibrarySubject; sign: string };

/**
 * The reusable placements present in a chart: Sun/Moon/Ascendant + the eight
 * planets, each mapped to the sign they fall in.
 */
export function placementsForChart(data: NatalChartJson): Placement[] {
  const out: Placement[] = [];
  out.push({ subject: "ascendant", sign: signByIndex(data.ascendant.signIndex).key });
  for (const subject of LIBRARY_SUBJECTS) {
    if (subject === "ascendant") continue;
    const body = data.bodies[subject];
    if (body) out.push({ subject, sign: signByIndex(body.signIndex).key });
  }
  return out;
}

/**
 * Batched read: returns a Map of key → body for the requested keys. Pure
 * read — never generates. Used by the read-time overlay so editing a library
 * row reflects for every user on their next view.
 */
export async function getLibraryEntries(
  keys: string[]
): Promise<Map<string, string>> {
  if (keys.length === 0) return new Map();
  const rows = await db
    .select({ key: interpretationLibrary.key, body: interpretationLibrary.body })
    .from(interpretationLibrary)
    .where(inArray(interpretationLibrary.key, keys));
  return new Map(rows.map((r) => [r.key, r.body]));
}

const SYSTEM_PROMPT =
  "შენ ხარ გამოცდილი ქართველი ასტროლოგი და მწერალი. წერ ბუნებრივ, მდიდარ, " +
  "ლიტერატურულ ქართულად — გრამატიკულად უნაკლო, ცოცხალი და კონკრეტული. " +
  "თავიდან აიცილე თარგმანის სტილი, გამეორებები და კლიშეები " +
  '("ვარსკვლავები გელიან", "მიენდე სამყაროს").';

/** Build the user prompt for a single (subject, sign) placement. */
export function buildEntryPrompt(subject: LibrarySubject, sign: string): string {
  const subjectKa = SUBJECT_KA[subject];
  const signKa = SIGN_KA[sign] ?? sign;
  const domain = SUBJECT_DOMAIN_KA[subject];
  const placementKa =
    subject === "ascendant"
      ? `ამომავალი ნიშანი ${signKa}`
      : `${subjectKa} ${signKa}-ში`;
  return (
    `დაწერე "${placementKa}"-ს ინტერპრეტაცია (თემა: ${domain}).\n` +
    `6-8 წინადადება (დაახ. 130-170 სიტყვა), "შენ"-ის ფორმა, თბილი და კონკრეტული. ` +
    `ჩაურთე ამ მდებარეობის ძლიერი მხარეც და გამოწვევაც, ცოცხალი, ხელშესახები ` +
    `მაგალითებით. დააბრუნე მხოლოდ ტექსტი — სათაურის, ფორმატირების და ` +
    `ფრჩხილების გარეშე.`
  );
}

interface OpenRouterJson {
  choices?: Array<{ message?: { content?: string } }>;
  error?: { message: string };
}

/** Generate a single reusable interpretation. Throws on API/empty errors. */
export async function generateEntry(
  subject: LibrarySubject,
  sign: string
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY missing");

  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": "https://vivida.ge",
      "X-Title": "Vivida interpretation library",
    },
    body: JSON.stringify({
      model: LIBRARY_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildEntryPrompt(subject, sign) },
      ],
      temperature: 0.8,
      // gemini-3.1-pro always reasons (~2-3k tokens); leave ample headroom so
      // the actual answer isn't truncated by the thinking budget.
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
  if (!body) throw new Error(`empty entry for ${subject}:${sign}`);
  return body;
}

/**
 * Ensure library rows exist for the given placements, generating any missing
 * ones (one AI call each) and persisting them. Returns a key → body map for
 * the requested placements. Background path — never blocks a page render.
 */
export async function ensureLibraryFor(
  placements: Placement[]
): Promise<Map<string, string>> {
  const keys = placements.map((p) => libraryKey(p.subject, p.sign));
  const have = await getLibraryEntries(keys);
  const missing = placements.filter(
    (p) => !have.has(libraryKey(p.subject, p.sign))
  );
  if (missing.length === 0) return have;

  for (const p of missing) {
    try {
      const body = await generateEntry(p.subject, p.sign);
      const key = libraryKey(p.subject, p.sign);
      await db
        .insert(interpretationLibrary)
        .values({ key, subject: p.subject, sign: p.sign, body, model: LIBRARY_MODEL })
        .onConflictDoNothing();
      have.set(key, body);
    } catch (err) {
      console.warn(
        `[interp-library] generate failed for ${p.subject}:${p.sign}:`,
        (err as Error).message
      );
    }
  }
  return have;
}
