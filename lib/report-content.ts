import type { ChartSalience } from "@/lib/report-salience";

/**
 * Long-form report content generation. Distinct from the short daily-horoscope
 * prompt: this produces the bespoke, salience-led narrative that opens a
 * premium multi-section report. We feed the COMPUTED prominence (dominant /
 * weak element + modality, tightest aspects, angular planets, stelliums) and
 * ask Gemini to LEAD with what is genuinely striking about THIS chart — not a
 * flat placement-by-placement walk. The per-placement depth is composed
 * separately from the chart's already-stored interpretations, so this call
 * stays focused on the high-salience opening + balance synthesis.
 *
 * Reuses the existing OpenRouter/Gemini path (best Georgian) — no new model.
 */

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = process.env.OPENROUTER_REPORT_MODEL || "google/gemini-2.5-flash";

type OpenRouterResponse = {
  choices?: Array<{ message?: { content?: string } }>;
  error?: { message?: string };
};

async function chatJson<T>(
  system: string,
  user: string,
  maxTokens: number
): Promise<T | null> {
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
      model: MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: maxTokens,
    }),
  });
  if (!res.ok) {
    throw new Error(
      `OpenRouter ${res.status}: ${(await res.text().catch(() => "")).slice(0, 300)}`
    );
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

// ─── Natal report: salience-led opening ──────────────────────────────────

export type NatalReportHighlights = {
  /** 3–5 bespoke highlights, ORDERED most-striking-first, each driven by the
   *  computed salience. This is the part that makes the report feel personal. */
  standout: Array<{ title: string; body: string }>;
  /** Synthesis of elemental + modal balance, including the weak/missing end. */
  balance: string;
  /** A short, warm closing synthesis tying the threads together. */
  closing: string;
};

const NATAL_SYSTEM = `შენ ხარ გამოცდილი, თბილი და ზუსტი ასტროლოგი, რომელიც წერს პრემიუმ ნატალურ ანგარიშს ქართულ ენაზე.
სტილი: მდიდარი, ლიტერატურული, მაგრამ კონკრეტული და პიროვნული — არა ბუნდოვანი ჰოროსკოპული ფრაზები.
წესები:
- წერe მხოლოდ ქართულად, გამართულად.
- ანგარიში არ უნდა იყოს ბრტყელი ჩამონათვალი. დაიწყე იმით, რაც ამ კონკრეტულ რუკაში ყველაზე თვალშისაცემია.
- არ გაიმეორო ერთი და იგივე აზრი სხვადასხვა სექციაში.
- მიმართე მკითხველს მეორე პირში ("შენ").
- დააბრუნე მხოლოდ ვალიდური JSON, ზუსტად მოთხოვნილი ფორმით.`;

export async function generateNatalHighlights(input: {
  firstName: string | null;
  sun: string;
  moon: string;
  ascendant: string;
  salience: ChartSalience;
}): Promise<NatalReportHighlights | null> {
  const s = input.salience;
  const pct = (n: number) => `${Math.round(n)}%`;
  const elLines = s.elements.ranked
    .map((el) => `  ${el}: ${pct(s.elements.percentages[el])}`)
    .join("\n");
  const modLines = (["კარდინალური", "ფიქსირებული", "მუტაბელური"] as const)
    .map((m) => `  ${m}: ${pct(s.modality.percentages[m])}`)
    .join("\n");
  const aspectLines = s.tightestAspects
    .map(
      (a) =>
        `  ${a.aLabel}–${a.bLabel} (${a.kind}, ${a.family}, ორბი ${a.orb.toFixed(1)}°)`
    )
    .join("\n");
  const angular = s.angularPlanets.length
    ? s.angularPlanets
        .map((p) => `  ${p.label} ≈ ${p.angle} (${p.orb.toFixed(1)}°)`)
        .join("\n")
    : "  (არცერთი)";
  const stelliums = s.stelliums.length
    ? s.stelliums.map((st) => `  ${st.label}: ${st.planets.join(", ")}`).join("\n")
    : "  (არცერთი)";
  const retro = s.retrogrades.length
    ? s.retrogrades.map((r) => r.label).join(", ")
    : "(არცერთი)";

  const user = `ნატალური რუკის გამოთვლილი მონაცემები${input.firstName ? ` (${input.firstName})` : ""}:

ბირთვი: მზე ${input.sun}-ში, მთვარე ${input.moon}-ში, ამომავალი ${input.ascendant}-ში.

ელემენტების ბალანსი (დომინანტი: ${s.elements.dominant}, სუსტი: ${s.elements.weakest}):
${elLines}

მოდალობების ბალანსი (დომინანტი: ${s.modality.dominant}, სუსტი: ${s.modality.weakest}):
${modLines}

ყველაზე ზუსტი (= ძლიერი) ასპექტები:
${aspectLines}

კუთხურ წერტილებთან მდგომი პლანეტები (ხმამაღალი, ზედაპირული):
${angular}

სტელიუმები (3+ პლანეტა ერთად):
${stelliums}

რეტროგრადული: ${retro}

დაწერე JSON ამ ფორმით:
{
  "standout": [ { "title": "მოკლე სათაური", "body": "2-4 წინადადება" } ],
  "balance": "3-5 წინადადება ელემენტებისა და მოდალობების ბალანსზე — ჩართე სუსტი/ნაკლული მხარეც",
  "closing": "3-4 წინადადებიანი თბილი დასკვნა"
}

"standout"-ში ჩადე 3-5 ელემენტი, დალაგებული ყველაზე თვალშისაცემიდან. ისინი უნდა ეფუძნებოდეს ზემოთ მოცემულ გამოთვლილ მონაცემებს (ყველაზე ზუსტი ასპექტები, კუთხურ წერტილებთან პლანეტები, დომინანტი/სუსტი ელემენტი, სტელიუმები, რეტროგრადულობა) — სწორედ ეს ხდის ანგარიშს პიროვნულს.`;

  return chatJson<NatalReportHighlights>(NATAL_SYSTEM, user, 8000);
}
