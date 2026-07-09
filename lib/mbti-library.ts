/**
 * Reusable Astro-MBTI interpretation library.
 *
 * The pro-written, pre-generated bulk that the fast live `flash` synthesis
 * composes over (mirrors the transit/house libraries):
 *   - `type`     — deep psychological portrait per MBTI type (16). `title` is
 *                  the Georgian archetype name.
 *   - `type_sun` — how each type expresses through each Sun sign (16 × 12 = 192).
 *
 * Bulk seeding runs via scripts/seed-mbti-library.mjs (Vertex, gemini-2.5-pro).
 * The generators here (OpenRouter) are the live self-heal path for gaps.
 */

import { inArray } from "drizzle-orm";

import { db } from "@/db";
import { mbtiInterpretationLibrary } from "@/db/schema";
import { SIGNS } from "@/lib/zodiac";
import { mbtiArchetypeKa } from "@/lib/mbti-questions";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
/** Self-heal uses the strong model to match seed quality. */
export const MBTI_LIBRARY_MODEL = "google/gemini-3.1-pro-preview";

export const MBTI_TYPES = [
  "ISTJ", "ISFJ", "INFJ", "INTJ",
  "ISTP", "ISFP", "INFP", "INTP",
  "ESTP", "ESFP", "ENFP", "ENTP",
  "ESTJ", "ESFJ", "ENFJ", "ENTJ",
] as const;

export function mbtiTypeKey(type: string): string {
  return `type:${type}`;
}
export function mbtiTypeSunKey(type: string, sign: string): string {
  return `type_sun:${type}:${sign}`;
}

export type MbtiCombo =
  | { kind: "type"; key: string; mbtiType: string; sign: null }
  | { kind: "type_sun"; key: string; mbtiType: string; sign: string };

/** Every combo: 16 type + 192 type×sun = 208. */
export function allMbtiCombos(): MbtiCombo[] {
  const out: MbtiCombo[] = [];
  for (const t of MBTI_TYPES) {
    out.push({ kind: "type", key: mbtiTypeKey(t), mbtiType: t, sign: null });
    for (const s of SIGNS) {
      out.push({
        kind: "type_sun",
        key: mbtiTypeSunKey(t, s.key),
        mbtiType: t,
        sign: s.key,
      });
    }
  }
  return out;
}

export type MbtiLibraryEntry = { title: string | null; body: string };

/** Batched read: key → {title, body}. Pure read — never generates. */
export async function getMbtiLibraryEntries(
  keys: string[]
): Promise<Map<string, MbtiLibraryEntry>> {
  if (keys.length === 0) return new Map();
  const rows = await db
    .select({
      key: mbtiInterpretationLibrary.key,
      title: mbtiInterpretationLibrary.title,
      body: mbtiInterpretationLibrary.body,
    })
    .from(mbtiInterpretationLibrary)
    .where(inArray(mbtiInterpretationLibrary.key, keys));
  return new Map(rows.map((r) => [r.key, { title: r.title, body: r.body }]));
}

/** Convenience: fetch a type profile + its type×sun fusion in one read. */
export async function getTypeAndSun(
  type: string,
  signKey: string | null
): Promise<{ typeEntry: MbtiLibraryEntry | null; sunEntry: MbtiLibraryEntry | null }> {
  const keys = [mbtiTypeKey(type)];
  if (signKey) keys.push(mbtiTypeSunKey(type, signKey));
  const map = await getMbtiLibraryEntries(keys);
  return {
    typeEntry: map.get(mbtiTypeKey(type)) ?? null,
    sunEntry: signKey ? map.get(mbtiTypeSunKey(type, signKey)) ?? null : null,
  };
}

// ── Prompts + live self-heal (OpenRouter) ────────────────────────────────────

const SYSTEM_PROMPT =
  "შენ ხარ გამოცდილი ქართველი ფსიქოანალიტიკოსი და მწერალი. წერ ბუნებრივ, " +
  "მდიდარ, ლიტერატურულ ქართულად — გრამატიკულად უნაკლო, ცოცხალი და კონკრეტული. " +
  "თავიდან აიცილე თარგმანის სტილი, გამეორებები და კლიშეები.";

export function buildTypePrompt(type: string): string {
  return (
    `დაწერე MBTI ტიპის — ${type} (${mbtiArchetypeKa(type)}) — ღრმა ფსიქოლოგიური პორტრეტი ქართულად.\n` +
    `ახსენი: ამ ტიპის ბირთვული მოტივაცია, ძლიერი მხარეები, ბრმა წერტილები, ` +
    `როგორ ფიქრობს, გრძნობს და იღებს გადაწყვეტილებებს. 4-6 აბზაცი, "შენ"-ის ფორმა, ` +
    `თბილი და კონკრეტული. დააბრუნე მხოლოდ ტექსტი.`
  );
}

export function buildTypeSunPrompt(type: string, signKey: string): string {
  const sign = SIGNS.find((s) => s.key === signKey);
  const signKa = sign?.labelKa ?? signKey;
  return (
    `დაწერე, როგორ ვლინდება MBTI ტიპი ${type} (${mbtiArchetypeKa(type)}), როცა ` +
    `ადამიანის მზის ნიშანი ${signKa}-ია.\n` +
    `${signKa} — ${sign?.element ?? ""} ელემენტის ნიშანი. ახსენი, სად ამძაფრებს ან ` +
    `არბილებს ${signKa}-ის მზე ამ ტიპის ბუნებას — კონკრეტული, ცოცხალი ნიუანსებით. ` +
    `3-4 აბზაცი, "შენ"-ის ფორმა. დააბრუნე მხოლოდ ტექსტი.`
  );
}

interface OpenRouterJson {
  choices?: Array<{ message?: { content?: string } }>;
  error?: { message: string };
}

async function generateBody(prompt: string): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY missing");
  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": "https://vivida.ge",
      "X-Title": "Vivida Astro-MBTI library",
    },
    body: JSON.stringify({
      model: MBTI_LIBRARY_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      temperature: 0.8,
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
  if (!body) throw new Error("empty body");
  return body;
}

/**
 * Ensure the given combos exist, generating any missing ones (self-heal).
 * Background path — callers must NOT await this on a render path; a gap just
 * means the live synthesis has slightly less pre-written context that round.
 */
export async function ensureMbtiLibraryFor(combos: MbtiCombo[]): Promise<void> {
  const have = await getMbtiLibraryEntries(combos.map((c) => c.key));
  const missing = combos.filter((c) => !have.has(c.key));
  for (const c of missing) {
    try {
      const body =
        c.kind === "type"
          ? await generateBody(buildTypePrompt(c.mbtiType))
          : await generateBody(buildTypeSunPrompt(c.mbtiType, c.sign));
      await db
        .insert(mbtiInterpretationLibrary)
        .values({
          key: c.key,
          kind: c.kind,
          mbtiType: c.mbtiType,
          sign: c.sign,
          title: c.kind === "type" ? mbtiArchetypeKa(c.mbtiType) : null,
          body,
          model: MBTI_LIBRARY_MODEL,
        })
        .onConflictDoNothing();
    } catch (err) {
      console.warn(`[mbti-library] generate failed for ${c.key}:`, (err as Error).message);
    }
  }
}
