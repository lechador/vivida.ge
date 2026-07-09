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

// Structured sections (strengths / weaknesses / the dual life-domains) must obey
// the exact list format — this system prompt forbids prose so the writer voice
// above doesn't turn the lists back into paragraphs.
const SYSTEM_STRUCTURED =
  "შენ ხარ ქართველი ფსიქოლოგი. წერ გამართულ, უნაკლო ქართულს. მკაცრად დაიცავი " +
  "მოთხოვნილი ფორმატი: მხოლოდ ის სია/პუნქტები, რასაც გთხოვენ. არ დაწერო შესავალი " +
  "აბზაცი, დასკვნა ან რაიმე პროზა — მხოლოდ **მუქი სათაური** — მოკლე ახსნა, ხაზობრივად.";

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

// Rich 16Personalities-style profile sections — pre-written per 4-letter type.
// "list" = one bulleted list; "dual" = a ძლიერი block + a სუსტი block.
const SECTIONS = [
  { kind: "strengths", titleKa: "ძლიერი მხარეები", format: "list" },
  { kind: "weaknesses", titleKa: "სუსტი მხარეები", format: "list" },
  { kind: "romantic", titleKa: "რომანტიკული ურთიერთობები", format: "dual" },
  { kind: "friendship", titleKa: "მეგობრობა", format: "dual" },
  { kind: "career", titleKa: "კარიერული გზა", format: "dual" },
  { kind: "workplace", titleKa: "სამუშაო ჩვევები", format: "dual" },
  { kind: "growth", titleKa: "პიროვნული ზრდა", format: "dual" },
];
const SECTION_KINDS = SECTIONS.map((s) => s.kind);

function sectionPrompt(kind, type) {
  const label = `MBTI ტიპი ${type} (${ARCHETYPE_KA[type]})`;
  const listFmt =
    `ჩამოთვალე 6 პუნქტი. თითოეული ცალკე ხაზზე ფორმატით: **სათაური** — ერთი-ორი ` +
    `წინადადება ახსნა. არ გამოიყენო ნუმერაცია ან ტირეები დასაწყისში. მხოლოდ ეს პუნქტები.`;
  const dual = (domain) =>
    `დაწერე, როგორია ${label} ${domain}. მოიყვანე 3 ძლიერი მხარე და 3 სუსტი მხარე/` +
    `გამოწვევა ამ სფეროში, "შენ"-ის ფორმით, გამართული ქართულით. დააბრუნე ზუსტად ამ ` +
    `ფორმატში, დამატებითი ტექსტისა და ნუმერაციის გარეშე:\n` +
    `ძლიერი მხარეები:\n**სათაური** — ერთი წინადადება.\n**სათაური** — ერთი წინადადება.\n` +
    `**სათაური** — ერთი წინადადება.\n\nსუსტი მხარეები:\n**სათაური** — ერთი წინადადება.\n` +
    `**სათაური** — ერთი წინადადება.\n**სათაური** — ერთი წინადადება.`;
  switch (kind) {
    case "strengths":
      return `დაწერე ${label}-ის ძლიერი მხარეები ქართულად.\n${listFmt}`;
    case "weaknesses":
      return `დაწერე ${label}-ის სუსტი მხარეები და ბრმა წერტილები ქართულად — ` +
        `გულწრფელად მაგრამ თანაგრძნობით.\n${listFmt}`;
    case "romantic":
      return dual("რომანტიკულ ურთიერთობებში (როგორ იქცევა, რას ეძებს პარტნიორში, როგორ იჩენს სიყვარულს)");
    case "friendship":
      return dual("მეგობრობასა და სოციალურ კავშირებში");
    case "career":
      return dual("კარიერასა და პროფესიულ გზაზე");
    case "workplace":
      return dual("სამუშაო ადგილზე და გუნდში (როგორც კოლეგა, ხელქვეითი და ლიდერი)");
    case "growth":
      return dual("პიროვნული ზრდის თვალსაზრისით (რა არის საყრდენი და რაზე უნდა იმუშაოს)");
    default:
      throw new Error(`unknown section ${kind}`);
  }
}

const ai = new GoogleGenAI({
  vertexai: true,
  project: process.env.GOOGLE_CLOUD_PROJECT,
  location: process.env.GOOGLE_CLOUD_LOCATION || "us-central1",
});

async function generate(prompt, system = SYSTEM, temperature = 0.8) {
  const res = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: { systemInstruction: system, temperature },
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
    for (const section of SECTIONS) {
      if (onlyKinds && !onlyKinds.includes(section.kind)) continue;
      const key = `${section.kind}:${type}`;
      if (existing.get(key) === true) continue;
      if (existing.has(key) && !force) continue;
      tasks.push({ kind: section.kind, type, sign: null, key, titleKa: section.titleKa });
    }
  }

  console.log(`tasks: ${tasks.length} (force=${force}, model=${MODEL} via Vertex AI)`);
  let done = 0, ok = 0, fail = 0;

  async function worker(queue) {
    for (;;) {
      const t = queue.shift();
      if (!t) return;
      try {
        let body, title;
        if (t.kind === "type") {
          body = await generate(typePrompt(t.type));
          title = ARCHETYPE_KA[t.type];
        } else if (t.kind === "type_sun") {
          body = await generate(typeSunPrompt(t.type, t.sign));
          title = null;
        } else {
          // Sections are strict lists — use the structured system + low temp so
          // the writer voice doesn't turn them back into prose.
          body = await generate(sectionPrompt(t.kind, t.type), SYSTEM_STRUCTURED, 0.4);
          title = t.titleKa ?? null;
        }
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
