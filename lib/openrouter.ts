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
export const DAILY_PROMPT_VERSION = 2;

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
  "summary": string,    // 1-2 წინადადება, დღის ემოციური სურათი
  "body": string,       // 3 აბზაცი (~150-200 სიტყვა), იხილე ქვემოთ
  "themes": string[]    // 1-3 მოკლე თემა — "ოჯახი", "კარიერა", "კრეატივი"
}

body-ს სტრუქტურა (3 აბზაცი, ცარიელი ხაზით გაყოფილი):
1. დღევანდელი მთვარე — ნიშანი + სახლი + რას ნათებს.
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

export const WEEKLY_PROMPT_VERSION = 1;

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
