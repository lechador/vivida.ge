// Seed the reusable per-transit interpretation library (transit_interpretation_library).
// A transit reads identically for every user who has it, so each finite combo is
// generated once and daily horoscopes are composed from these rows with zero
// per-user AI calls (see lib/transit-library.ts + actions/daily.ts):
//   - "aspect" — (transiting body, aspect kind, natal point): 10 × 5 × 13 = 650
//   - "house"  — (transiting body, natal house): 10 × 12 = 120
//   - "sign"   — (fast body sun…mars, sign): 5 × 12 = 60
// Total 830. One AI call per entry, JSON {title, body} output.
//
// Uses Vertex AI Gemini (not OpenRouter) via the existing GCP project set up
// for Veo video generation — auth via local ADC (`gcloud auth
// application-default login`), no API key needed. Only for this local,
// one-time bulk seed; the live in-app self-heal fallback
// (lib/transit-library.ts) still uses OpenRouter since Vertex ADC isn't
// available in the deployed serverless environment.
//
// Usage:
//   node scripts/seed-transit-library.mjs                → fill only missing rows
//   node scripts/seed-transit-library.mjs --force        → also overwrite non-edited rows
//   node scripts/seed-transit-library.mjs --kind=aspect,house,sign
//   node scripts/seed-transit-library.mjs --transit=moon,venus
//
// Reads GOOGLE_CLOUD_PROJECT / GOOGLE_CLOUD_LOCATION / DATABASE_URL from
// .env.local or the environment.

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
const transitArg = process.argv.find((a) => a.startsWith("--transit="));
const onlyTransits = transitArg ? transitArg.slice("--transit=".length).split(",") : null;

// --- Static maps (mirror lib/zodiac.ts, lib/houses.ts, lib/transit-library.ts) ---

const TRANSIT_BODIES = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"];
const SIGN_BODIES = ["sun", "moon", "mercury", "venus", "mars"];
// Natal points a transit can aspect (matches ASPECT_BODIES in lib/aspect-library.ts).
const NATAL_POINTS = [...TRANSIT_BODIES, "chiron", "ascendant", "midheaven"];
const ASPECT_KINDS = ["conjunction", "sextile", "square", "trine", "opposition"];

const BODY_KA = {
  sun: "მზე", moon: "მთვარე", mercury: "მერკური", venus: "ვენერა", mars: "მარსი",
  jupiter: "იუპიტერი", saturn: "სატურნი", uranus: "ურანი", neptune: "ნეპტუნი",
  pluto: "პლუტონი", chiron: "ქირონი", ascendant: "ამომავალი", midheaven: "ზენიტი",
};
const BODY_MEANING_KA = {
  sun: "ბირთვი, იდენტობა, სიცოცხლის ცეცხლი",
  moon: "ემოციები, შინაგანი სამყარო, ინსტინქტები",
  mercury: "გონება, აზროვნება, კომუნიკაცია",
  venus: "სიყვარული, სილამაზე, ღირებულებები",
  mars: "მოქმედება, ენერგია, ვნება",
  jupiter: "ზრდა, შესაძლებლობები, ფილოსოფია",
  saturn: "დისციპლინა, საზღვრები, ხანგრძლივი მიზანი",
  uranus: "ცვლილება, თავისუფლება, უცხო",
  neptune: "ოცნება, ინტუიცია, წარმოსახვა",
  pluto: "ტრანსფორმაცია, ძალა, განახლება",
  chiron: "შინაგანი ჭრილობა, განკურნება, სიბრძნე ტკივილიდან",
  ascendant: "სოციალური ნიღაბი, პირველი შთაბეჭდილება",
  midheaven: "კარიერა, საზოგადოებრივი იმიჯი",
};

const KIND_KA = {
  conjunction: "შეერთება (conjunction)",
  sextile: "სექსტილი (sextile)",
  square: "კვადრატი (square)",
  trine: "ტრინი (trine)",
  opposition: "ოპოზიცია (opposition)",
};

const TIMESCALE_KA = {
  moon: "დღეს (მთვარის ტრანზიტი 1-2 დღე გრძელდება)",
  sun: "ამ დღეებში (მზის ტრანზიტი რამდენიმე დღე გრძელდება)",
  mercury: "ამ დღეებში (რამდენიმე დღე გრძელდება)",
  venus: "ამ დღეებში (რამდენიმე დღე გრძელდება)",
  mars: "ამ კვირაში (დაახლოებით ერთი კვირა გრძელდება)",
  jupiter: "ამ პერიოდში (კვირები გრძელდება)",
  saturn: "ამ პერიოდში (კვირები და თვეები გრძელდება)",
  uranus: "ამ პერიოდში (თვეები გრძელდება)",
  neptune: "ამ პერიოდში (თვეები გრძელდება)",
  pluto: "ამ პერიოდში (თვეები გრძელდება)",
};

const HOUSES = {
  1: { labelKa: "1-ლი სახლი", themeKa: "ჩემი თავი", meaningKa: "ის, თუ როგორ შემოდიხარ ოთახში — შენი თვითპრეზენტაცია და პირველი შთაბეჭდილება." },
  2: { labelKa: "მე-2 სახლი", themeKa: "ჩემი რესურსები", meaningKa: "შენი რესურსები, თვითშეფასება და ის, რაც ცხოვრებაში ფასობს." },
  3: { labelKa: "მე-3 სახლი", themeKa: "კომუნიკაცია", meaningKa: "ყოველდღიური აზროვნება, საუბრები, უახლოესი გარემო და სწავლა." },
  4: { labelKa: "მე-4 სახლი", themeKa: "სახლი, ოჯახი", meaningKa: "ემოციური საფუძველი, ოჯახი, ფესვები და პირადი სივრცე." },
  5: { labelKa: "მე-5 სახლი", themeKa: "სიხარული, რომანი", meaningKa: "სიხარული, თვითგამოხატვა, რომანტიკული თამაში და შემოქმედებითი პროექტები." },
  6: { labelKa: "მე-6 სახლი", themeKa: "საქმე, სხეული", meaningKa: "ყოველდღიური რუტინა, სამსახური, ჯანმრთელობა და სხვებისთვის სამსახური." },
  7: { labelKa: "მე-7 სახლი", themeKa: "მე და შენ", meaningKa: "ერთ-ერთი ადამიანი, ვისთანაც ცხოვრობ — სასიყვარულო, საქმიანი ან მოწინააღმდეგე." },
  8: { labelKa: "მე-8 სახლი", themeKa: "ტრანსფორმაცია", meaningKa: "ღრმა ცვლილებები, საერთო რესურსები, ფსიქოლოგიური სიღრმე და ინტიმი." },
  9: { labelKa: "მე-9 სახლი", themeKa: "მსოფლმხედველობა", meaningKa: "უმაღლესი სწავლა, შორი მოგზაურობა, რწმენა და ცხოვრებისეული შეხედულებები." },
  10: { labelKa: "მე-10 სახლი", themeKa: "კარიერა, სტატუსი", meaningKa: "ის, რითაც გცნობენ საზოგადოებაში — კარიერა, ავტორიტეტი, წარმატება." },
  11: { labelKa: "მე-11 სახლი", themeKa: "თემი, მიზნები", meaningKa: "შენი წრე, თემი, იმედები მომავლისადმი და გრძელვადიანი მიზნები." },
  12: { labelKa: "მე-12 სახლი", themeKa: "ფარული სამყარო", meaningKa: "ფარული სამყარო, ოცნებები, სულიერება, ის, რასაც ღიად ვერ ვაჩვენებთ." },
};

const SIGN_KA = {
  aries: "ვერძი", taurus: "კურო", gemini: "ტყუპები", cancer: "კირჩხიბი",
  leo: "ლომი", virgo: "ქალწული", libra: "სასწორი", scorpio: "მორიელი",
  sagittarius: "მშვილდოსანი", capricorn: "თხის რქა", aquarius: "მერწყული", pisces: "თევზები",
};
const SIGN_NATURE_KA = {
  aries: "ცეცხლის კარდინალური ნიშანი, რომელსაც განაგებს მარსი",
  taurus: "მიწის ფიქსირებული ნიშანი, რომელსაც განაგებს ვენერა",
  gemini: "ჰაერის მუტაბელური ნიშანი, რომელსაც განაგებს მერკური",
  cancer: "წყლის კარდინალური ნიშანი, რომელსაც განაგებს მთვარე",
  leo: "ცეცხლის ფიქსირებული ნიშანი, რომელსაც განაგებს მზე",
  virgo: "მიწის მუტაბელური ნიშანი, რომელსაც განაგებს მერკური",
  libra: "ჰაერის კარდინალური ნიშანი, რომელსაც განაგებს ვენერა",
  scorpio: "წყლის ფიქსირებული ნიშანი, რომელსაც განაგებს პლუტონი",
  sagittarius: "ცეცხლის მუტაბელური ნიშანი, რომელსაც განაგებს იუპიტერი",
  capricorn: "მიწის კარდინალური ნიშანი, რომელსაც განაგებს სატურნი",
  aquarius: "ჰაერის ფიქსირებული ნიშანი, რომელსაც განაგებს ურანი",
  pisces: "წყლის მუტაბელური ნიშანი, რომელსაც განაგებს ნეპტუნი",
};
const SIGN_KEYS = Object.keys(SIGN_KA);

const SYSTEM =
  'შენ ხარ გამოცდილი ქართველი ასტროლოგი და მწერალი. წერ ბუნებრივ, მდიდარ, ' +
  'ლიტერატურულ ქართულად — გრამატიკულად უნაკლო, ცოცხალი და კონკრეტული. ' +
  'თავიდან აიცილე თარგმანის სტილი, გამეორებები და კლიშეები ("ვარსკვლავები გელიან"). ' +
  'დააბრუნე მხოლოდ JSON: {"title": "...", "body": "..."} — title არის ' +
  'მოკლე სათაური (3-6 სიტყვა, წერტილის გარეშე), body — ტექსტი. title-ში ' +
  'დაასახელე კონკრეტული თემა ან მოქმედება; არ გამოიყენო ორი აბსტრაქტული ' +
  'არსებითი სახელის ფორმულა, ზედიზედ "X და Y", ან ხშირად გამეორებული ' +
  'სიტყვები: სული, გული, შინაგანი, ჰარმონია, დღე.';

// Prompts mirror buildTransitPrompt in lib/transit-library.ts.
function aspectPrompt(t, kind, n) {
  return (
    `დაწერე დღიური ტრანზიტის ინტერპრეტაცია: ტრანზიტული ${BODY_KA[t]} ${KIND_KA[kind]} ` +
    `ნატალურ ${BODY_KA[n]}-სთან.\n` +
    `ტრანზიტული ${BODY_KA[t]} — დღევანდელი ცის ენერგია (${BODY_MEANING_KA[t]}). ` +
    `ნატალური ${BODY_KA[n]} — ადამიანის თანდაყოლილი თვისება (${BODY_MEANING_KA[n]}).\n` +
    `დროის მასშტაბი: ${TIMESCALE_KA[t]}.\n\n` +
    `2-4 წინადადება (დაახ. 40-70 სიტყვა), "შენ"-ის ფორმა. ახსენი რა იგრძნობა ` +
    `დღეს ამ ტრანზიტით და ერთი კონკრეტული, პრაქტიკული რჩევა. ` +
    `title იყოს მოკლე, კონკრეტული და ქმედებაზე ან ცხოვრების სფეროზე მიბმული; ` +
    `არა აბსტრაქტული "სული/გული/შინაგანი" ფორმულირება.`
  );
}

function housePrompt(t, h) {
  const def = HOUSES[h];
  return (
    `დაწერე დღიური ტრანზიტის ინტერპრეტაცია: ტრანზიტული ${BODY_KA[t]} გადის ` +
    `ნატალურ ${def.labelKa}-ში (${def.themeKa}).\n` +
    `${BODY_KA[t]} — ${BODY_MEANING_KA[t]}. ${def.labelKa} — ${def.meaningKa}\n` +
    `დროის მასშტაბი: ${TIMESCALE_KA[t]}.\n\n` +
    `2-3 წინადადება (დაახ. 35-60 სიტყვა), "შენ"-ის ფორმა. რომელი ცხოვრების ` +
    `სფერო აქტიურდება და როგორ გამოიყენო ეს დღეს. title იყოს მოკლე, კონკრეტული ` +
    `და დასახელებულ ცხოვრების სფეროზე მიბმული.`
  );
}

function signPrompt(t, s) {
  return (
    `დაწერე დღიური ტრანზიტის ინტერპრეტაცია: ${BODY_KA[t]} ახლა ${SIGN_KA[s]}-შია — ` +
    `ეს ყველასთვის საერთო, კოლექტიური განწყობაა.\n` +
    `${BODY_KA[t]} — ${BODY_MEANING_KA[t]}. ${SIGN_KA[s]} — ${SIGN_NATURE_KA[s]}.\n` +
    `დროის მასშტაბი: ${TIMESCALE_KA[t]}.\n\n` +
    `2-3 წინადადება (დაახ. 35-60 სიტყვა), "შენ"-ის ფორმა. როგორი ემოციური/` +
    `ენერგეტიკული ფონია დღეს ამ განლაგებით და რას უწყობს ხელს. ` +
    `title იყოს მოკლე, კონკრეტული და ქმედებაზე მიბმული; არა ზოგადი მისტიკური ფორმულირება.`
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
    config: {
      systemInstruction: SYSTEM,
      temperature: 0.8,
      responseMimeType: "application/json",
    },
  });
  const raw = res.text?.trim();
  if (!raw) throw new Error("empty");
  const stripped = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  const parsed = JSON.parse(stripped);
  if (!parsed.title || !parsed.body) throw new Error("missing title/body");
  return { title: String(parsed.title).trim(), body: String(parsed.body).trim() };
}

function allCombos() {
  const out = [];
  for (const t of TRANSIT_BODIES) {
    for (const kind of ASPECT_KINDS) {
      for (const n of NATAL_POINTS) {
        out.push({ key: `aspect:${t}:${kind}:${n}`, kind: "aspect", transit: t, aspectKind: kind, subject: n, prompt: () => aspectPrompt(t, kind, n) });
      }
    }
    for (let h = 1; h <= 12; h++) {
      out.push({ key: `house:${t}:${h}`, kind: "house", transit: t, aspectKind: null, subject: String(h), prompt: () => housePrompt(t, h) });
    }
  }
  for (const t of SIGN_BODIES) {
    for (const s of SIGN_KEYS) {
      out.push({ key: `sign:${t}:${s}`, kind: "sign", transit: t, aspectKind: null, subject: s, prompt: () => signPrompt(t, s) });
    }
  }
  return out;
}

async function main() {
  if (!process.env.GOOGLE_CLOUD_PROJECT) throw new Error("GOOGLE_CLOUD_PROJECT missing");
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL missing");
  const sql = neon(process.env.DATABASE_URL);

  const existing = new Map(
    (await sql`SELECT key, edited FROM transit_interpretation_library`).map((r) => [r.key, r.edited])
  );

  const tasks = allCombos().filter((c) => {
    if (onlyKinds && !onlyKinds.includes(c.kind)) return false;
    if (onlyTransits && !onlyTransits.includes(c.transit)) return false;
    if (existing.get(c.key) === true) return false; // never touch human-edited rows
    if (existing.has(c.key) && !force) return false;
    return true;
  });

  console.log(`tasks: ${tasks.length} (force=${force}, model=${MODEL} via Vertex AI)`);
  let done = 0, ok = 0, fail = 0;

  async function worker(queue) {
    for (;;) {
      const t = queue.shift();
      if (!t) return;
      try {
        const { title, body } = await generate(t.prompt());
        await sql`
          INSERT INTO transit_interpretation_library (key, kind, transit, aspect_kind, subject, title, body, model)
          VALUES (${t.key}, ${t.kind}, ${t.transit}, ${t.aspectKind}, ${t.subject}, ${title}, ${body}, ${MODEL})
          ON CONFLICT (key) DO UPDATE
            SET title = EXCLUDED.title, body = EXCLUDED.body, model = EXCLUDED.model, updated_at = now()
          WHERE transit_interpretation_library.edited = false`;
        ok++;
      } catch (e) {
        fail++;
        console.log("FAIL", t.key, e.message);
      }
      done++;
      if (done % 25 === 0) console.log(`  ${done}/${tasks.length}…`);
    }
  }

  const queue = [...tasks];
  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker(queue)));
  console.log(`done: ${ok} written, ${fail} failed`);
}

main().catch((e) => { console.error(e.message); process.exit(1); });
