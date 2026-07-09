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
import { BODIES, signByIndex } from "@/lib/zodiac";
import type { MbtiScores } from "@/lib/mbti-questions";
import { AXIS_LABEL_KA, mbtiArchetypeKa } from "@/lib/mbti-questions";
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
};

const SYSTEM_PROMPT =
  "შენ ხარ პროფესიონალი ფსიქოანალიტიკოსი და ასტროლოგი, რომელიც წერ ბუნებრივ, " +
  "მდიდარ, ლიტერატურულ ქართულად — გრამატიკულად უნაკლო, ცოცხალი, კონკრეტული. " +
  "მოგეცემა წინასწარ დაწერილი მასალა (ტიპის პორტრეტი და მზის ნიშანთან შერწყმა) — " +
  "გამოიყენე როგორც საფუძველი, მაგრამ არ გაიმეორო სიტყვასიტყვით: შექმენი ერთიანი, " +
  "პერსონალიზებული სინთეზი. დააბრუნე მხოლოდ ვალიდური JSON: " +
  '{"archetypeNameGe": string, "analysisText": string}. archetypeNameGe — ' +
  "ამ ადამიანის მოკლე, ცოცხალი ქართული არქეტიპი. analysisText — ტექსტი აბზაცებით (\\n\\n).";

function astroDetailKa(chart: NatalChartJson | null): string {
  if (!chart) return "ასტროლოგიური მონაცემები ჯერ არ არის შევსებული.";
  const parts: string[] = [];
  parts.push(`ასცენდენტი — ${signByIndex(chart.ascendant.signIndex).labelKa}`);
  for (const key of ["sun", "moon", "mercury", "venus", "mars"]) {
    const b = chart.bodies[key];
    if (!b) continue;
    const label = BODIES[key]?.labelKa ?? key;
    parts.push(`${label} — ${signByIndex(b.signIndex).labelKa}${b.house ? ` (${b.house}-ე სახლი)` : ""}`);
  }
  return parts.join(", ");
}

function scoresSummaryKa(scores: MbtiScores): string {
  return (["EI", "SN", "TF", "JP"] as const)
    .map((axis) => {
      const s = scores[axis];
      const [first, second] = AXIS_LABEL_KA[axis];
      const name = s.letter === axis[0] ? first : second;
      return `${s.letter} (${name}) — ${s.pct}%`;
    })
    .join(", ");
}

async function buildUserPrompt(input: MbtiSynthesisInput): Promise<string> {
  const sunSign =
    input.chart != null
      ? signByIndex(input.chart.bodies.sun?.signIndex ?? 0).key
      : null;
  const { typeEntry, sunEntry } = await getTypeAndSun(input.type, sunSign);

  const lines: string[] = [];
  if (input.firstName) lines.push(`მომხმარებლის სახელი: ${input.firstName}`);
  lines.push(`MBTI ტიპი: ${input.type} (${mbtiArchetypeKa(input.type)})`);
  lines.push(`ღერძების ბალანსი: ${scoresSummaryKa(input.scores)}`);
  lines.push(`სრული ასტროლოგიური მონაცემები: ${astroDetailKa(input.chart)}`);

  if (typeEntry?.body) {
    lines.push("\n--- ტიპის ფსიქოლოგიური პორტრეტი (საფუძველი) ---");
    lines.push(typeEntry.body);
  }
  if (sunEntry?.body) {
    lines.push("\n--- ტიპის შერწყმა მზის ნიშანთან (საფუძველი) ---");
    lines.push(sunEntry.body);
  }

  lines.push(
    input.chart
      ? "\nზემოთ მოცემულ საფუძველზე დააშენე ერთიანი, პერსონალიზებული ფსიქოლოგიურ-ასტროლოგიური " +
          "სინთეზი. დაიწყე ცოცხალი შესავლით, შემდეგ ჩააქსოვე ამ ადამიანის მთვარე, მერკური და " +
          "ასცენდენტი — ის ინდივიდუალური ნიუანსი, რაც საფუძველში არ არის. 5-7 აბზაცი."
      : "\nდაწერე ერთიანი პერსონალიზებული ფსიქოლოგიური სინთეზი ტიპის პორტრეტის საფუძველზე. " +
          "ბოლო აბზაცში ურჩიე, შეავსოს დაბადების მონაცემები Vivida-ზე, რომ ასტროლოგიური ფენა გაიხსნას. 5-6 აბზაცი."
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

async function viaOpenRouter(prompt: string): Promise<MbtiSynthesis> {
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
        { role: "system", content: SYSTEM_PROMPT },
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

async function viaGoogle(prompt: string): Promise<MbtiSynthesis> {
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
      systemInstruction: SYSTEM_PROMPT,
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
  const prompt = await buildUserPrompt(input);

  if (preferGoogle()) {
    try {
      const r = await viaGoogle(prompt);
      return { ...r, model: `google:${GOOGLE_MODEL}` };
    } catch (err) {
      console.warn(
        "[mbti-synthesis] Google path failed, falling back to OpenRouter:",
        (err as Error).message
      );
    }
  }
  try {
    const r = await viaOpenRouter(prompt);
    return { ...r, model: OPENROUTER_MODEL };
  } catch (err) {
    console.error("[mbti-synthesis] all providers failed:", (err as Error).message);
    return null;
  }
}
