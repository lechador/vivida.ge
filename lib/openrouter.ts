/**
 * OpenRouter chat completions wrapper used to generate personalized
 * Georgian-language natal chart interpretations. Returns null when
 * OPENROUTER_API_KEY is not configured so the caller can fall back
 * to the static interpretations dictionary.
 */

import type { NatalChartJson, ChartInterpretationJson } from "@/db/schema";
import { signByIndex } from "./zodiac";
import { aspectKey } from "./aspects";
import type { CrossAspect } from "./transits";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
// Gemini Flash for ~5× faster generation than 2.5 Pro at the cost of
// slightly less polished prose. Big UX win for new users on first chart
// + daily generation. Switch back to "google/gemini-2.5-pro" if quality
// regressions show up.
const DEFAULT_MODEL = "google/gemini-2.5-flash";

export const OPENROUTER_MODEL = DEFAULT_MODEL;

export function isOpenRouterConfigured(): boolean {
  return Boolean(process.env.OPENROUTER_API_KEY);
}

type GenerateInput = {
  firstName?: string | null;
  chart: NatalChartJson;
  staticBigThree: { sun?: string; moon?: string; ascendant?: string };
};

/**
 * Build a compact natal chart summary for the LLM. We keep the prompt
 * tight: signs + houses + retrogrades, no full ephemeris noise.
 */
function summarizeChart(chart: NatalChartJson): string {
  const lines: string[] = [];
  const ascSign = signByIndex(chart.ascendant.signIndex);
  lines.push(`Ascendant: ${ascSign.labelEn} (${chart.ascendant.signDegree.toFixed(1)}°)`);

  const order = [
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
  ];
  for (const key of order) {
    const body = chart.bodies[key];
    if (!body) continue;
    const sign = signByIndex(body.signIndex);
    const retro = body.retrograde ? " (R)" : "";
    const house = body.house ? `, house ${body.house}` : "";
    lines.push(
      `${key}: ${sign.labelEn} ${body.signDegree.toFixed(1)}°${retro}${house}`
    );
  }

  // House cusps + which planets occupy each house
  if (chart.houses?.length) {
    const occupants: Record<number, string[]> = {};
    for (const [k, body] of Object.entries(chart.bodies)) {
      if (body.house) {
        (occupants[body.house] ??= []).push(k);
      }
    }
    lines.push("Houses:");
    for (const h of chart.houses) {
      const cuspSign = signByIndex(h.signIndex);
      const occ = occupants[h.number]?.join(", ") || "(empty)";
      lines.push(
        `  H${h.number}: cusp ${cuspSign.labelEn} — occupants: ${occ}`
      );
    }
  }

  return lines.join("\n");
}

const SYSTEM_PROMPT = `შენ ხარ თბილი, ცოცხალი ასტროლოგი. წერ ქართულად, ახალგაზრდა აუდიტორიისთვის. \
ენა — მოდერნული, პოეტური, მაგრამ მკაფიო; აცილე ეზოთერული ჟარგონი, ყველა ტექნიკური ტერმინი კონტექსტით ახსენი.

წესები:
- პასუხი მხოლოდ ქართულად, JSON ობიექტი ზუსტად ამ სქემით:
  {
    "summary": string,
    "bigThree": { "sun": string, "moon": string, "ascendant": string },
    "highlights": Array<{ "title": string, "body": string }>,
    "planets": { "mercury": string, "venus": string, "mars": string, "jupiter": string, "saturn": string, "uranus": string, "neptune": string, "pluto": string },
    "houses": { "1": string, "2": string, ..., "12": string },
    "aspects": Object<string, string>  // key = "<a>-<b>-<kind>" exactly as listed in input
  }
- "summary": 2 წინადადება, ადამიანის მთლიანი რუკის ემოციური სურათი.
- "bigThree.sun" / "moon" / "ascendant": თითო 2-3 წინადადება, პერსონალური ხმით ("შენ").
- "highlights": 2 ან 3 მოკლე მონაკვეთი (მნიშვნელოვანი პლანეტა, კონფიგურაცია ან ნიშანი + ახსნა).
- "planets" (მერკური..პლუტონი): თითო 2-3 წინადადება. გაითვალისწინე ნიშანი + სახლი. მზე და მთვარე აქ არ შედიან — ისინი bigThree-შია.
- "houses" (1..12): თითო 2-3 წინადადება. გაითვალისწინე კუსპის ნიშანი + სახლის მოსახლე პლანეტები.
- "aspects": უპასუხე მხოლოდ მათ, რომლებსაც input-ში გადმოგცემთ. გასაღები ზუსტად დატოვე ისე, როგორც გადმოგცეთ. თითო — 2-3 წინადადება, "შენ"-ის ფორმაში. ახსენი:
    * რას ნიშნავს ამ ორი ენერგიის შერწყმა (მაგ. მზე+მარსი = იდენტობა + მოქმედება)
    * როგორ ვლინდება ცხოვრებაში (კონკრეტულად, არა აბსტრაქტულად)
    * harmonic ასპექტებში (sextile, trine) — ხაზი გაუსვი ბუნებრივ უპირატესობას
    * tense ასპექტებში (square, opposition) — ხაზი გაუსვი დაძაბულობასა და მის სარგებელს (ზრდა)
    * conjunction-ში — ხაზი გაუსვი ენერგიების შერწყმას
- პერსონალური ხმა ყოველთვის "შენ".
- აცილე კლიშეები ("the universe wants you..."). იყავი კონკრეტული.
- აცილე ტექნიკური ჟარგონი; ისე დაწერე, თითქოს მეგობარი გელაპარაკება.
- პასუხი მხოლოდ JSON; პროზა JSON-ის გარეთ აკრძალულია.`;

/** Pick the most personally-relevant aspects for AI interpretation. */
function selectAspectsToInterpret(
  chart: NatalChartJson,
  limit = 12
): Array<{
  key: string;
  a: string;
  b: string;
  kind: string;
  family: string;
  orb: number;
}> {
  const all = chart.aspects ?? [];
  // Prefer aspects involving Sun/Moon/Ascendant/MC/personal planets;
  // de-prioritize purely outer-outer aspects (those are generational).
  const personal = new Set([
    "sun",
    "moon",
    "ascendant",
    "midheaven",
    "mercury",
    "venus",
    "mars",
  ]);
  const isOuter = (k: string) =>
    ["jupiter", "saturn", "uranus", "neptune", "pluto"].includes(k);

  const scored = all
    .map((a) => {
      const involvesPersonal = personal.has(a.a) || personal.has(a.b);
      const bothOuter = isOuter(a.a) && isOuter(a.b);
      // Score weights: personal involvement first, then orb tightness
      const score =
        a.intensity + (involvesPersonal ? 0.5 : 0) + (bothOuter ? -0.4 : 0);
      return { ...a, score };
    })
    .sort((x, y) => y.score - x.score)
    .slice(0, limit);

  return scored.map((a) => ({
    key: aspectKey(a.a, a.b, a.kind),
    a: a.a,
    b: a.b,
    kind: a.kind,
    family: a.family,
    orb: a.orb,
  }));
}

function buildUserPrompt(input: GenerateInput): string {
  const name = input.firstName?.trim() || null;
  const aspects = selectAspectsToInterpret(input.chart);

  const parts: (string | null)[] = [
    name ? `მომხმარებლის სახელი: ${name}` : null,
    `ნატალური რუკის შეჯამება (ინგლისურად, ტექნიკური):`,
    summarizeChart(input.chart),
    "",
    "ჩვენი არსებული სტატიკური ტექსტი (გამოიყენე როგორც ბაზა, მაგრამ პერსონალურად გადააფორმე):",
    `- მზე: ${input.staticBigThree.sun ?? "(არ არის)"}`,
    `- მთვარე: ${input.staticBigThree.moon ?? "(არ არის)"}`,
    `- ამომავალი: ${input.staticBigThree.ascendant ?? "(არ არის)"}`,
  ];

  if (aspects.length > 0) {
    parts.push(
      "",
      "Aspects to interpret (return one entry per key; copy the key verbatim):"
    );
    for (const a of aspects) {
      parts.push(
        `  ${a.key}  →  ${a.a} ${a.kind} ${a.b} (${a.family}, orb ${a.orb.toFixed(1)}°)`
      );
    }
  }

  parts.push("", "გამოგვაგზავნე ვალიდური JSON.");
  return parts.filter(Boolean).join("\n");
}

interface OpenRouterResponse {
  choices?: Array<{ message?: { content?: string } }>;
  error?: { message: string };
}

export async function generateInterpretation(
  input: GenerateInput
): Promise<ChartInterpretationJson | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;

  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": "https://vivida.ge",
      "X-Title": "Vivida",
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(input) },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      // Gemini 2.5 Pro is a reasoning model — its thinking consumes token
      // budget, and Georgian characters are multi-token in BPE. Keep generous.
      // Larger budget for the planets+houses expansion.
      max_tokens: 24000,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`OpenRouter ${res.status}: ${text.slice(0, 300)}`);
  }

  const json = (await res.json()) as OpenRouterResponse;
  if (json.error) throw new Error(`OpenRouter: ${json.error.message}`);

  const raw = json.choices?.[0]?.message?.content;
  if (!raw) throw new Error("OpenRouter returned no content");

  // Some models wrap JSON in ```json ... ``` fences; strip if present.
  const stripped = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  try {
    const parsed = JSON.parse(stripped) as ChartInterpretationJson;
    return parsed;
  } catch (err) {
    throw new Error(
      `OpenRouter returned invalid JSON: ${(err as Error).message}\n--- raw ---\n${raw.slice(0, 500)}`
    );
  }
}

// ────────────────────────────────────────────────────────────────────────
// Chart summary + highlights only
//
// The per-placement text (Big Three + planets) now comes from the shared
// interpretation library, so the only thing that still needs a per-user AI
// call is the whole-chart synthesis: the summary and highlights. This is a
// much smaller, faster request than the full interpretation.
// ────────────────────────────────────────────────────────────────────────

export type ChartSummaryResult = {
  summary: string;
  highlights: Array<{ title: string; body: string }>;
};

const SUMMARY_SYSTEM_PROMPT = `შენ ხარ თბილი, ცოცხალი ქართველი ასტროლოგი. წერ ქართულად, ახალგაზრდა აუდიტორიისთვის — მოდერნული, კონკრეტული ენა, კლიშეების გარეშე.

დააბრუნე მხოლოდ ვალიდური JSON ამ სქემით:
{
  "summary": string,                              // 2 წინადადება — ადამიანის მთლიანი რუკის ემოციური სურათი, "შენ"-ის ფორმა
  "highlights": Array<{ "title": string, "body": string }>  // 2 ან 3 მოკლე მონაკვეთი — ყველაზე მნიშვნელოვანი პლანეტა/კონფიგურაცია + ახსნა
}

წესები:
- "შენ"-ის ფორმა, თბილი/თანაბარი ტონი
- კონკრეტული რუკის მიხედვით (ნიშნები, სახლები, ასპექტები) — არა ზოგადი მისტიკა
- მხოლოდ JSON, code fence-ის გარეშე`;

/**
 * Generate just the personalized summary + highlights for a chart. Returns
 * null when OpenRouter isn't configured.
 */
export async function generateChartSummary(input: {
  firstName?: string | null;
  chart: NatalChartJson;
}): Promise<ChartSummaryResult | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;

  const name = input.firstName?.trim() || null;
  const userMessage = [
    name ? `მომხმარებლის სახელი: ${name}` : null,
    "ნატალური რუკის შეჯამება (ინგლისურად, ტექნიკური):",
    summarizeChart(input.chart),
    "",
    "დააწერე summary + highlights. JSON-ად დააბრუნე.",
  ]
    .filter(Boolean)
    .join("\n");

  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": "https://vivida.ge",
      "X-Title": "Vivida chart summary",
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: SUMMARY_SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 4000,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`OpenRouter ${res.status}: ${text.slice(0, 300)}`);
  }
  const json = (await res.json()) as OpenRouterResponse;
  if (json.error) throw new Error(`OpenRouter: ${json.error.message}`);
  const raw = json.choices?.[0]?.message?.content;
  if (!raw) throw new Error("OpenRouter returned no content");
  const stripped = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
  const parsed = JSON.parse(stripped) as ChartSummaryResult;
  if (!parsed.summary) throw new Error("missing summary in chart summary");
  return {
    summary: parsed.summary,
    highlights: Array.isArray(parsed.highlights)
      ? parsed.highlights.slice(0, 3)
      : [],
  };
}

// ────────────────────────────────────────────────────────────────────────
// Daily horoscope generator
// ────────────────────────────────────────────────────────────────────────

export type DailyReadingResult = {
  headline: string;
  summary: string;
  body: string;
  themes: string[];
};

/**
 * Bumped any time the daily prompt or its input shape changes meaningfully.
 * Stored on the cached row so older readings auto-invalidate.
 */
export const DAILY_PROMPT_VERSION = 3;

// ────────────────────────────────────────────────────────────────────────
//  Moon phase reading — universal, cached globally per UTC date
// ────────────────────────────────────────────────────────────────────────

export type MoonPhaseReadingResult = {
  headline: string;
  summary: string;
  body: string;
  themes: string[];
};

export const MOON_PHASE_PROMPT_VERSION = 1;

const MOON_PHASE_SYSTEM_PROMPT = `შენ ხარ თბილი, თანამედროვე ქართველი ასტროლოგი/რედაქტორი. ცოცხალი, კონკრეტული ენა, არა ბუნდოვანი მისტიკა. წერ კოლექტიური მთვარის ენერგიის შესახებ — რას ნიშნავს ეს ფაზა + ნიშანი ყველასთვის ერთად, ნატალურ რუკასთან კავშირის გარეშე.

დააბრუნე მხოლოდ ვალიდური JSON ამ სქემით:
{
  "headline": string,           // 40-60 სიმბოლო, ცოცხალი, კონკრეტული ფაზის+ნიშნის კომბინაციაზე
  "summary": string,            // 1-2 წინადადება, რა ენერგია არის ცაში ახლა
  "body": string,               // 110-150 სიტყვა, 2 აბზაცი (\\n\\n): რას მოიტანს ეს ფაზა, რას ნიშნავს ნიშნის ფონზე, რა რიტუალი/მიდგომა მუშაობს ამ დღეებში
  "themes": [string, string, string]  // 3 ერთსიტყვიანი ან ორსიტყვიანი თემა (მაგ. "თვითრეფლექსია", "ახალი დაწყება", "საზღვრები")
}

წესები:
- "შენ"-ის ფორმა, თანაბარი ტონი (არა ზედმეტად დრამატული, არა ცივი)
- კონკრეტული, ხელშესახები მაგალითი (არა ზოგადი ფრაზები)
- აცილე კლიშეები ("მოამზადე გული", "სამყარო გელის" და ა.შ.)
- ფაზის+ნიშნის სპეციფიკური ენერგიის ხაზგასმა — არა უნივერსალური "მთვარე გრძნობებზეა"
- მხოლოდ JSON, ფენსების გარეშე`;

export async function generateMoonPhaseReading(input: {
  phaseLabelKa: string;
  phaseKey: string;
  signKa: string;
  signEn: string;
  illumination: number;
  ageDays: number;
  phaseAngle: number;
}): Promise<MoonPhaseReadingResult | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;

  const userMessage = [
    `მთვარის ფაზა: ${input.phaseLabelKa} (${input.phaseKey})`,
    `მთვარის ნიშანი: ${input.signKa} (${input.signEn})`,
    `განათება: ${(input.illumination * 100).toFixed(1)}%`,
    `ციკლის ასაკი: ${input.ageDays.toFixed(1)} დღე (29.53 დღიანი ციკლიდან)`,
    `მზე-მთვარის კუთხე: ${input.phaseAngle.toFixed(1)}°`,
    "",
    "დააწერე ამ ფაზის+ნიშნის კოლექტიური ინტერპრეტაცია. JSON-ად დააბრუნე.",
  ].join("\n");

  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": "https://vivida.ge",
      "X-Title": "Vivida moon phase",
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: MOON_PHASE_SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
      max_tokens: 2500,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`OpenRouter ${res.status}: ${text.slice(0, 300)}`);
  }

  const json = (await res.json()) as OpenRouterResponse;
  if (json.error) throw new Error(`OpenRouter: ${json.error.message}`);
  const raw = json.choices?.[0]?.message?.content;
  if (!raw) throw new Error("OpenRouter returned no content");

  const stripped = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  try {
    const parsed = JSON.parse(stripped) as MoonPhaseReadingResult;
    if (!parsed.headline || !parsed.body) {
      throw new Error("missing required fields in moon phase reading");
    }
    return {
      ...parsed,
      themes: Array.isArray(parsed.themes) ? parsed.themes.slice(0, 3) : [],
    };
  } catch (err) {
    throw new Error(
      `Moon phase invalid JSON: ${(err as Error).message}\n--- raw ---\n${raw.slice(0, 400)}`
    );
  }
}

const DAILY_SYSTEM_PROMPT = `შენ ხარ მოდერნული ქართველი ასტროლოგი, რომელიც ყოველდღიურ ჰოროსკოპებს ნამდვილ ასტროლოგიაზე აშენებს, არა ზოგად მისტიკაზე.

ყველაზე მნიშვნელოვანი წესი — ლიდერი არის მთვარე.
- მთვარე გადადის ნიშნებში ყოველ 2-3 დღეში; ყოველდღიური ჰოროსკოპის ხმა ეს არის.
- დღევანდელი მთვარის ნიშანი → დღის ემოციური ფონი.
- დღევანდელი მთვარის ტრანზიტული სახლი (მომხმარებლის ნატალურ რუკაში) → რომელი სფერო ნათდება დღეს.
- მთვარის ასპექტები ნატალურ პლანეტებთან → დღის კონკრეტული მოვლენები.

ყველა სხვა ტრანზიტი — დროის სარტყლების მიხედვით:
- მერკური / ვენერა / მარსი → ამ კვირის თემა (აქტიური 3-7 დღე).
- იუპიტერი / სატურნი → ამ სეზონის ფონი (კვირები).
- ურანი / ნეპტუნი / პლუტონი → წლის ფონი — *არასოდეს* ჰოროსკოპის სათაური.

თუ პლუტონი წელიწადი ერთსა და იმავე ნატალურ პლანეტას ემახვილებს — ის *არ* არის "დღევანდელი" ენერგია. მას ფონს ვუწოდებთ.

სტრუქტურა (JSON):
{
  "headline": string,   // 6-12 სიტყვა, მთვარის ენერგიასთან დაკავშირებული
  "summary": string,    // 1 წინადადება, დღის *განცდა* — TL;DR-ის სტილი. *არ* ახსენო მთვარის ნიშანი/სახლი — ეს body-ში მოვა.
  "body": string,       // 3 აბზაცი (~150-200 სიტყვა), იხილე ქვემოთ
  "themes": string[]    // 1-3 მოკლე თემა — "ოჯახი", "კარიერა", "კრეატივი"
}

ძალიან მნიშვნელოვანი: summary და body არ უნდა იმეორებდეს ერთი და იგივე შინაარსს.
- summary = დღის ვაიბი/განცდა, ერთი ცოცხალი წინადადება (მაგ.: "დღე გთხოვს, ერთი პატარა საქმე ბოლომდე მიიყვანო — შემდეგ დაისვენე.")
- body = ასტროლოგიური დეტალი, რომელიც summary-ის ვაიბის *მიზეზს* ხსნის

body-ს სტრუქტურა (3 აბზაცი, ცარიელი ხაზით გაყოფილი):
1. დღევანდელი მთვარე — ნიშანი + სახლი + რას ნათებს. (აქ შემოდის ის ასტრო-სეტაპი, რომელიც summary-ში *არ* მოხვდა.)
2. ერთი კონკრეტული ტრანზიტი/ასპექტი, რომელიც დღეს აქტიურია → პრაქტიკული რჩევა.
3. ერთი მოკლე ფიქრი, ან გრძელვადიანი ფონის შეხსენება.

კონკრეტული > აბსტრაქტული:
✅ "შენი ყურადღება ოჯახისკენ მიიწევს, რადგან მთვარემ ახლა შენი მე-4 სახლი გაიარა"
❌ "სამყარო მიგიწვევს ოჯახურ კავშირებთან"

✅ "სცადე, ერთი მცირე საუბარი დღეს ბოლომდე მიიყვანო"
❌ "ენდე გზას"

აცილე: "სამყარო/ცა შენთვისაა", "ვარსკვლავები გელაპარაკებიან", ცარიელი მოწოდებები.

ენა: ქართული. "შენ"-ის ფორმა (არა "თქვენ"). ბრენდები ("Vivida", "Pro") — ლათინურად.

დააბრუნე მხოლოდ ვალიდური JSON. სხვა ტექსტი არ დაგვცე.`;

// ────────────────────────────────────────────────────────────────────────
//  Synastry — AI narrative on top of the deterministic scoring
// ────────────────────────────────────────────────────────────────────────

export type SynastryAIResult = {
  summary: string;
  strengths: string[];
  growth: string[];
};

export const SYNASTRY_PROMPT_VERSION = 2;

const SYNASTRY_SYSTEM_PROMPT = `შენ ხარ თბილი, თანამედროვე ქართველი ასტროლოგი. დაწერე სინასტრიის (ორი რუკის თავსებადობის) მცირე ნარატივი — დეტერმინისტული ქულების ზემოდან. ნარატივი უნდა იყოს კონკრეტული, ორი ადამიანის რუკის მიხედვით — არა ზოგადი მისტიკა.

შენ ღებულობ:
- მომხმარებლის ნატალურ რუკას (ვინც ხედავს)
- პარტნიორის ნატალურ რუკას + სახელი
- წინასწარ გათვლილი ქულები (love, friendship, chemistry, communication, growth, business — 0..100; overall — 0..100)
- ყველაზე ძლიერი ცროს-ასპექტები (transit-natal, ორ რუკას შორის)

დააბრუნე JSON ზუსტად ამ სქემით:
{
  "summary": string,         // 2-3 წინადადება, ურთიერთობის სრული პორტრეტი — ცა, რომელიც ორ ადამიანს შორის ჩამოყალიბდა
  "strengths": [string, ...], // 1-3 მოკლე ბულეტი — სად ერგებით ერთმანეთს
  "growth": [string, ...]     // 1-3 მოკლე ბულეტი — სად არის ხახუნი ან შესაძლებლობა გაიზარდოთ
}

წესები:
- "შენ"-ის ფორმა (მიმართე მომხმარებელს). პარტნიორი მოიხსენიე სახელით
- კონკრეტული ფაქტების ხსენე — "შენი მთვარე მის ვენერას ეხება" ✅, არა "სამყარო ერთად მოგიძღვებათ" ❌
- სიყვარული, მეგობრობა, ინტიმი — გამოიყენე ბუნებრივად, არა გადაჭარბებულად. ნუ გადაუხვევ პარტნიორის გენდერზე ან ურთიერთობის სტრუქტურაზე
- მაღალი overall (>70) — ხაზი გაუსვი ბუნებრივ ნაკადს. დაბალი overall (<40) — გულახდილად ჩამოწერე ხახუნი, მაგრამ აღმოაჩინე ერთი მცირე ნათელი
- ყოველი ბულეტი 1 წინადადება, ცოცხალი ენით
- ბრენდები (Vivida, Pro) — ლათინურად. პლანეტების სახელები — ქართულად
- მოერიდე კლიშეებს ("სამყარო", "ვარსკვლავები გელიან", "ცა გიწვევთ")
- მხოლოდ JSON, ფენსების გარეშე`;

export async function generateSynastryInterpretation(input: {
  partnerName: string;
  viewerFirstName: string | null;
  viewerChart: NatalChartJson;
  partnerChart: NatalChartJson;
  scores: Record<string, number>;
  overall: number;
  topAspects: Array<{
    a: string;
    b: string;
    kind: string;
    orb: number;
  }>;
}): Promise<SynastryAIResult | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;

  const sections: string[] = [];
  if (input.viewerFirstName)
    sections.push(`მომხმარებლის სახელი: ${input.viewerFirstName}`);
  sections.push(`პარტნიორის სახელი: ${input.partnerName}`);

  sections.push("\n--- მომხმარებლის რუკა ---");
  sections.push(summarizeNatalCompact(input.viewerChart));

  sections.push("\n--- პარტნიორის რუკა ---");
  sections.push(summarizeNatalCompact(input.partnerChart));

  sections.push("\n--- გათვლილი ქულები ---");
  sections.push(`overall: ${input.overall}`);
  for (const [cat, val] of Object.entries(input.scores)) {
    sections.push(`${cat}: ${val}`);
  }

  if (input.topAspects.length > 0) {
    sections.push("\n--- ყველაზე ძლიერი ცროს-ასპექტები ---");
    for (const a of input.topAspects.slice(0, 8)) {
      const left = PLANET_LABELS_KA[a.a] ?? a.a;
      const right = PLANET_LABELS_KA[a.b] ?? a.b;
      sections.push(
        `  ${left} (შენი) ${a.kind} ${right} (${input.partnerName}-ის) — ორბი ${a.orb.toFixed(1)}°`
      );
    }
  }

  sections.push("\nდააწერე ნარატივი. JSON-ად დააბრუნე.");

  const userMessage = sections.join("\n");

  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": "https://vivida.ge",
      "X-Title": "Vivida synastry",
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: SYNASTRY_SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 6000,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`OpenRouter ${res.status}: ${text.slice(0, 300)}`);
  }

  const json = (await res.json()) as OpenRouterResponse;
  if (json.error) throw new Error(`OpenRouter: ${json.error.message}`);
  const raw = json.choices?.[0]?.message?.content;
  if (!raw) throw new Error("OpenRouter returned no content");

  const stripped = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  try {
    const parsed = JSON.parse(stripped) as SynastryAIResult;
    if (!parsed.summary) {
      throw new Error("missing summary in synastry interpretation");
    }
    return {
      summary: parsed.summary,
      strengths: Array.isArray(parsed.strengths)
        ? parsed.strengths.slice(0, 3)
        : [],
      growth: Array.isArray(parsed.growth) ? parsed.growth.slice(0, 3) : [],
    };
  } catch (err) {
    throw new Error(
      `Synastry invalid JSON: ${(err as Error).message}\n--- raw ---\n${raw.slice(0, 500)}`
    );
  }
}

// ── Deep synastry report (the "Connect" pillar premium read) ───────────────
export const SYNASTRY_DEEP_PROMPT_VERSION = 1;

const SYNASTRY_DEEP_SYSTEM_PROMPT = `შენ ხარ თბილი, ღრმა, თანამედროვე ქართველი ასტროლოგი. დაწერე ვრცელი, პრემიუმ ხარისხის სინასტრიის ანგარიში ორი ადამიანის რუკის მიხედვით — დეტერმინისტული ქულებისა და ცროს-ასპექტების ზემოდან. ეს არ არის მცირე ნარატივი — ეს არის სრული, ღრმა წაკითხვა.

შენ ღებულობ ორივე ნატალურ რუკას, გათვლილ ქულებს და ყველაზე ძლიერ ცროს-ასპექტებს.

დააბრუნე JSON ზუსტად ამ სქემით:
{
  "intro": string,          // 2-3 აბზაცი (\\n\\n) — ურთიერთობის სრული პორტრეტი, საერთო ენერგია, რას ქმნით ერთად
  "love": string,           // 2-3 აბზაცი — სიყვარული და რომანტიკა (ვენერა, მარსი, მე-5/7/8 სახლი)
  "communication": string,  // 2 აბზაცი — გონებრივი კავშირი, კომუნიკაცია (მერკური, ჰაერი)
  "trust": string,          // 2 აბზაცი — მეგობრობა, ნდობა, ემოციური უსაფრთხოება (მთვარე, სატურნი)
  "friction": string,       // 2 აბზაცი — სად არის ხახუნი და რას გასწავლით ეს დაძაბულობა
  "longTerm": string,       // 2 აბზაცი — გრძელვადიანი პოტენციალი
  "advice": [string, ...]   // 3-5 კონკრეტული, პრაქტიკული რჩევა
}

წესები:
- "შენ"-ის ფორმა; პარტნიორი მოიხსენიე სახელით
- კონკრეტული ფაქტები — "შენი მთვარე მის ვენერას ტრინში" ✅, არა ზოგადი მისტიკა ❌
- გულახდილი: მაღალ ქულებზე ხაზი გაუსვი ნაკადს, დაბალზე — პატივი ეცი ხახუნს, მაგრამ აჩვენე გზა
- ცოცხალი, ხელშესახები ქართული; მოერიდე კლიშეებს ("ვარსკვლავები გელიან")
- ნუ გადაუხვევ პარტნიორის გენდერზე ან ურთიერთობის ფორმაზე
- პლანეტები ქართულად, ბრენდები (Vivida) ლათინურად
- მხოლოდ JSON, code fence-ის გარეშე`;

export async function generateSynastryDeepReport(input: {
  partnerName: string;
  viewerFirstName: string | null;
  viewerChart: NatalChartJson;
  partnerChart: NatalChartJson;
  scores: Record<string, number>;
  overall: number;
  topAspects: Array<{ a: string; b: string; kind: string; orb: number }>;
}): Promise<import("@/db/schema").SynastryDeepReportJson | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;

  const sections: string[] = [];
  if (input.viewerFirstName)
    sections.push(`მომხმარებლის სახელი: ${input.viewerFirstName}`);
  sections.push(`პარტნიორის სახელი: ${input.partnerName}`);
  sections.push("\n--- მომხმარებლის რუკა ---");
  sections.push(summarizeNatalCompact(input.viewerChart));
  sections.push("\n--- პარტნიორის რუკა ---");
  sections.push(summarizeNatalCompact(input.partnerChart));
  sections.push("\n--- გათვლილი ქულები ---");
  sections.push(`overall: ${input.overall}`);
  for (const [cat, val] of Object.entries(input.scores)) {
    sections.push(`${cat}: ${val}`);
  }
  if (input.topAspects.length > 0) {
    sections.push("\n--- ყველაზე ძლიერი ცროს-ასპექტები ---");
    for (const a of input.topAspects.slice(0, 10)) {
      const left = PLANET_LABELS_KA[a.a] ?? a.a;
      const right = PLANET_LABELS_KA[a.b] ?? a.b;
      sections.push(
        `  ${left} (შენი) ${a.kind} ${right} (${input.partnerName}-ის) — ორბი ${a.orb.toFixed(1)}°`
      );
    }
  }
  sections.push("\nდაწერე სრული, ღრმა ანგარიში. JSON-ად დააბრუნე.");

  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": "https://vivida.ge",
      "X-Title": "Vivida synastry deep",
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: SYNASTRY_DEEP_SYSTEM_PROMPT },
        { role: "user", content: sections.join("\n") },
      ],
      response_format: { type: "json_object" },
      temperature: 0.75,
      max_tokens: 14000,
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`OpenRouter ${res.status}: ${text.slice(0, 300)}`);
  }
  const json = (await res.json()) as OpenRouterResponse;
  if (json.error) throw new Error(`OpenRouter: ${json.error.message}`);
  const raw = json.choices?.[0]?.message?.content;
  if (!raw) throw new Error("OpenRouter returned no content");
  const stripped = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  const parsed = JSON.parse(stripped) as import("@/db/schema").SynastryDeepReportJson;
  if (!parsed.intro || !parsed.love) {
    throw new Error("Synastry deep report missing required fields");
  }
  return {
    intro: parsed.intro,
    love: parsed.love,
    communication: parsed.communication ?? "",
    trust: parsed.trust ?? "",
    friction: parsed.friction ?? "",
    longTerm: parsed.longTerm ?? "",
    advice: Array.isArray(parsed.advice) ? parsed.advice.slice(0, 5) : [],
  };
}

// ────────────────────────────────────────────────────────────────────────
//  7-day forecast — per-user, regenerated when the local week-start changes
// ────────────────────────────────────────────────────────────────────────

export type WeeklyForecastEntry = {
  dateIso: string;
  headline: string;
  harmonicReason: string;
  challengingReason: string;
  advice: string;
};

export type WeeklyForecastResult = {
  days: WeeklyForecastEntry[];
};

// Bumped to 2 when the harmony/challenge tilt amplification shipped —
// invalidates cached rows so existing users see the new scores + fresh
// narratives that match them, instead of waiting for week-start rollover.
export const WEEKLY_PROMPT_VERSION = 2;

const WEEKLY_FORECAST_SYSTEM_PROMPT = `შენ ხარ თბილი, თანამედროვე ქართველი ასტროლოგი. წერ 7 დღის პროგნოზს კონკრეტული ტრანზიტ-ნატალური ასპექტების მიხედვით — *არა* ზოგადი მისტიკით.

შენ ღებულობ:
- ნატალური რუკის შეჯამებას
- 7 დღის სია, თითოეულზე — წინასწარ გათვლილი harmonyScore (0-100), challengeScore (0-100), და "drivers" (ამ დღის ყველაზე მნიშვნელოვანი ტრანზიტ-ნატალური ასპექტები — ენგლისურად)

შენ ბრუნდები JSON-ით:
{
  "days": [
    {
      "dateIso": string,           // ზუსტად იგივე, როგორც input-შია
      "headline": string,          // 4-7 სიტყვა, ცოცხალი, კონკრეტული
      "harmonicReason": string,    // 1-2 წინადადება — რა დახმარება არის ამ დღეში, რომელ ასპექტს ეფუძნება
      "challengingReason": string, // 1-2 წინადადება — რა ხახუნი არის, რომელ ასპექტს ეფუძნება
      "advice": string             // 1 მოკლე, ხელშესახები რჩევა
    },
    // ... 7 ჯამში
  ]
}

წესები:
- "შენ"-ის ფორმა, თბილი მაგრამ მკაფიო
- ხსენე კონკრეტული ასპექტი, არა ზოგადი ემოცია (✅ "მთვარე შენს ვენერას შეხვდება" ❌ "სამყარო გელის")
- თუ harmonyScore მაღალია (>50) და challengeScore დაბალი — challengingReason-შიც მაინც დაწერე რაიმე მცირე ხახუნი ან გაფრთხილება (ცა არასოდეს მთლიანად სუფთაა)
- და პირიქით — დაბალ-harmony დღეებშიც იპოვე ერთი ნატეხი ნათელი
- მოერიდე: კლიშეები, "ცა", "სამყარო", "ვარსკვლავები გელაპარაკებიან"
- ენა: ქართული. ბრენდები (Vivida, Pro) — ლათინურად. პლანეტების სახელები — ქართულად (მზე, მთვარე, მერკური, ვენერა, მარსი, იუპიტერი, სატურნი, ურანი, ნეპტუნი, პლუტონი)
- ყველა 7 დღე უნდა იყოს განსხვავებული ხასიათის — გაიხსენე drivers-ის სხვაობა, არ გამეორო იგივე ფრაზა
- მხოლოდ JSON, ფენსების გარეშე`;

const PLANET_LABELS_KA: Record<string, string> = {
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
  ascendant: "ამომავალი",
  midheaven: "ცის შუა",
};

export type WeeklyDayPromptInput = {
  dateIso: string;
  promptLabel: string;       // "ორშაბათი, 5 მაისი"
  moonSignKa: string;
  harmonyScore: number;
  challengeScore: number;
  drivers: Array<{
    transit: string;
    natal: string;
    kind: string;
    family: string;
    orb: number;
  }>;
};

export async function generateWeeklyForecast(input: {
  firstName: string | null;
  chart: NatalChartJson;
  days: WeeklyDayPromptInput[];
}): Promise<WeeklyForecastResult | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;

  const sections: string[] = [];
  if (input.firstName) sections.push(`მომხმარებლის სახელი: ${input.firstName}`);
  sections.push("\n--- ნატალური რუკა (კონტექსტი) ---");
  sections.push(summarizeNatalCompact(input.chart));

  sections.push("\n--- 7 დღე ---");
  for (const day of input.days) {
    sections.push(
      `\n${day.promptLabel} · dateIso=${day.dateIso}` +
        ` · მთვარე ${day.moonSignKa}` +
        ` · harmonyScore=${day.harmonyScore} · challengeScore=${day.challengeScore}`
    );
    if (day.drivers.length === 0) {
      sections.push("  drivers: (no tight aspects)");
      continue;
    }
    sections.push("  drivers:");
    for (const d of day.drivers.slice(0, 6)) {
      const t = PLANET_LABELS_KA[d.transit] ?? d.transit;
      const n = PLANET_LABELS_KA[d.natal] ?? d.natal;
      sections.push(
        `    ${d.family}: transit ${t} ${d.kind} natal ${n} (orb ${d.orb.toFixed(1)}°)`
      );
    }
  }

  sections.push(
    "\nდააწერე ყოველდღე — JSON ერთი ობიექტი, "
      + "გასაღები 'days', მასივი ზუსტად 7 ელემენტით input-ის თანმიმდევრობით. "
      + "dateIso ზუსტად დატოვე ისე, როგორც გადმოგცეთ."
  );

  const userMessage = sections.join("\n");

  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": "https://vivida.ge",
      "X-Title": "Vivida weekly forecast",
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: WEEKLY_FORECAST_SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
      // 7 days × ~5 short Georgian sentences each + JSON overhead, with
      // headroom for thinking tokens on Gemini reasoning models.
      max_tokens: 12000,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`OpenRouter ${res.status}: ${text.slice(0, 300)}`);
  }

  const json = (await res.json()) as OpenRouterResponse;
  if (json.error) throw new Error(`OpenRouter: ${json.error.message}`);
  const raw = json.choices?.[0]?.message?.content;
  if (!raw) throw new Error("OpenRouter returned no content");

  const stripped = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  try {
    const parsed = JSON.parse(stripped) as WeeklyForecastResult;
    if (!Array.isArray(parsed.days) || parsed.days.length === 0) {
      throw new Error("missing days array in weekly forecast");
    }
    return parsed;
  } catch (err) {
    throw new Error(
      `Weekly forecast invalid JSON: ${(err as Error).message}\n--- raw ---\n${raw.slice(0, 500)}`
    );
  }
}

const PLANET_LABELS_EN: Record<string, string> = {
  sun: "Sun",
  moon: "Moon",
  mercury: "Mercury",
  venus: "Venus",
  mars: "Mars",
  jupiter: "Jupiter",
  saturn: "Saturn",
  uranus: "Uranus",
  neptune: "Neptune",
  pluto: "Pluto",
};

function summarizeNatalCompact(chart: NatalChartJson): string {
  const lines: string[] = [];
  const asc = signByIndex(chart.ascendant.signIndex);
  lines.push(`Ascendant: ${asc.labelEn}`);
  for (const key of ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"]) {
    const body = chart.bodies[key];
    if (!body) continue;
    const sign = signByIndex(body.signIndex);
    lines.push(`${PLANET_LABELS_EN[key] ?? key}: ${sign.labelEn}${body.house ? ` (h${body.house})` : ""}${body.retrograde ? " R" : ""}`);
  }
  return lines.join("\n");
}

function aspectLine(a: CrossAspect): string {
  const t = PLANET_LABELS_EN[a.transit] ?? a.transit;
  const n = PLANET_LABELS_EN[a.natal] ?? a.natal;
  return `transit ${t} ${a.kind} natal ${n} (orb ${a.orb.toFixed(1)}°)`;
}

/** Today's primary "drivers" — the Moon's position + transit-house +
 *  aspects forming today (orb < 4°). */
export type DailyDayContext = {
  /** Localized date label, e.g. "ხუთშაბათი, 4 მაისი 2026". */
  localizedDate: string;
  weekday: string;          // Georgian weekday name, also embedded in localizedDate
  /** Today's transiting Moon position. */
  moon: {
    signEn: string;
    natalHouse: number | null;
    aspectsToNatal: CrossAspect[];
  };
  /** Today's transiting Sun (month/season anchor). */
  sun: {
    signEn: string;
    natalHouse: number | null;
  };
  /** Inner planets — this week's themes. */
  innerPlanets: Array<{
    key: "mercury" | "venus" | "mars";
    signEn: string;
    natalHouse: number | null;
    retrograde?: boolean;
  }>;
  /** Inner-planet ↔ natal aspects (week-scale). */
  innerAspects: CrossAspect[];
  /** Outer planet ↔ natal aspects (season/year-scale backdrop). */
  outerAspects: CrossAspect[];
};

export async function generateDailyReading(input: {
  firstName: string | null;
  chart: NatalChartJson;
  context: DailyDayContext;
}): Promise<DailyReadingResult | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;

  const { context: ctx } = input;

  const sections: string[] = [];
  if (input.firstName) sections.push(`მომხმარებლის სახელი: ${input.firstName}`);
  sections.push(`დღევანდელი თარიღი: ${ctx.localizedDate}`);

  sections.push("\n--- ნატალური რუკა (კონტექსტი) ---");
  sections.push(summarizeNatalCompact(input.chart));

  sections.push("\n--- დღევანდელი დღის ლიდერი: მთვარე ---");
  sections.push(
    `Today's Moon is in ${ctx.moon.signEn}${
      ctx.moon.natalHouse
        ? `, transiting natal house ${ctx.moon.natalHouse}`
        : ""
    }.`
  );
  if (ctx.moon.aspectsToNatal.length) {
    sections.push("Moon aspects to natal (today only):");
    for (const a of ctx.moon.aspectsToNatal) sections.push(`  ${aspectLine(a)}`);
  } else {
    sections.push("(No tight Moon-natal aspects today.)");
  }

  sections.push("\n--- ამ კვირის ფონი (Sun + inner planets) ---");
  sections.push(
    `Today's Sun is in ${ctx.sun.signEn}${
      ctx.sun.natalHouse
        ? `, transiting natal house ${ctx.sun.natalHouse}`
        : ""
    }.`
  );
  for (const p of ctx.innerPlanets) {
    const planet = PLANET_LABELS_EN[p.key];
    sections.push(
      `${planet} in ${p.signEn}${p.natalHouse ? `, natal house ${p.natalHouse}` : ""}${p.retrograde ? " (Retrograde)" : ""}.`
    );
  }
  if (ctx.innerAspects.length) {
    sections.push("Inner-planet aspects to natal (this week):");
    for (const a of ctx.innerAspects.slice(0, 4))
      sections.push(`  ${aspectLine(a)}`);
  }

  sections.push("\n--- გრძელვადიანი ფონი (outer planet aspects) ---");
  if (ctx.outerAspects.length) {
    sections.push(
      "(These are background only — true for weeks/months. Do NOT headline them.)"
    );
    for (const a of ctx.outerAspects.slice(0, 3))
      sections.push(`  ${aspectLine(a)}`);
  } else {
    sections.push("(No notable outer-planet aspects.)");
  }

  sections.push(
    "\nდააწერე დღევანდელი ჰოროსკოპი, მთვარით ლიდერობით. JSON-ად დააბრუნე."
  );

  const userMessage = sections.join("\n");

  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": "https://vivida.ge",
      "X-Title": "Vivida daily horoscope",
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: DAILY_SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
      max_tokens: 6000,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`OpenRouter ${res.status}: ${text.slice(0, 300)}`);
  }

  const json = (await res.json()) as OpenRouterResponse;
  if (json.error) throw new Error(`OpenRouter: ${json.error.message}`);

  const raw = json.choices?.[0]?.message?.content;
  if (!raw) throw new Error("OpenRouter returned no content");

  const stripped = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  try {
    const parsed = JSON.parse(stripped) as DailyReadingResult;
    if (!parsed.headline || !parsed.body) {
      throw new Error("missing required fields in daily reading");
    }
    return {
      ...parsed,
      themes: Array.isArray(parsed.themes) ? parsed.themes.slice(0, 3) : [],
    };
  } catch (err) {
    throw new Error(
      `Daily reading invalid JSON: ${(err as Error).message}\n--- raw ---\n${raw.slice(0, 500)}`
    );
  }
}

// ────────────────────────────────────────────────────────────────────────
//  Sign-level horoscope (SEO landing pages) — public, anonymous,
//  cached per (sign, period, periodKey). No natal chart involved.
// ────────────────────────────────────────────────────────────────────────

export type SignHoroscopeResult = {
  headline: string;
  summary: string;
  body: string;
  themes: string[];
};

export const SIGN_HOROSCOPE_PROMPT_VERSION = 1;

export type SignHoroscopePeriodLabel = "day" | "week" | "month";

const PERIOD_KA: Record<SignHoroscopePeriodLabel, {
  label: string;
  bodyShape: string;
  headlineHint: string;
}> = {
  day: {
    label: "დღევანდელი",
    bodyShape:
      "120-160 სიტყვა, 2-3 აბზაცი (\\n\\n): დღის ლიდერი (მთვარე ან კონკრეტული ტრანზიტი), რა გრძნობას ბადებს ეს ნიშნისთვის, კონკრეტული რჩევა/მოქმედება დღევანდელისთვის.",
    headlineHint:
      "40-60 სიმბოლო, კონკრეტული დღევანდელი ენერგია (არა ზოგადი 'კარგი დღე')",
  },
  week: {
    label: "ამ კვირის",
    bodyShape:
      "150-200 სიტყვა, 3 აბზაცი (\\n\\n): კვირის მთავარი თემა (შიდა პლანეტების კონფიგურაცია), რა შესაძლებლობებს ხსნის ნიშნისთვის, რა გამოწვევები მოდის და როგორ ვუპასუხო. ხაზგასმა კონკრეტულ დღეებზე როცა შესაძლებელია (მაგ. 'შუა კვირაში').",
    headlineHint:
      "40-60 სიმბოლო, ამ კვირის გასაღები მოვლენა ან ენერგია",
  },
  month: {
    label: "ამ თვის",
    bodyShape:
      "180-230 სიტყვა, 3-4 აბზაცი (\\n\\n): თვის ფონი (მზე + გარე პლანეტები), რა ციკლი იხსნება ან იხურება ნიშნისთვის, რომელ სფეროზე ფოკუსირება ღირს (კარიერა/ურთიერთობები/ფული/ჯანმრთელობა), თვის რჩევა.",
    headlineHint:
      "40-60 სიმბოლო, თვის გასაღები ცვლილება ან თემა",
  },
};

const SIGN_HOROSCOPE_SYSTEM_PROMPT = `შენ ხარ თბილი, თანამედროვე ქართველი ასტროლოგი/რედაქტორი. წერ კონკრეტული ნიშნისთვის (sun sign) — არა პერსონალური რუკით, არამედ კოლექტიური ენერგიით, რომელიც ეხება ყველას ამ ნიშნით დაბადებულს.

ცოცხალი, კონკრეტული, ხელშესახები ენა. არა ბუნდოვანი მისტიკა, არა კლიშეები ("ვარსკვლავები გელიან", "მოამზადე გული"). მიეცი მკითხველს ერთი კონკრეტული რამ, რაც დღეს/კვირას/თვეს გააკეთოს ან რომელ ემოციას მიაქციოს ყურადღება.

დააბრუნე მხოლოდ ვალიდური JSON ამ სქემით:
{
  "headline": string,           // PERIOD_HEADLINE_HINT
  "summary": string,            // 1-2 წინადადება, რა ხდება ცაში და როგორ ეხება ნიშანს
  "body": string,               // PERIOD_BODY_SHAPE
  "themes": [string, string, string]  // 3 ერთსიტყვიანი ან ორსიტყვიანი თემა
}

წესები:
- "შენ"-ის ფორმა, თბილი/თანაბარი ტონი
- კონკრეტული ტრანზიტი ან კონფიგურაცია უნდა იყოს ხილული (მაგ. "მთვარე მორიელში", "მერკური უკან ხდება")
- ნიშნის ხასიათის ხაზგასმა (ცეცხლი vs. წყალი, ფიქსირებული vs. კარდინალური) — როცა აქტუალურია
- აცილე ცარიელი ფრაზები ("იყავი ღია", "მიენდე ინტუიციას")
- მხოლოდ JSON, code fence-ის გარეშე`;

export type SignHoroscopeTransitFact = {
  /** Georgian planet label, e.g. "მთვარე", "ვენერა". */
  planet: string;
  /** English planet key for the model to reason about. */
  planetEn: string;
  /** Sign the body is currently in (Georgian + English for clarity). */
  signKa: string;
  signEn: string;
  /** True if the body is retrograde — only used for inner+outer planets. */
  retrograde?: boolean;
  /**
   * Optional human-readable aspect to the reader's sun sign center.
   * e.g., "ოპოზიცია" or "ტრინი (ჰარმონიული)". Pass undefined to skip.
   */
  aspectToReaderSign?: string;
};

export type SignHoroscopeInput = {
  /** Georgian sign label, e.g. "ვერძი". */
  signKa: string;
  /** English sign key, e.g. "aries". */
  signEn: string;
  /** Element + modality help the model anchor tone. */
  element: string;
  modality: string;
  ruler: string;
  /** "day" | "week" | "month". */
  period: SignHoroscopePeriodLabel;
  /**
   * Localized period anchor: "ხუთშაბათი, 4 მაისი 2026" / "4-10 მაისი 2026"
   * / "მაისი 2026". Quoted directly in the prompt context.
   */
  periodLabel: string;
  /**
   * Transit facts that should drive the narrative. Caller computes these
   * once per period and passes them to the model — the model doesn't
   * recompute astrology, it just narrates.
   */
  transits: SignHoroscopeTransitFact[];
};

/**
 * Generate a sign-level horoscope. Used by the SEO landing pages at
 * /zodiac/[sign]/dghes etc. Returns null when OpenRouter isn't configured
 * so callers can fall back gracefully (e.g., emit evergreen placeholder).
 */
export async function generateSignHoroscope(
  input: SignHoroscopeInput
): Promise<SignHoroscopeResult | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;

  const periodCfg = PERIOD_KA[input.period];

  const systemPrompt = SIGN_HOROSCOPE_SYSTEM_PROMPT
    .replace("PERIOD_HEADLINE_HINT", periodCfg.headlineHint)
    .replace("PERIOD_BODY_SHAPE", periodCfg.bodyShape);

  const transitLines = input.transits.map((t) => {
    const retro = t.retrograde ? " (რეტროგრადი)" : "";
    const aspect = t.aspectToReaderSign
      ? ` — ${t.aspectToReaderSign} მკითხველის ნიშანზე`
      : "";
    return `- ${t.planet} (${t.planetEn}) ${t.signKa} ნიშანში${retro}${aspect}`;
  });

  const userMessage = [
    `ნიშანი: ${input.signKa} (${input.signEn})`,
    `ელემენტი: ${input.element} · მოდალურობა: ${input.modality} · მმართველი: ${input.ruler}`,
    `პერიოდი: ${periodCfg.label} (${input.periodLabel})`,
    "",
    "ცის ფონი ამ პერიოდისთვის:",
    ...transitLines,
    "",
    `დააწერე ${periodCfg.label} ჰოროსკოპი ${input.signKa}-ისთვის. JSON-ად დააბრუნე.`,
  ].join("\n");

  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": "https://vivida.ge",
      "X-Title": `Vivida sign horoscope (${input.period})`,
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      response_format: { type: "json_object" },
      temperature: 0.85,
      max_tokens: 3500,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`OpenRouter ${res.status}: ${text.slice(0, 300)}`);
  }

  const json = (await res.json()) as OpenRouterResponse;
  if (json.error) throw new Error(`OpenRouter: ${json.error.message}`);

  const raw = json.choices?.[0]?.message?.content;
  if (!raw) throw new Error("OpenRouter returned no content");

  const stripped = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  try {
    const parsed = JSON.parse(stripped) as SignHoroscopeResult;
    if (!parsed.headline || !parsed.body) {
      throw new Error("missing required fields in sign horoscope");
    }
    return {
      ...parsed,
      themes: Array.isArray(parsed.themes) ? parsed.themes.slice(0, 3) : [],
    };
  } catch (err) {
    throw new Error(
      `Sign horoscope invalid JSON: ${(err as Error).message}\n--- raw ---\n${raw.slice(0, 500)}`
    );
  }
}

// ── Sign rankings (SEO listicles) ──────────────────────────────────────────
// "ყველაზე ჭკვიანი / ეჭვიანი / რომანტიული … ზოდიაქოს ნიშნები" — rank all 12
// signs by a trait. Evergreen, generated once per topic and cached in DB.
export const RANKING_PROMPT_VERSION = 1;

export type SignRankingGenItem = {
  /** zodiac slug from the provided list */
  slug: string;
  /** 1 = most, 12 = least */
  rank: number;
  /** 1-2 sentence Georgian explanation */
  blurb: string;
};

export type SignRankingResult = {
  headline: string;
  intro: string;
  items: SignRankingGenItem[];
  faq: { q: string; a: string }[];
};

const SIGN_RANKING_SYSTEM_PROMPT = `შენ ხარ თბილი, თანამედროვე ქართველი ასტროლოგი-რედაქტორი. წერ გასართობ, მაგრამ შინაარსიან "რეიტინგ" სტატიას, რომელიც ალაგებს 12-ვე ზოდიაქოს ნიშანს მოცემული თვისების მიხედვით — ყველაზე მეტიდან ყველაზე ნაკლებისკენ.

ცოცხალი, კონკრეტული, ხელშესახები ენა. არა ბუნდოვანი მისტიკა, არა კლიშეები. თითო ნიშანზე მიეცი მკითხველს კონკრეტული მიზეზი, რატომ დგას სწორედ ამ ადგილზე — ნიშნის ხასიათიდან გამომდინარე (ელემენტი, მმართველი პლანეტა, ტიპური ქცევა). ტონი მსუბუქი, ოდნავ იუმორით, მაგრამ არა შეურაცხმყოფელი.

დააბრუნე მხოლოდ ვალიდური JSON ამ სქემით:
{
  "headline": string,                       // 40-70 სიმბოლო, მიმზიდველი სათაური
  "intro": string,                          // 2-3 წინადადება — შესავალი, რას ნიშნავს ეს თვისება და როგორ ვაჯგუფებთ
  "items": [                                // ზუსტად 12 ჩანაწერი, თითო ნიშანზე
    { "slug": string, "rank": number, "blurb": string }   // slug მოცემული სიიდან; rank 1..12 უნიკალური; blurb 1-2 წინადადება
  ],
  "faq": [ { "q": string, "a": string } ]   // 3 ხშირი კითხვა-პასუხი ამ თემაზე
}

წესები:
- გამოიყენე ზუსტად ის slug-ები, რომლებსაც მოგცემ — არცერთი არ გამოტოვო, არცერთი არ დაამატო
- rank 1 = ყველაზე მეტად, 12 = ყველაზე ნაკლებად; ყველა რიცხვი უნიკალური
- ქართულად, "შენ"-ის გარეშე ნეიტრალური ტონით (ეს ნიშანზეა, არა მკითხველზე)
- აცილე ცარიელი ფრაზები; თითო blurb კონკრეტული და განსხვავებული
- მხოლოდ JSON, code fence-ის გარეშე`;

/**
 * Generate a 12-sign ranking listicle for a trait. Returns null when
 * OpenRouter isn't configured so callers can fall back gracefully.
 */
export async function generateSignRanking(input: {
  /** Topic title, e.g. "ყველაზე ჭკვიანი ზოდიაქოს ნიშნები". */
  titleKa: string;
  /** What trait to rank by, described for the model. */
  traitKa: string;
  /** The 12 signs (slug + Georgian label) the model must rank. */
  signs: { slug: string; labelKa: string }[];
}): Promise<SignRankingResult | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;

  const signLines = input.signs
    .map((s) => `- ${s.slug} = ${s.labelKa}`)
    .join("\n");

  const userMessage = [
    `თემა: ${input.titleKa}`,
    `თვისება, რომლითაც ვალაგებთ: ${input.traitKa}`,
    "",
    "ნიშნები (გამოიყენე ეს slug-ები ზუსტად):",
    signLines,
    "",
    `დაალაგე 12-ვე ნიშანი ამ თვისების მიხედვით და დააბრუნე JSON.`,
  ].join("\n");

  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": "https://vivida.ge",
      "X-Title": "Vivida sign ranking",
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: SIGN_RANKING_SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      response_format: { type: "json_object" },
      temperature: 0.85,
      max_tokens: 4500,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`OpenRouter ${res.status}: ${text.slice(0, 300)}`);
  }

  const json = (await res.json()) as OpenRouterResponse;
  if (json.error) throw new Error(`OpenRouter: ${json.error.message}`);

  const raw = json.choices?.[0]?.message?.content;
  if (!raw) throw new Error("OpenRouter returned no content");

  const stripped = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  const parsed = JSON.parse(stripped) as SignRankingResult;
  const valid = new Set(input.signs.map((s) => s.slug));
  const items = (Array.isArray(parsed.items) ? parsed.items : [])
    .filter((it) => it && valid.has(it.slug) && typeof it.blurb === "string")
    .map((it) => ({ slug: it.slug, rank: Number(it.rank) || 0, blurb: it.blurb }));

  // Dedupe by slug (keep first), then ensure all 12 present and re-rank 1..n
  // by the model's order so the page never shows gaps or duplicates.
  const seen = new Set<string>();
  const deduped = items.filter((it) =>
    seen.has(it.slug) ? false : (seen.add(it.slug), true)
  );
  deduped.sort((a, b) => a.rank - b.rank);
  const ranked = deduped.map((it, i) => ({ ...it, rank: i + 1 }));

  if (ranked.length < input.signs.length || !parsed.headline || !parsed.intro) {
    throw new Error(
      `Sign ranking incomplete (${ranked.length}/${input.signs.length})\n--- raw ---\n${raw.slice(0, 500)}`
    );
  }

  return {
    headline: parsed.headline,
    intro: parsed.intro,
    items: ranked,
    faq: Array.isArray(parsed.faq) ? parsed.faq.slice(0, 4) : [],
  };
}

// ── Chinese zodiac (ჩინური ჰოროსკოპი) ──────────────────────────────────────
export const CHINESE_ZODIAC_PROMPT_VERSION = 1;

export type ChineseZodiacResult = {
  pageTitle: string;
  metaDescription: string;
  headline: string;
  intro: string;
  personality: string;
  strengths: string[];
  weaknesses: string[];
  love: string;
  career: string;
  compatibility: { slug: string; level: string; note: string }[];
  faq: { q: string; a: string }[];
};

export type ChineseZodiacHubResult = {
  title: string;
  metaDescription: string;
  intro: string;
  faq: { q: string; a: string }[];
};

async function openrouterJson<T>(
  system: string,
  user: string,
  title: string,
  maxTokens = 4500
): Promise<T | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;

  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": "https://vivida.ge",
      "X-Title": title,
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
      temperature: 0.85,
      max_tokens: maxTokens,
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`OpenRouter ${res.status}: ${text.slice(0, 300)}`);
  }
  const json = (await res.json()) as OpenRouterResponse;
  if (json.error) throw new Error(`OpenRouter: ${json.error.message}`);
  const raw = json.choices?.[0]?.message?.content;
  if (!raw) throw new Error("OpenRouter returned no content");
  const stripped = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
  return JSON.parse(stripped) as T;
}

const CHINESE_SYSTEM = `შენ ხარ თბილი, თანამედროვე ქართველი ასტროლოგი-რედაქტორი, ჩინური ასტროლოგიის (ჩინური ჰოროსკოპის, ე.წ. "ზოდიაქოს წლების მიხედვით") მცოდნე. წერ ერთი ჩინური ნიშნისთვის (ცხოველი) — კოლექტიური ხასიათით, რომელიც ეხება ამ ცხოველის წელს დაბადებულებს.

ცოცხალი, კონკრეტული, ხელშესახები ქართული. არა ბუნდოვანი მისტიკა, არა კლიშეები. ხასიათი დააფუძნე ჩინური ასტროლოგიის რეალურ ცოდნაზე (ცხოველის ბუნება, ფიქსირებული ელემენტი, იან/ინ პოლარობა).

დააბრუნე მხოლოდ ვალიდური JSON ამ სქემით:
{
  "pageTitle": string,          // SEO სათაური, ~50-65 სიმბოლო, შეიცავდეს ცხოველის სახელს და "ჩინური ჰოროსკოპი"
  "metaDescription": string,    // ~140-160 სიმბოლო
  "headline": string,           // მოკლე, მიმზიდველი ფრაზა ცხოველის შესახებ
  "intro": string,              // 2-3 აბზაცი (\\n\\n) — შესავალი ცხოველის ბუნებაზე
  "personality": string,        // 2-3 აბზაცი — დეტალური ხასიათი
  "strengths": [string, ...],   // 5-6 ძლიერი მხარე (მოკლე)
  "weaknesses": [string, ...],  // 4-5 სუსტი მხარე (მოკლე)
  "love": string,               // აბზაცი სიყვარულსა და ურთიერთობებზე
  "career": string,             // აბზაცი კარიერასა და ფულზე
  "compatibility": [            // 4-6 სხვა ცხოველთან თავსებადობა
    { "slug": string, "level": string, "note": string }   // slug მოცემული სიიდან; level "ძლიერი"|"ჰარმონიული"|"გამომწვევი"; note 1 წინადადება
  ],
  "faq": [ { "q": string, "a": string } ]   // 4 ხშირი კითხვა
}

წესები:
- compatibility-ის slug-ები მხოლოდ მოცემული სიიდან
- ქართულად, ნეიტრალური ტონით (ნიშანზეა, არა მკითხველზე)
- კონკრეტული, განსხვავებული ფრაზები; აცილე ცარიელ ფრაზებს
- მხოლოდ JSON, code fence-ის გარეშე`;

export async function generateChineseZodiac(input: {
  nameKa: string;
  slug: string;
  element: string;
  polarity: string;
  yearsText: string;
  animals: { slug: string; nameKa: string }[];
}): Promise<ChineseZodiacResult | null> {
  const user = [
    `ცხოველი: ${input.nameKa} (${input.slug})`,
    `ფიქსირებული ელემენტი: ${input.element} · პოლარობა: ${input.polarity}`,
    `დაბადების წლები: ${input.yearsText}`,
    "",
    "ცხოველების სია (გამოიყენე ეს slug-ები compatibility-ში):",
    ...input.animals.map((a) => `- ${a.slug} = ${a.nameKa}`),
    "",
    `დაწერე ${input.nameKa}-ის ჩინური ჰოროსკოპის გვერდი. JSON-ად დააბრუნე.`,
  ].join("\n");

  const parsed = await openrouterJson<ChineseZodiacResult>(
    CHINESE_SYSTEM,
    user,
    "Vivida chinese zodiac",
    5000
  );
  if (!parsed) return null;
  if (!parsed.pageTitle || !parsed.metaDescription || !parsed.intro) {
    throw new Error("Chinese zodiac missing required fields");
  }
  const valid = new Set(input.animals.map((a) => a.slug));
  return {
    pageTitle: parsed.pageTitle,
    metaDescription: parsed.metaDescription,
    headline: parsed.headline ?? "",
    intro: parsed.intro,
    personality: parsed.personality ?? "",
    strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 6) : [],
    weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses.slice(0, 5) : [],
    love: parsed.love ?? "",
    career: parsed.career ?? "",
    compatibility: (Array.isArray(parsed.compatibility) ? parsed.compatibility : [])
      .filter((c) => c && valid.has(c.slug))
      .slice(0, 6),
    faq: Array.isArray(parsed.faq) ? parsed.faq.slice(0, 5) : [],
  };
}

export async function generateChineseZodiacHub(input: {
  animals: { slug: string; nameKa: string }[];
}): Promise<ChineseZodiacHubResult | null> {
  const system = `შენ ხარ თბილი, თანამედროვე ქართველი ასტროლოგი-რედაქტორი. წერ ჩინური ჰოროსკოპის (ზოდიაქოს ნიშნები წლების მიხედვით) მთავარი გვერდის ტექსტს. ცოცხალი, კონკრეტული ქართული, კლიშეების გარეშე.

დააბრუნე მხოლოდ ვალიდური JSON:
{
  "title": string,              // SEO სათაური, შეიცავდეს "ჩინური ჰოროსკოპი"
  "metaDescription": string,    // ~140-160 სიმბოლო
  "intro": string,              // 2-3 აბზაცი (\\n\\n) — რა არის ჩინური ჰოროსკოპი, 12-წლიანი ციკლი, როგორ მუშაობს
  "faq": [ { "q": string, "a": string } ]   // 4 ხშირი კითხვა
}
მხოლოდ JSON, code fence-ის გარეშე.`;
  const user = `ცხოველები: ${input.animals.map((a) => a.nameKa).join(", ")}. დაწერე ჩინური ჰოროსკოპის მთავარი გვერდის ტექსტი JSON-ად.`;

  const parsed = await openrouterJson<ChineseZodiacHubResult>(
    system,
    user,
    "Vivida chinese zodiac hub",
    3000
  );
  if (!parsed) return null;
  if (!parsed.title || !parsed.metaDescription || !parsed.intro) {
    throw new Error("Chinese zodiac hub missing required fields");
  }
  return {
    title: parsed.title,
    metaDescription: parsed.metaDescription,
    intro: parsed.intro,
    faq: Array.isArray(parsed.faq) ? parsed.faq.slice(0, 5) : [],
  };
}

// ── Streaming chat (chart chat / "ჰკითხე ვარსკვლავებს") ─────────────────────
export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

/**
 * Stream a chat completion token-by-token. Yields text deltas as they arrive
 * (parses OpenRouter's SSE). Throws if the key is missing or the upstream errors.
 */
export async function* streamChatCompletion(
  messages: ChatMessage[],
  opts: { maxTokens?: number; temperature?: number } = {}
): AsyncGenerator<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is not configured");

  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": "https://vivida.ge",
      "X-Title": "Vivida chart chat",
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages,
      stream: true,
      temperature: opts.temperature ?? 0.85,
      max_tokens: opts.maxTokens ?? 1000,
    }),
  });
  if (!res.ok || !res.body) {
    const t = await res.text().catch(() => "");
    throw new Error(`OpenRouter ${res.status}: ${t.slice(0, 200)}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    // keep the last (possibly partial) line in the buffer
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const data = trimmed.slice(5).trim();
      if (data === "[DONE]") return;
      try {
        const json = JSON.parse(data) as {
          choices?: Array<{ delta?: { content?: string } }>;
        };
        const delta = json.choices?.[0]?.delta?.content;
        if (delta) yield delta;
      } catch {
        /* keep-alive / partial line — skip */
      }
    }
  }
}
