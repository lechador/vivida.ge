// Seed the reusable Astro-MBTI interpretation library (mbti_interpretation_library).
// The pro-written bulk a fast live `flash` call composes over at test time:
//   - "type"     — (mbtiType): deep psychological portrait; title = archetype. 16
//   - "type_sun" — (mbtiType, sun sign): how the type expresses through the sign. 192
// Total 208. One AI call per row.
//
// Uses Vertex AI Gemini (gemini-2.5-pro) via the GCP project set up for Veo —
// auth via local ADC (`gcloud auth application-default login`). Local one-time
// bulk seed only; the live self-heal (lib/mbti-library.ts) uses OpenRouter.
//
// Usage:
//   node scripts/seed-mbti-library.mjs                 → fill only missing rows
//   node scripts/seed-mbti-library.mjs --force         → overwrite non-edited rows
//   node scripts/seed-mbti-library.mjs --kind=type     → only type profiles
//   node scripts/seed-mbti-library.mjs --type=INFJ,ENTP

import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";
import { GoogleGenAI } from "@google/genai";

try {
  for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
} catch {}

const MODEL = "gemini-2.5-pro";
const CONCURRENCY = 5;
const force = process.argv.includes("--force");
const kindArg = process.argv.find((a) => a.startsWith("--kind="));
const onlyKinds = kindArg ? kindArg.slice("--kind=".length).split(",") : null;
const typeArg = process.argv.find((a) => a.startsWith("--type="));
const onlyTypes = typeArg ? typeArg.slice("--type=".length).split(",") : null;

const TYPES = [
  "ISTJ", "ISFJ", "INFJ", "INTJ", "ISTP", "ISFP", "INFP", "INTP",
  "ESTP", "ESFP", "ENFP", "ENTP", "ESTJ", "ESFJ", "ENFJ", "ENTJ",
];

const ARCHETYPE_KA = {
  ISTJ: "ლოგისტიკოსი", ISFJ: "დამცველი", INFJ: "ადვოკატი", INTJ: "არქიტექტორი",
  ISTP: "ვირტუოზი", ISFP: "ავანტიურისტი", INFP: "შუამავალი", INTP: "ლოგიკოსი",
  ESTP: "მეწარმე", ESFP: "გამრთობი", ENFP: "ენთუზიასტი", ENTP: "პოლემისტი",
  ESTJ: "აღმასრულებელი", ESFJ: "კონსული", ENFJ: "პროტაგონისტი", ENTJ: "მეთაური",
};

const SIGN_KA = {
  aries: "ვერძი", taurus: "კურო", gemini: "ტყუპები", cancer: "კირჩხიბი",
  leo: "ლომი", virgo: "ქალწული", libra: "სასწორი", scorpio: "მორიელი",
  sagittarius: "მშვილდოსანი", capricorn: "თხის რქა", aquarius: "მერწყული", pisces: "თევზები",
};
const SIGN_ELEMENT = {
  aries: "ცეცხლის", leo: "ცეცხლის", sagittarius: "ცეცხლის",
  taurus: "მიწის", virgo: "მიწის", capricorn: "მიწის",
  gemini: "ჰაერის", libra: "ჰაერის", aquarius: "ჰაერის",
  cancer: "წყლის", scorpio: "წყლის", pisces: "წყლის",
};
const SIGN_KEYS = Object.keys(SIGN_KA);

const SYSTEM =
  "შენ ხარ გამოცდილი ქართველი ფსიქოანალიტიკოსი და მწერალი. წერ ბუნებრივ, მდიდარ, " +
  "ლიტერატურულ ქართულად — გრამატიკულად უნაკლო, ცოცხალი და კონკრეტული. თავიდან აიცილე " +
  "თარგმანის სტილი, გამეორებები და კლიშეები.";

function typePrompt(type) {
  return (
    `დაწერე MBTI ტიპის — ${type} (${ARCHETYPE_KA[type]}) — ღრმა ფსიქოლოგიური პორტრეტი ქართულად.\n` +
    `ახსენი: ამ ტიპის ბირთვული მოტივაცია, ძლიერი მხარეები, ბრმა წერტილები, როგორ ფიქრობს, ` +
    `გრძნობს და იღებს გადაწყვეტილებებს. 4-6 აბზაცი, "შენ"-ის ფორმა, თბილი და კონკრეტული. ` +
    `დააბრუნე მხოლოდ ტექსტი.`
  );
}
function typeSunPrompt(type, sign) {
  return (
    `დაწერე, როგორ ვლინდება MBTI ტიპი ${type} (${ARCHETYPE_KA[type]}), როცა ადამიანის ` +
    `მზის ნიშანი ${SIGN_KA[sign]}-ია.\n` +
    `${SIGN_KA[sign]} — ${SIGN_ELEMENT[sign]} ელემენტის ნიშანი. ახსენი, სად ამძაფრებს ან ` +
    `არბილებს ${SIGN_KA[sign]}-ის მზე ამ ტიპის ბუნებას — კონკრეტული, ცოცხალი ნიუანსებით. ` +
    `3-4 აბზაცი, "შენ"-ის ფორმა. დააბრუნე მხოლოდ ტექსტი.`
  );
}

const ai = new GoogleGenAI({
  vertexai: true,
  project: process.env.GOOGLE_CLOUD_PROJECT,
  location: process.env.GOOGLE_CLOUD_LOCATION || "us-central1",
});

async function generate(prompt) {
  const res = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: { systemInstruction: SYSTEM, temperature: 0.8 },
  });
  const body = res.text?.trim();
  if (!body) throw new Error("empty");
  return body;
}

async function main() {
  if (!process.env.GOOGLE_CLOUD_PROJECT) throw new Error("GOOGLE_CLOUD_PROJECT missing");
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL missing");
  const sql = neon(process.env.DATABASE_URL);

  const existing = new Map(
    (await sql`SELECT key, edited FROM mbti_interpretation_library`).map((r) => [r.key, r.edited])
  );

  const types = TYPES.filter((t) => !onlyTypes || onlyTypes.includes(t));
  const tasks = [];
  for (const type of types) {
    if (!onlyKinds || onlyKinds.includes("type")) {
      const key = `type:${type}`;
      if (existing.get(key) !== true && (!existing.has(key) || force)) {
        tasks.push({ kind: "type", type, sign: null, key });
      }
    }
    if (!onlyKinds || onlyKinds.includes("type_sun")) {
      for (const sign of SIGN_KEYS) {
        const key = `type_sun:${type}:${sign}`;
        if (existing.get(key) === true) continue;
        if (existing.has(key) && !force) continue;
        tasks.push({ kind: "type_sun", type, sign, key });
      }
    }
  }

  console.log(`tasks: ${tasks.length} (force=${force}, model=${MODEL} via Vertex AI)`);
  let done = 0, ok = 0, fail = 0;

  async function worker(queue) {
    for (;;) {
      const t = queue.shift();
      if (!t) return;
      try {
        const body = t.kind === "type" ? await generate(typePrompt(t.type)) : await generate(typeSunPrompt(t.type, t.sign));
        const title = t.kind === "type" ? ARCHETYPE_KA[t.type] : null;
        await sql`
          INSERT INTO mbti_interpretation_library (key, kind, mbti_type, sign, title, body, model)
          VALUES (${t.key}, ${t.kind}, ${t.type}, ${t.sign}, ${title}, ${body}, ${MODEL})
          ON CONFLICT (key) DO UPDATE
            SET title = EXCLUDED.title, body = EXCLUDED.body, model = EXCLUDED.model, updated_at = now()
          WHERE mbti_interpretation_library.edited = false`;
        ok++;
      } catch (e) {
        fail++;
        console.log("FAIL", t.key, e.message);
      }
      done++;
      if (done % 20 === 0) console.log(`  ${done}/${tasks.length}…`);
    }
  }

  const queue = [...tasks];
  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker(queue)));
  console.log(`done: ${ok} written, ${fail} failed`);
}

main().catch((e) => { console.error(e.message); process.exit(1); });
