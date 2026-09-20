// Seed the reusable per-house interpretation library (house_interpretation_library).
// A house's meaning depends on BOTH its cusp sign AND which planets occupy it, so
// it's decomposed into two reusable, finite pieces:
//   - "cusp"     — (house, sign): 12 houses × 12 signs = 144 combos
//   - "occupant" — (house, planet): 12 houses × 11 planets = 132 combos
// Total 276. One AI call per entry (Georgian is token-dense; batching truncates).
//
// Uses Vertex AI Gemini (not OpenRouter) via the existing GCP project set up
// for Veo video generation — auth via local ADC (`gcloud auth
// application-default login`), no API key needed. Only for this local,
// one-time bulk seed; the live in-app self-heal fallback (lib/house-library.ts)
// still uses OpenRouter since Vertex ADC isn't available in the deployed
// serverless environment.
//
// Usage:
//   node scripts/seed-house-library.mjs                 → fill only missing rows (276 total)
//   node scripts/seed-house-library.mjs --force          → also overwrite non-edited rows
//   node scripts/seed-house-library.mjs --kind=cusp
//   node scripts/seed-house-library.mjs --house=1,4,7,10 → only these house numbers
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
const CONCURRENCY = 5;
const force = process.argv.includes("--force");
const kindArg = process.argv.find((a) => a.startsWith("--kind="));
const onlyKinds = kindArg ? kindArg.slice("--kind=".length).split(",") : null;
const houseArg = process.argv.find((a) => a.startsWith("--house="));
const onlyHouses = houseArg
  ? houseArg.slice("--house=".length).split(",").map(Number)
  : null;

const HOUSE_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const HOUSES = {
  1: {
    labelKa: "1-ლი სახლი",
    themeKa: "ჩემი თავი",
    meaningKa:
      "ის, თუ როგორ შემოდიხარ ოთახში — შენი თვითპრეზენტაცია და პირველი შთაბეჭდილება.",
  },
  2: {
    labelKa: "მე-2 სახლი",
    themeKa: "ჩემი რესურსები",
    meaningKa: "შენი რესურსები, თვითშეფასება და ის, რაც ცხოვრებაში ფასობს.",
  },
  3: {
    labelKa: "მე-3 სახლი",
    themeKa: "კომუნიკაცია",
    meaningKa: "ყოველდღიური აზროვნება, საუბრები, უახლოესი გარემო და სწავლა.",
  },
  4: {
    labelKa: "მე-4 სახლი",
    themeKa: "სახლი, ოჯახი",
    meaningKa: "ემოციური საფუძველი, ოჯახი, ფესვები და პირადი სივრცე.",
  },
  5: {
    labelKa: "მე-5 სახლი",
    themeKa: "სიხარული, რომანი",
    meaningKa:
      "სიხარული, თვითგამოხატვა, რომანტიკული თამაში და შემოქმედებითი პროექტები.",
  },
  6: {
    labelKa: "მე-6 სახლი",
    themeKa: "საქმე, სხეული",
    meaningKa:
      "ყოველდღიური რუტინა, სამსახური, ჯანმრთელობა და სხვებისთვის სამსახური.",
  },
  7: {
    labelKa: "მე-7 სახლი",
    themeKa: "მე და შენ",
    meaningKa:
      "ერთ-ერთი ადამიანი, ვისთანაც ცხოვრობ — სასიყვარულო, საქმიანი ან მოწინააღმდეგე.",
  },
  8: {
    labelKa: "მე-8 სახლი",
    themeKa: "ტრანსფორმაცია",
    meaningKa:
      "ღრმა ცვლილებები, საერთო რესურსები, ფსიქოლოგიური სიღრმე და ინტიმი.",
  },
  9: {
    labelKa: "მე-9 სახლი",
    themeKa: "მსოფლმხედველობა",
    meaningKa:
      "უმაღლესი სწავლა, შორი მოგზაურობა, რწმენა და ცხოვრებისეული შეხედულებები.",
  },
  10: {
    labelKa: "მე-10 სახლი",
    themeKa: "კარიერა, სტატუსი",
    meaningKa:
      "ის, რითაც გცნობენ საზოგადოებაში — კარიერა, ავტორიტეტი, წარმატება.",
  },
  11: {
    labelKa: "მე-11 სახლი",
    themeKa: "თემი, მიზნები",
    meaningKa: "შენი წრე, თემი, იმედები მომავლისადმი და გრძელვადიანი მიზნები.",
  },
  12: {
    labelKa: "მე-12 სახლი",
    themeKa: "ფარული სამყარო",
    meaningKa:
      "ფარული სამყარო, ოცნებები, სულიერება, ის, რასაც ღიად ვერ ვაჩვენებთ.",
  },
};

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

const PLANET_KA = {
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
  chiron: "ქირონი",
};
const PLANET_MEANING_KA = {
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
};
const PLANET_KEYS = Object.keys(PLANET_KA);

const SYSTEM =
  "შენ ხარ გამოცდილი ქართველი ასტროლოგი და მწერალი. წერ ბუნებრივ, მდიდარ, " +
  "ლიტერატურულ ქართულად — გრამატიკულად უნაკლო, ცოცხალი და კონკრეტული. " +
  'თავიდან აიცილე თარგმანის სტილი, გამეორებები და კლიშეები ("ვარსკვლავები გელიან").';

function cuspPrompt(house, sign) {
  const def = HOUSES[house];
  const signLabel = SIGN_KA[sign];
  return (
    `დაწერე ინტერპრეტაცია: "${def.labelKa} (${def.themeKa}) — კუსპი ${signLabel}-ში".\n` +
    `ეს სახლი მართავს: ${def.meaningKa}\n` +
    `${signLabel} — ${SIGN_NATURE_KA[sign]}.\n\n` +
    `5-7 წინადადება (დაახ. 110-150 სიტყვა), "შენ"-ის ფორმა, თბილი და კონკრეტული. ` +
    `ახსენი, როგორ ფერავს ${signLabel}-ის ბუნება ამ კონკრეტულ ცხოვრების სფეროს — ` +
    `ერთი ცოცხალი მაგალითით. დააბრუნე მხოლოდ ტექსტი — სათაურის, ` +
    `ფორმატირების და ფრჩხილების გარეშე.`
  );
}

function occupantPrompt(house, planet) {
  const def = HOUSES[house];
  const planetLabel = PLANET_KA[planet];
  return (
    `დაწერე ინტერპრეტაცია: "${planetLabel} ${def.labelKa}-ში (${def.themeKa})".\n` +
    `ეს სახლი მართავს: ${def.meaningKa}\n` +
    `${planetLabel} — ${PLANET_MEANING_KA[planet]}.\n\n` +
    `5-7 წინადადება (დაახ. 110-150 სიტყვა), "შენ"-ის ფორმა, თბილი და კონკრეტული. ` +
    `ახსენი, როგორ გამოხატავს ${planetLabel}-ის ენერგია თავს კონკრეტულად ამ ` +
    `ცხოვრების სფეროში — ერთი ცოცხალი მაგალითით. დააბრუნე მხოლოდ ტექსტი — ` +
    `სათაურის, ფორმატირების და ფრჩხილების გარეშე.`
  );
}

const ai = new GoogleGenAI({
  vertexai: true,
  project: process.env.GOOGLE_CLOUD_PROJECT,
  location: "global",
});

async function generate(prompt) {
  const res = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      thinkingConfig: { thinkingLevel: "LOW" },
      systemInstruction: SYSTEM,
      temperature: 0.8,
    },
  });
  const body = res.text?.trim();
  if (!body) throw new Error("empty");
  return body;
}

async function main() {
  if (!process.env.GOOGLE_CLOUD_PROJECT)
    throw new Error("GOOGLE_CLOUD_PROJECT missing");
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL missing");
  const sql = neon(process.env.DATABASE_URL);

  const kinds = ["cusp", "occupant"].filter(
    (k) => !onlyKinds || onlyKinds.includes(k),
  );
  const houses = HOUSE_NUMBERS.filter(
    (h) => !onlyHouses || onlyHouses.includes(h),
  );

  const existing = new Map(
    (await sql`SELECT key, edited FROM house_interpretation_library`).map(
      (r) => [r.key, r.edited],
    ),
  );

  const tasks = [];
  for (const house of houses) {
    if (kinds.includes("cusp")) {
      for (const sign of SIGN_KEYS) {
        const key = `cusp:${house}:${sign}`;
        if (existing.get(key) === true) continue; // never touch human-edited rows
        if (existing.has(key) && !force) continue;
        tasks.push({ kind: "cusp", house, subject: sign, key });
      }
    }
    if (kinds.includes("occupant")) {
      for (const planet of PLANET_KEYS) {
        const key = `occupant:${house}:${planet}`;
        if (existing.get(key) === true) continue;
        if (existing.has(key) && !force) continue;
        tasks.push({ kind: "occupant", house, subject: planet, key });
      }
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
        const prompt =
          t.kind === "cusp"
            ? cuspPrompt(t.house, t.subject)
            : occupantPrompt(t.house, t.subject);
        const body = await generate(prompt);
        await sql`
          INSERT INTO house_interpretation_library (key, kind, house, subject, body, model)
          VALUES (${t.key}, ${t.kind}, ${t.house}, ${t.subject}, ${body}, ${MODEL})
          ON CONFLICT (key) DO UPDATE
            SET body = EXCLUDED.body, model = EXCLUDED.model, updated_at = now()
          WHERE house_interpretation_library.edited = false`;
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

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
