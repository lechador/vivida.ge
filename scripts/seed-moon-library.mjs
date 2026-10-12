// Seed the reusable moon-phase reading library (moon_phase_interpretation_library).
// A moon-phase reading is collective and fully determined by (phase, moon sign):
// 8 phases × 12 signs = 96 combos, each holding the complete reading shape
// (headline/summary/body/themes) that ensureMoonPhase copies into the daily
// moon_phase row, zero AI calls at serve time.
//
// Uses Vertex AI Gemini via the existing GCP project (auth via local ADC,
// `gcloud auth application-default login`). Local one-time bulk seed only;
// the live fallback self-heals via OpenRouter (see lib/moon-phase-library.ts).
//
// Usage:
//   node scripts/seed-moon-library.mjs           → fill only missing rows
//   node scripts/seed-moon-library.mjs --force   → also overwrite non-edited rows
//   node scripts/seed-moon-library.mjs --phase=full_moon,new_moon
//
// Reads GOOGLE_CLOUD_PROJECT / DATABASE_URL from
// .env.local or the environment.

import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";
import { GoogleGenAI } from "@google/genai";

try {
  for (const line of readFileSync(
    new URL("../.env.local", import.meta.url),
    "utf8",
  ).split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]])
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
} catch {}

const MODEL = "gemini-3.8-flash";
const CONCURRENCY = 4;
const force = process.argv.includes("--force");
const phaseArg = process.argv.find((a) => a.startsWith("--phase="));
const onlyPhases = phaseArg
  ? phaseArg.slice("--phase=".length).split(",")
  : null;

// Midpoint angle per phase; illumination/age derive from it. These are the
// "representative numbers" woven into the prompt, the interpretation itself
// depends only on phase + sign.
const PHASES = {
  new_moon: { labelKa: "ახალი მთვარე", angle: 0 },
  waxing_crescent: { labelKa: "მზარდი ნამგალი", angle: 45 },
  first_quarter: { labelKa: "პირველი მეოთხედი", angle: 90 },
  waxing_gibbous: { labelKa: "მზარდი გიბუსი", angle: 135 },
  full_moon: { labelKa: "სავსე მთვარე", angle: 180 },
  waning_gibbous: { labelKa: "კლებადი გიბუსი", angle: 225 },
  last_quarter: { labelKa: "ბოლო მეოთხედი", angle: 270 },
  waning_crescent: { labelKa: "კლებადი ნამგალი", angle: 315 },
};
const SYNODIC = 29.530588853;

const SIGN_KA = {
  aries: "ვერძი",
  taurus: "კურო",
  gemini: "ტყუპები",
  cancer: "კირჩხიბი",
  leo: "ლომი",
  virgo: "ქალწული",
  libra: "სასწორი",
  scorpio: "მორიელი",
  sagittarius: "მშვილდოსანი",
  capricorn: "თხის რქა",
  aquarius: "მერწყული",
  pisces: "თევზები",
};
const SIGN_EN = {
  aries: "Aries",
  taurus: "Taurus",
  gemini: "Gemini",
  cancer: "Cancer",
  leo: "Leo",
  virgo: "Virgo",
  libra: "Libra",
  scorpio: "Scorpio",
  sagittarius: "Sagittarius",
  capricorn: "Capricorn",
  aquarius: "Aquarius",
  pisces: "Pisces",
};

// Mirrors MOON_PHASE_SYSTEM_PROMPT in lib/openrouter.ts so seeded and
// self-healed entries share one voice and shape.
const SYSTEM = `შენ ხარ თბილი, თანამედროვე ქართველი ასტროლოგი/რედაქტორი. ცოცხალი, კონკრეტული ენა, არა ბუნდოვანი მისტიკა. წერ კოლექტიური მთვარის ენერგიის შესახებ, რას ნიშნავს ეს ფაზა + ნიშანი ყველასთვის ერთად, ნატალურ რუკასთან კავშირის გარეშე.

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
- ფაზის+ნიშნის სპეციფიკური ენერგიის ხაზგასმა, არა უნივერსალური "მთვარე გრძნობებზეა"
- მხოლოდ JSON, ფენსების გარეშე`;

function prompt(phaseKey, sign) {
  const p = PHASES[phaseKey];
  const illumination = (1 - Math.cos((p.angle * Math.PI) / 180)) / 2;
  const age = (p.angle / 360) * SYNODIC;
  return [
    `მთვარის ფაზა: ${p.labelKa} (${phaseKey})`,
    `მთვარის ნიშანი: ${SIGN_KA[sign]} (${SIGN_EN[sign]})`,
    `განათება: ${(illumination * 100).toFixed(1)}%`,
    `ციკლის ასაკი: ${age.toFixed(1)} დღე (29.53 დღიანი ციკლიდან)`,
    `მზე-მთვარის კუთხე: ${p.angle.toFixed(1)}°`,
    "",
    "დააწერე ამ ფაზის+ნიშნის კოლექტიური ინტერპრეტაცია. JSON-ად დააბრუნე.",
  ].join("\n");
}

const ai = new GoogleGenAI({
  vertexai: true,
  project: process.env.GOOGLE_CLOUD_PROJECT,
  location: "global",
});

async function generate(phaseKey, sign) {
  const res = await ai.models.generateContent({
    model: MODEL,
    contents: prompt(phaseKey, sign),
    config: {
      thinkingConfig: { thinkingLevel: "LOW" },
      systemInstruction: SYSTEM,
      temperature: 0.8,
      responseMimeType: "application/json",
    },
  });
  const raw = res.text?.trim();
  if (!raw) throw new Error("empty");
  const stripped = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
  const parsed = JSON.parse(stripped);
  if (!parsed.headline || !parsed.summary || !parsed.body)
    throw new Error("missing fields");
  return {
    headline: String(parsed.headline).trim(),
    summary: String(parsed.summary).trim(),
    body: String(parsed.body).trim(),
    themes: Array.isArray(parsed.themes)
      ? parsed.themes.slice(0, 3).map(String)
      : [],
  };
}

async function main() {
  if (!process.env.GOOGLE_CLOUD_PROJECT)
    throw new Error("GOOGLE_CLOUD_PROJECT missing");
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL missing");
  const sql = neon(process.env.DATABASE_URL);

  const existing = new Map(
    (await sql`SELECT key, edited FROM moon_phase_interpretation_library`).map(
      (r) => [r.key, r.edited],
    ),
  );

  const tasks = [];
  for (const phase of Object.keys(PHASES)) {
    if (onlyPhases && !onlyPhases.includes(phase)) continue;
    for (const sign of Object.keys(SIGN_KA)) {
      const key = `${phase}:${sign}`;
      if (existing.get(key) === true) continue; // never touch human-edited rows
      if (existing.has(key) && !force) continue;
      tasks.push({ phase, sign, key });
    }
  }

  console.log(
    `tasks: ${tasks.length} (force=${force}, model=${MODEL} via Vertex AI)`,
  );
  let done = 0,
    ok = 0,
    fail = 0;

  async function worker(queue) {
    for (;;) {
      const t = queue.shift();
      if (!t) return;
      try {
        const r = await generate(t.phase, t.sign);
        await sql`
          INSERT INTO moon_phase_interpretation_library (key, phase, sign, headline, summary, body, themes, model)
          VALUES (${t.key}, ${t.phase}, ${t.sign}, ${r.headline}, ${r.summary}, ${r.body}, ${JSON.stringify(r.themes)}, ${MODEL})
          ON CONFLICT (key) DO UPDATE
            SET headline = EXCLUDED.headline, summary = EXCLUDED.summary,
                body = EXCLUDED.body, themes = EXCLUDED.themes,
                model = EXCLUDED.model, updated_at = now()
          WHERE moon_phase_interpretation_library.edited = false`;
        ok++;
      } catch (e) {
        fail++;
        console.log("FAIL", t.key, e.message);
      }
      done++;
      if (done % 12 === 0) console.log(`  ${done}/${tasks.length}…`);
    }
  }

  const queue = [...tasks];
  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker(queue)));
  console.log(`done: ${ok} written, ${fail} failed`);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
