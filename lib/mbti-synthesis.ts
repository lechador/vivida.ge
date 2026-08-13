/**
 * Astro-MBTI synthesis — the small, fast, live personalization pass.
 *
 * The heavy lifting is pre-written by gemini-2.5-pro into the MBTI library
 * (lib/mbti-library.ts): the type's psychological portrait + how it expresses
 * through the user's Sun sign. This live call just STITCHES those together and
 * adds the irreducible individual color — the user's name, exact axis %s, and
 * the rest of their chart (Moon, Mercury, Ascendant). That's a light job, so
 * a fast model handles it well.
 *
 * Provider split: production (live website) → OpenRouter flash; local build →
 * Google flash (Gemini API key or Vertex ADC), spending Google credits. Any
 * provider error falls through to OpenRouter. Output: strict JSON.
 */

import type { NatalChartJson } from "@/db/schema";
import { signByIndex } from "@/lib/zodiac";
import type { MbtiScores } from "@/lib/mbti-questions";
import { AXIS_LABEL_EN, AXIS_LABEL_KA, mbtiArchetypeEn, mbtiArchetypeKa, mbtiBaseType } from "@/lib/mbti-questions";
import { getTypeAndSun } from "@/lib/mbti-library";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_MODEL = "google/gemini-2.5-flash";
const GOOGLE_MODEL = "gemini-2.5-flash";

export type MbtiSynthesis = {
  archetypeNameGe: string;
  analysisText: string;
};

export type MbtiSynthesisInput = {
  firstName: string | null;
  type: string;
  scores: MbtiScores;
  /** Null when the user hasn't entered birth data yet. */
  chart: NatalChartJson | null;
  locale?: "ka" | "en";
};

const SYSTEM_PROMPT =
  "შენ ხარ გამოცდილი ქართველი ფსიქოლოგი, რომელიც ხსნის პიროვნების ტესტის (MBTI/" +
  "16Personalities-ის ტიპის) შედეგს. წერ ბუნებრივ, მდიდარ, ლიტერატურულ ქართულად — " +
  "გრამატიკულად და ორთოგრაფიულად უნაკლო, ცოცხალი და კონკრეტული. აქცენტი — სუფთა " +
  "ფსიქოლოგიაზე: პიროვნების ტიპი, აზროვნების, გრძნობისა და გადაწყვეტილების წესი, " +
  "ძლიერი მხარეები და ზრდის წერტილები. ეს ასტროლოგიური რუკის ანალიზი არ არის — " +
  "ზოდიაქოს ნიშანი მხოლოდ არქეტიპის სახელისა და ერთი მსუბუქი შტრიხისთვის ახსენე, " +
  "პლანეტების, სახლების ან ასპექტების ჩამოთვლის გარეშე. " +
  "მოგეცემა წინასწარ დაწერილი ტიპის პორტრეტი — დაეყრდენი, მაგრამ არ გაიმეორო " +
  "სიტყვასიტყვით. დააბრუნე მხოლოდ ვალიდური JSON: " +
  '{"archetypeNameGe": string, "analysisText": string}. archetypeNameGe — ' +
  "ამ ადამიანის მოკლე, ცოცხალი ქართული არქეტიპი. analysisText — ტექსტი აბზაცებით (\\n\\n).";

const SYSTEM_PROMPT_EN =
  "You are an experienced personality-profile writer. Explain an MBTI-style result in natural, precise and warm English. " +
  "Focus on preferences, thinking, decision-making, strengths and growth opportunities. Do not present the framework as a diagnosis or fixed identity. " +
  "Astrology may appear only as one light metaphor when a Sun sign is provided; do not list planets, houses or aspects. " +
  'Return valid JSON only: {"archetypeNameGe": string, "analysisText": string}. archetypeNameGe is a short English archetype label; analysisText uses paragraphs separated by \\n\\n.';

function scoresSummaryKa(scores: MbtiScores): string {
  return (["EI", "SN", "TF", "JP", "AT"] as const)
    .map((axis) => {
      const s = scores[axis];
      const [first, second] = AXIS_LABEL_KA[axis];
      const name = s.letter === axis[0] ? first : second;
      return `${s.letter} (${name}) — ${s.pct}%`;
    })
    .join(", ");
}

function scoresSummaryEn(scores: MbtiScores): string {
  return (["EI", "SN", "TF", "JP", "AT"] as const)
    .map((axis) => {
      const score = scores[axis];
      const [first, second] = AXIS_LABEL_EN[axis];
      const name = score.letter === axis[0] ? first : second;
      return `${score.letter} (${name}) — ${score.pct}%`;
    })
    .join(", ");
}

async function buildUserPrompt(input: MbtiSynthesisInput): Promise<string> {
  if (input.locale === "en") {
    const sunSign = input.chart != null
      ? signByIndex(input.chart.bodies.sun?.signIndex ?? 0).labelEn
      : null;
    const lines: string[] = [];
    if (input.firstName) lines.push(`First name: ${input.firstName}`);
    lines.push(`Type: ${input.type} (${mbtiArchetypeEn(input.type)})`);
    lines.push(`Dimension strengths: ${scoresSummaryEn(input.scores)}`);
    if (sunSign) lines.push(`Sun sign: ${sunSign}. Use this only as one subtle metaphor, not as evidence or a second assessment.`);
    lines.push(
      "Write a cohesive, individualized portrait in 5–6 short paragraphs. Explain how this pattern may appear in thought, emotion, relationships, work and stress; include concrete strengths and balanced growth suggestions. " +
      "Use careful language such as ‘tends to’ and ‘may’, avoid stereotypes, and mention that close-to-midpoint scores can indicate flexibility."
    );
    return lines.join("\n");
  }

  const sunSignKa =
    input.chart != null
      ? signByIndex(input.chart.bodies.sun?.signIndex ?? 0).labelKa
      : null;
  // Only the type portrait feeds the synthesis now — the astro fusion is
  // deliberately dropped so the result stays focused on psychology.
  const { typeEntry } = await getTypeAndSun(mbtiBaseType(input.type), null);

  const identity = input.scores.AT;
  const [assertiveKa, turbulentKa] = AXIS_LABEL_KA.AT;
  const identityKa = identity
    ? identity.letter === "A"
      ? `${assertiveKa} (A) — ${identity.pct}%`
      : `${turbulentKa} (T) — ${identity.pct}%`
    : null;

  const lines: string[] = [];
  if (input.firstName) lines.push(`მომხმარებლის სახელი: ${input.firstName}`);
  lines.push(`ტიპი: ${input.type} (${mbtiArchetypeKa(input.type)})`);
  lines.push(`ღერძების ბალანსი (პროცენტებით): ${scoresSummaryKa(input.scores)}`);
  if (identityKa) {
    lines.push(
      `იდენტობის ღერძი (თვითრწმენა): ${identityKa} — ` +
        "ჩართე ეს ნიუანსი: როგორ ხვდება სტრესს, თვითკრიტიკას, შედეგზე დამოკიდებულებას."
    );
  }
  if (sunSignKa) {
    lines.push(
      `ზოდიაქოს ნიშანი: ${sunSignKa} (გამოიყენე მხოლოდ არქეტიპის სახელისთვის, ` +
        `მაგ. „${sunSignKa} ${mbtiArchetypeKa(input.type)}“, და ერთი მსუბუქი შტრიხისთვის — მეტი არა).`
    );
  }

  if (typeEntry?.body) {
    lines.push("\n--- ტიპის ფსიქოლოგიური პორტრეტი (საფუძველი) ---");
    lines.push(typeEntry.body);
  }

  lines.push(
    "\nდაწერე ერთიანი, პერსონალიზებული ფსიქოლოგიური სინთეზი ამ ტესტის შედეგზე. " +
      "ფოკუსი — ტიპი და ღერძების პროცენტები: ვინ არის ეს ადამიანი, როგორ აზროვნებს, " +
      "გრძნობს და იღებს გადაწყვეტილებებს, რა არის მისი ძალა და ზრდის წერტილი. " +
      (sunSignKa
        ? `ზოდიაქოს ${sunSignKa} ჩართე მხოლოდ არქეტიპის სახელსა და ერთ მსუბუქ შტრიხში. `
        : "") +
      "პლანეტების, სახლების ან ასპექტების ჩამოთვლა არ არის საჭირო. 5-6 აბზაცი. " +
      "დაწერე უნაკლო, ბუნებრივი ქართულით."
  );
  return lines.join("\n");
}

function parseSynthesis(raw: string): MbtiSynthesis {
  const stripped = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
  const parsed = JSON.parse(stripped) as Partial<MbtiSynthesis>;
  if (!parsed.analysisText) throw new Error("missing analysisText");
  return {
    archetypeNameGe: (parsed.archetypeNameGe ?? "").trim(),
    analysisText: parsed.analysisText.trim(),
  };
}

async function viaOpenRouter(prompt: string, locale: "ka" | "en"): Promise<MbtiSynthesis> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY missing");
  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": "https://vivida.ge",
      "X-Title": "Vivida Astro-MBTI",
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages: [
        { role: "system", content: locale === "en" ? SYSTEM_PROMPT_EN : SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.85,
      max_tokens: 4000,
      // Compose task, not reasoning — keep flash fast in prod too.
      reasoning: { enabled: false },
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`OpenRouter ${res.status}: ${text.slice(0, 300)}`);
  }
  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    error?: { message: string };
  };
  if (json.error) throw new Error(`OpenRouter: ${json.error.message}`);
  const raw = json.choices?.[0]?.message?.content;
  if (!raw) throw new Error("OpenRouter returned no content");
  return parseSynthesis(raw);
}

async function viaGoogle(prompt: string, locale: "ka" | "en"): Promise<MbtiSynthesis> {
  const { GoogleGenAI } = await import("@google/genai");
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = apiKey
    ? new GoogleGenAI({ apiKey })
    : new GoogleGenAI({
        vertexai: true,
        project: process.env.GOOGLE_CLOUD_PROJECT,
        location: process.env.GOOGLE_CLOUD_LOCATION || "us-central1",
      });
  const res = await ai.models.generateContent({
    model: GOOGLE_MODEL,
    contents: prompt,
    config: {
      systemInstruction: locale === "en" ? SYSTEM_PROMPT_EN : SYSTEM_PROMPT,
      temperature: 0.85,
      responseMimeType: "application/json",
      // This is a compose-over-pre-written-material task, not deep reasoning —
      // flash's default "thinking" adds ~30s for no quality gain here.
      thinkingConfig: { thinkingBudget: 0 },
    },
  });
  const raw = res.text?.trim();
  if (!raw) throw new Error("Google returned no content");
  return parseSynthesis(raw);
}

/** Google while building (their credits), OpenRouter live. */
function preferGoogle(): boolean {
  if (process.env.NODE_ENV === "production") return false;
  return !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_CLOUD_PROJECT);
}

/**
 * Generate the synthesis. Returns text + model tag, or null if every path
 * fails (caller then falls back to the static archetype so a result renders).
 */
export async function generateMbtiSynthesis(
  input: MbtiSynthesisInput
): Promise<(MbtiSynthesis & { model: string }) | null> {
  const locale = input.locale ?? "ka";
  const prompt = await buildUserPrompt(input);

  if (preferGoogle()) {
    try {
      const r = await viaGoogle(prompt, locale);
      return { ...r, model: `google:${GOOGLE_MODEL}` };
    } catch (err) {
      console.warn(
        "[mbti-synthesis] Google path failed, falling back to OpenRouter:",
        (err as Error).message
      );
    }
  }
  try {
    const r = await viaOpenRouter(prompt, locale);
    return { ...r, model: OPENROUTER_MODEL };
  } catch (err) {
    console.error("[mbti-synthesis] all providers failed:", (err as Error).message);
    return null;
  }
}
