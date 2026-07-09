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

/**
 * The rich, 16Personalities-style profile sections — pre-written per 4-letter
 * type (astrology stays in the live synthesis, so these are type-stable and
 * render with zero per-test cost). `list: true` sections are rendered as a
 * bulleted "**Title** — body" list; the rest are prose. 7 × 16 = 112 rows.
 */
export const MBTI_SECTIONS = [
  { kind: "strengths", titleKa: "ძლიერი მხარეები", list: true },
  { kind: "weaknesses", titleKa: "სუსტი მხარეები", list: true },
  { kind: "romantic", titleKa: "რომანტიკული ურთიერთობები", list: false },
  { kind: "friendship", titleKa: "მეგობრობა", list: false },
  { kind: "career", titleKa: "კარიერული გზა", list: false },
  { kind: "workplace", titleKa: "სამუშაო ჩვევები", list: false },
  { kind: "growth", titleKa: "პიროვნული ზრდა", list: false },
] as const;

export type MbtiSectionKind = (typeof MBTI_SECTIONS)[number]["kind"];

export function mbtiSectionKey(kind: MbtiSectionKind, type: string): string {
  return `${kind}:${type}`;
}

export type MbtiCombo =
  | { kind: "type"; key: string; mbtiType: string; sign: null }
  | { kind: "type_sun"; key: string; mbtiType: string; sign: string }
  | { kind: MbtiSectionKind; key: string; mbtiType: string; sign: null };

/** The 7 profile-section combos for one type (used for background self-heal). */
export function mbtiSectionCombos(type: string): MbtiCombo[] {
  return MBTI_SECTIONS.map((s) => ({
    kind: s.kind,
    key: mbtiSectionKey(s.kind, type),
    mbtiType: type,
    sign: null,
  }));
}

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

export type MbtiSection = {
  kind: MbtiSectionKind;
  titleKa: string;
  list: boolean;
  body: string;
};

/**
 * Fetch all present profile sections for a type, in canonical order. Missing
 * sections are simply omitted (the results page renders whatever exists). Pure
 * read — never generates.
 */
export async function getTypeSections(type: string): Promise<MbtiSection[]> {
  const map = await getMbtiLibraryEntries(
    MBTI_SECTIONS.map((s) => mbtiSectionKey(s.kind, type))
  );
  return MBTI_SECTIONS.flatMap((s) => {
    const entry = map.get(mbtiSectionKey(s.kind, type));
    if (!entry?.body) return [];
    return [{ kind: s.kind, titleKa: s.titleKa, list: s.list, body: entry.body }];
  });
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

/** Prompt for a rich profile section (strengths/weaknesses/relationships/…). */
export function buildSectionPrompt(kind: MbtiSectionKind, type: string): string {
  const label = `MBTI ტიპი ${type} (${mbtiArchetypeKa(type)})`;
  const listFmt =
    `ჩამოთვალე 6 პუნქტი. თითოეული ცალკე ხაზზე ფორმატით: **სათაური** — ერთი-ორი ` +
    `წინადადება ახსნა. არ გამოიყენო ნუმერაცია ან ტირეები დასაწყისში. მხოლოდ ეს პუნქტები.`;
  const prose = `3-4 აბზაცი, "შენ"-ის ფორმა, თბილი და კონკრეტული. დააბრუნე მხოლოდ ტექსტი.`;
  switch (kind) {
    case "strengths":
      return `დაწერე ${label}-ის ძლიერი მხარეები ქართულად.\n${listFmt}`;
    case "weaknesses":
      return `დაწერე ${label}-ის სუსტი მხარეები და ბრმა წერტილები ქართულად — ` +
        `გულწრფელად მაგრამ თანაგრძნობით.\n${listFmt}`;
    case "romantic":
      return `დაწერე, როგორია ${label} რომანტიკულ ურთიერთობებში: რას ეძებს პარტნიორში, ` +
        `როგორ გამოხატავს სიყვარულს, რა ურთულდება.\n${prose}`;
    case "friendship":
      return `დაწერე, როგორია ${label} მეგობრობაში: როგორ ამყარებს კავშირებს, რას აფასებს ` +
        `მეგობრებში, რა ტიპის სოციალურ წრეს ქმნის.\n${prose}`;
    case "career":
      return `დაწერე ${label}-ის კარიერული გზა: რომელ სფეროებში ისახება ბუნებრივად, რა ` +
        `ამოძრავებს პროფესიულად, რა გარემო უხდება.\n${prose}`;
    case "workplace":
      return `დაწერე ${label}-ის სამუშაო ჩვევები: როგორ იქცევა გუნდში, როგორც ` +
        `ხელქვეითი, კოლეგა და ლიდერი.\n${prose}`;
    case "growth":
      return `დაწერე ${label}-ის პიროვნული ზრდის გზა: რა უნდა გააცნობიეროს და გაივარჯიშოს, ` +
        `რომ სრულად გაიხსნას თავისი პოტენციალი. დაასრულე გამამხნევებელი ნოტით.\n${prose}`;
  }
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
      let body: string;
      let title: string | null = null;
      if (c.kind === "type") {
        body = await generateBody(buildTypePrompt(c.mbtiType));
        title = mbtiArchetypeKa(c.mbtiType);
      } else if (c.kind === "type_sun") {
        body = await generateBody(buildTypeSunPrompt(c.mbtiType, c.sign));
      } else {
        const section = MBTI_SECTIONS.find((s) => s.kind === c.kind);
        body = await generateBody(buildSectionPrompt(c.kind, c.mbtiType));
        title = section?.titleKa ?? null;
      }
      await db
        .insert(mbtiInterpretationLibrary)
        .values({
          key: c.key,
          kind: c.kind,
          mbtiType: c.mbtiType,
          sign: c.kind === "type_sun" ? c.sign : null,
          title,
          body,
          model: MBTI_LIBRARY_MODEL,
        })
        .onConflictDoNothing();
    } catch (err) {
      console.warn(`[mbti-library] generate failed for ${c.key}:`, (err as Error).message);
    }
  }
}
