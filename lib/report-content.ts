import type { NatalChartJson } from "@/db/schema";
import { bodyMeta, formatDegree, signByIndex } from "@/lib/zodiac";
import { houseDef, HOUSE_NUMBERS } from "@/lib/houses";
import { aspectKey } from "@/lib/aspects";
import type { ChartSalience } from "@/lib/report-salience";
import {
  getLibraryEntries,
  libraryKey,
  placementsForChart,
} from "@/lib/interpretation-library";
import {
  aspectLibraryKey,
  getAspectLibraryEntries,
} from "@/lib/aspect-library";
import { getHouseLibraryEntries, houseLibraryKey } from "@/lib/house-library";

/**
 * Long-form report content — generated SPECIFICALLY for the premium PDF, not
 * reused from the (short) website interpretations. Every section is richer and
 * deeper than the on-site text so a paid report feels like a real product:
 * multi-paragraph per-placement depth, plus synthesis sections (chart
 * signature, strengths, growth) that the site doesn't have. Reuses the
 * existing OpenRouter/Gemini path (best Georgian).
 *
 * Generated in 4 PARALLEL calls (narrative / planets / houses / aspects) so
 * each can be long without hitting one call's token ceiling.
 */

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = process.env.OPENROUTER_REPORT_MODEL || "google/gemini-3.8-flash";

type OpenRouterResponse = {
  choices?: Array<{ message?: { content?: string } }>;
  error?: { message?: string };
};

async function chatJson<T>(
  system: string,
  user: string,
  maxTokens: number,
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
      reasoning: { effort: "low" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
      temperature: 0.72,
      max_tokens: maxTokens,
    }),
    // Never let a single call hang the whole request past the function budget.
    signal: AbortSignal.timeout(110_000),
  });
  if (!res.ok) {
    throw new Error(
      `OpenRouter ${res.status}: ${(await res.text().catch(() => "")).slice(0, 300)}`,
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

const SYSTEM = `შენ ხარ გამოცდილი, თბილი და ღრმა ცოდნის მქონე ასტროლოგი, რომელიც წერს ფასიან, პრემიუმ ნატალურ ანგარიშს ქართულ ენაზე.
ეს არ არის უფასო, მოკლე აღწერა — ეს არის სიღრმისეული, ღირებული პროდუქტი, რომელშიც ადამიანმა ფული გადაიხადა.
სტილი: მდიდარი, ლიტერატურული, ფსიქოლოგიურად ღრმა, მაგრამ კონკრეტული და პიროვნული. თითო პლანეტა/სახლი/ასპექტი დაამუშავე ღრმად — ფსიქოლოგია, გამოვლინება, ძლიერი მხარე და ზრდის ზონა.
წესები:
- წერe მხოლოდ ქართულად, გამართულად, მდიდარი ლექსიკით.
- მიმართე მკითხველს მეორე პირში ("შენ").
- იყავი კონკრეტული ამ რუკის მიმართ — არა ზოგადი ჰოროსკოპული ფრაზები.
- არ გაიმეორო ერთი და იგივე აზრი.
- დააბრუნე მხოლოდ ვალიდური JSON ზუსტად მოთხოვნილი ფორმით.`;

// ─── Types ────────────────────────────────────────────────────────────────

export type NatalNarrative = {
  /** 4–6 bespoke highlights, most-striking-first, driven by the salience. */
  standout: Array<{ title: string; body: string }>;
  /** A synthesising "chart signature" — the core archetype of this chart. */
  signature: string;
  /** Elemental + modal balance synthesis, including the weak/missing end. */
  balance: string;
  /** Concrete strengths & gifts (rich paragraph). */
  strengths: string;
  /** Growth edges / shadow work (rich paragraph). */
  growth: string;
  /** Warm closing synthesis. */
  closing: string;
};

export type NatalReportContent = {
  narrative: NatalNarrative | null;
  planets: Record<string, string> | null;
  houses: Record<string, string> | null;
  aspects: Record<string, string> | null;
};

// ─── Fact builders (so the AI interprets the REAL chart) ──────────────────

const PLANET_KEYS = [
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
] as const;

function planetFacts(chart: NatalChartJson): string {
  const lines: string[] = [];
  const asc = signByIndex(chart.ascendant.signIndex);
  lines.push(
    `ამომავალი (ასცენდენტი): ${asc.labelKa}, ${formatDegree(chart.ascendant.signDegree)}`,
  );
  for (const key of PLANET_KEYS) {
    const p = chart.bodies[key];
    if (!p) continue;
    const sign = signByIndex(p.signIndex);
    lines.push(
      `${bodyMeta(key)?.labelKa ?? key}: ${sign.labelKa}, ${formatDegree(p.signDegree)}${p.house ? `, მე-${p.house} სახლი` : ""}${p.retrograde ? ", რეტროგრადული" : ""}`,
    );
  }
  return lines.join("\n");
}

function houseFacts(chart: NatalChartJson): string {
  const occupants: Record<number, string[]> = {};
  for (const [key, p] of Object.entries(chart.bodies)) {
    if (p.house)
      (occupants[p.house] ??= []).push(bodyMeta(key)?.labelKa ?? key);
  }
  return HOUSE_NUMBERS.map((n) => {
    const cusp = chart.houses.find((h) => h.number === n);
    const sign = cusp ? signByIndex(cusp.signIndex).labelKa : "—";
    const occ = occupants[n]?.length
      ? `, შიგნით: ${occupants[n].join(", ")}`
      : "";
    return `მე-${n} სახლი (${houseDef(n).themeKa}): ${sign}${occ}`;
  }).join("\n");
}

// ─── Generators (parallel) ─────────────────────────────────────────────────

async function generateNarrative(input: {
  firstName: string | null;
  chart: NatalChartJson;
  salience: ChartSalience;
}): Promise<NatalNarrative | null> {
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
        `  ${a.aLabel}–${a.bLabel} (${a.kind}, ${a.family}, ორბი ${a.orb.toFixed(1)}°)`,
    )
    .join("\n");
  const angular = s.angularPlanets.length
    ? s.angularPlanets
        .map((p) => `  ${p.label} ≈ ${p.angle} (${p.orb.toFixed(1)}°)`)
        .join("\n")
    : "  (არცერთი)";
  const stelliums = s.stelliums.length
    ? s.stelliums
        .map((st) => `  ${st.label}: ${st.planets.join(", ")}`)
        .join("\n")
    : "  (არცერთი)";
  const retro = s.retrogrades.length
    ? s.retrogrades.map((r) => r.label).join(", ")
    : "(არცერთი)";

  const user = `გამოთვლილი მონაცემები${input.firstName ? ` (${input.firstName})` : ""}:

${planetFacts(input.chart)}

ელემენტების ბალანსი (დომინანტი: ${s.elements.dominant}, სუსტი: ${s.elements.weakest}):
${elLines}

მოდალობების ბალანსი (დომინანტი: ${s.modality.dominant}, სუსტი: ${s.modality.weakest}):
${modLines}

ყველაზე ზუსტი ასპექტები:
${aspectLines}

კუთხურ წერტილებთან:
${angular}

სტელიუმები:
${stelliums}

რეტროგრადული: ${retro}

დააბრუნე JSON:
{
  "standout": [ { "title": "...", "body": "3-5 წინადადება" } ],   // 4-6 ელემენტი, ყველაზე თვალშისაცემიდან, გამოთვლილ მონაცემებზე დაყრდნობით
  "signature": "5-7 წინადადება — ამ რუკის ბირთვული არქეტიპი/ხელწერა, სინთეზი",
  "balance": "4-6 წინადადება ელემენტებსა და მოდალობებზე, სუსტი მხარის ჩათვლით",
  "strengths": "5-7 წინადადება კონკრეტული ძლიერი მხარეები და ნიჭები",
  "growth": "5-7 წინადადება ზრდის ზონები და ჩრდილი — როგორ იმუშაოს მათზე",
  "closing": "4-5 წინადადებიანი თბილი დასკვნა"
}`;
  return chatJson<NatalNarrative>(SYSTEM, user, 12000);
}

async function generatePlanets(
  chart: NatalChartJson,
): Promise<Record<string, string> | null> {
  const user = `რუკის პლანეტარული განლაგება:
${planetFacts(chart)}

დააბრუნე JSON, სადაც თითო პლანეტა (sun, moon, ascendant, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto) ღრმად არის ინტერპრეტირებული — თითო 6-9 წინადადება, რომელიც მოიცავს: პლანეტის ფუნქციას ფსიქიკაში, ნიშნის გავლენას, სახლის (ცხოვრების სფერო) მნიშვნელობას, რეტროგრადულობას თუ აქვს, კონკრეტულ ძლიერ მხარესა და ზრდის ზონას.
ფორმატი: { "sun": "...", "moon": "...", "ascendant": "...", "mercury": "...", ... }`;
  return chatJson<Record<string, string>>(SYSTEM, user, 24000);
}

async function generateHouses(
  chart: NatalChartJson,
): Promise<Record<string, string> | null> {
  const user = `რუკის 12 სახლი:
${houseFacts(chart)}

დააბრუნე JSON, სადაც თითო სახლი ("1".."12") ღრმად არის ინტერპრეტირებული — თითო 5-7 წინადადება: ცხოვრების სფერო, კუსპის ნიშნისა და შიგა პლანეტების გავლენა, რა უნდა განავითაროს ამ სფეროში.
ფორმატი: { "1": "...", "2": "...", ..., "12": "..." }`;
  return chatJson<Record<string, string>>(SYSTEM, user, 24000);
}

async function generateAspects(
  chart: NatalChartJson,
  salience: ChartSalience,
): Promise<Record<string, string> | null> {
  const list = salience.tightestAspects
    .map(
      (a, i) =>
        `${i + 1}. ${a.aLabel}–${a.bLabel} | kind=${a.kind} | family=${a.family} | ორბი ${a.orb.toFixed(1)}° | key=${aspectKey(a.a, a.b, a.kind as Parameters<typeof aspectKey>[2])}`,
    )
    .join("\n");
  const user = `ამ რუკის ყველაზე ძლიერი ასპექტები (ზუსტი = ძლიერი):
${list}

დააბრუნე JSON, სადაც გასაღები არის თითო ასპექტის "key" და მნიშვნელობა — ღრმა ინტერპრეტაცია (5-7 წინადადება): ორ პლანეტას შორის დინამიკა, ჰარმონიული/დაძაბული ბუნება, როგორ ვლინდება ცხოვრებაში, როგორ იმუშაოს მასთან.
ფორმატი: { "<key>": "...", ... }`;
  return chatJson<Record<string, string>>(SYSTEM, user, 16000);
}

export async function generateNatalReport(input: {
  firstName: string | null;
  chart: NatalChartJson;
  salience: ChartSalience;
}): Promise<NatalReportContent> {
  const { chart } = input;

  // The per-placement (Big Three + planet) section reuses the shared
  // interpretation library — the same text the website report shows — so the
  // PDF reads consistently and, when the library covers every placement, we
  // skip the heavy per-PDF planets AI call entirely (faster). Falls back to
  // on-the-fly generation if the library isn't seeded.
  const placements = placementsForChart(chart);
  const lib = await getLibraryEntries(
    placements.map((p) => libraryKey(p.subject, p.sign)),
  ).catch(() => new Map<string, string>());
  const libPlanets: Record<string, string> = {};
  for (const p of placements) {
    const body = lib.get(libraryKey(p.subject, p.sign));
    if (body) libPlanets[p.subject] = body;
  }
  const planetsComplete =
    placements.length > 0 && placements.every((p) => libPlanets[p.subject]);

  // Same idea for the aspect section: when the shared aspect library already
  // covers every aspect this report would discuss, skip the per-PDF aspects
  // AI call entirely.
  const tightest = input.salience.tightestAspects;
  const aspectLib = await getAspectLibraryEntries(
    tightest.map((a) =>
      aspectLibraryKey(a.a, a.b, a.kind as Parameters<typeof aspectKey>[2]),
    ),
  ).catch(() => new Map<string, string>());
  const libAspects: Record<string, string> = {};
  for (const a of tightest) {
    const kind = a.kind as Parameters<typeof aspectKey>[2];
    const body = aspectLib.get(aspectLibraryKey(a.a, a.b, kind));
    if (body) libAspects[aspectKey(a.a, a.b, kind)] = body;
  }
  const aspectsComplete =
    tightest.length > 0 &&
    tightest.every((a) =>
      aspectLib.has(
        aspectLibraryKey(a.a, a.b, a.kind as Parameters<typeof aspectKey>[2]),
      ),
    );

  // Same idea for houses: compose each house's cusp-sign text + its occupant
  // planets' texts from the shared house library. Skip the per-PDF houses AI
  // call only when every cusp AND every occupant this chart needs is covered.
  const houseCusps: { house: number; sign: string }[] = [];
  for (const n of HOUSE_NUMBERS) {
    const cusp = chart.houses.find((h) => h.number === n);
    if (cusp)
      houseCusps.push({ house: n, sign: signByIndex(cusp.signIndex).key });
  }
  const houseOccupants = Object.entries(chart.bodies)
    .filter(([, p]) => p.house)
    .map(([key, p]) => ({ house: p.house as number, planet: key }));
  const houseLib = await getHouseLibraryEntries([
    ...houseCusps.map((c) => houseLibraryKey("cusp", c.house, c.sign)),
    ...houseOccupants.map((o) =>
      houseLibraryKey("occupant", o.house, o.planet),
    ),
  ]).catch(() => new Map<string, string>());
  const libHouses: Record<string, string> = {};
  for (const c of houseCusps) {
    const cuspBody = houseLib.get(houseLibraryKey("cusp", c.house, c.sign));
    if (!cuspBody) continue;
    const occupantBodies = houseOccupants
      .filter((o) => o.house === c.house)
      .map((o) => houseLib.get(houseLibraryKey("occupant", o.house, o.planet)))
      .filter((b): b is string => Boolean(b));
    libHouses[String(c.house)] = [cuspBody, ...occupantBodies].join("\n\n");
  }
  const housesComplete =
    houseCusps.length > 0 &&
    houseCusps.every((c) =>
      houseLib.has(houseLibraryKey("cusp", c.house, c.sign)),
    ) &&
    houseOccupants.every((o) =>
      houseLib.has(houseLibraryKey("occupant", o.house, o.planet)),
    );

  const [narrative, planets, houses, aspects] = await Promise.all([
    generateNarrative(input).catch((e) => {
      console.warn("[report] narrative failed:", (e as Error).message);
      return null;
    }),
    planetsComplete
      ? Promise.resolve(libPlanets)
      : generatePlanets(chart).catch((e) => {
          console.warn("[report] planets failed:", (e as Error).message);
          return Object.keys(libPlanets).length ? libPlanets : null;
        }),
    housesComplete
      ? Promise.resolve(libHouses)
      : generateHouses(chart).catch((e) => {
          console.warn("[report] houses failed:", (e as Error).message);
          return Object.keys(libHouses).length ? libHouses : null;
        }),
    aspectsComplete
      ? Promise.resolve(libAspects)
      : generateAspects(chart, input.salience).catch((e) => {
          console.warn("[report] aspects failed:", (e as Error).message);
          return Object.keys(libAspects).length ? libAspects : null;
        }),
  ]);
  return { narrative, planets, houses, aspects };
}
