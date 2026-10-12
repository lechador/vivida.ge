// Seed the reusable per-placement interpretation library (interpretation_library).
// Generates one rich Georgian text per (subject, sign), Big Three + planets in
// each sign, so the report reuses them across all users instead of a per-user
// AI call. One AI call per entry (Georgian is token-dense; batching truncates).
//
// Usage:
//   node scripts/seed-interpretation-library.mjs            → fill only missing rows
//   node scripts/seed-interpretation-library.mjs --force    → also overwrite non-edited rows
//   node scripts/seed-interpretation-library.mjs --only=venus,mars
//
// Reads OPENROUTER_API_KEY / DATABASE_URL from .env.local or the environment.

import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

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

const KEY = process.env.OPENROUTER_API_KEY;
const MODEL = "google/gemini-3.8-flash";
const CONCURRENCY = 5;
const force = process.argv.includes("--force");
const onlyArg = process.argv.find((a) => a.startsWith("--only="));
const only = onlyArg ? onlyArg.slice("--only=".length).split(",") : null;

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
const SIGN_KEYS = Object.keys(SIGN_KA);

const SUBJECT_KA = {
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
  ascendant: "ამომავალი ნიშანი",
};
const SUBJECT_DOMAIN_KA = {
  sun: "ბირთვი, იდენტობა, სასიცოცხლო ენერგია და თვითგამოხატვა",
  moon: "ემოციები, შინაგანი სამყარო და რა გაძლევს უსაფრთხოებას",
  mercury: "აზროვნება, კომუნიკაცია, სწავლა და გადაწყვეტილებები",
  venus: "სიყვარული, ფასეულობები, ესთეტიკა და ურთიერთობების სტილი",
  mars: "მოქმედება, ენერგია, სურვილი და როგორ იცავ თავს",
  jupiter: "ზრდა, იღბალი, რწმენა და სად ეძებ აზრს",
  saturn: "დისციპლინა, პასუხისმგებლობა, საზღვრები და ცხოვრებისეული გაკვეთილები",
  uranus: "ცვლილება, ორიგინალურობა, თავისუფლება და მოულოდნელობა",
  neptune: "ოცნება, ინტუიცია, სულიერება და შემოქმედებითი წარმოსახვა",
  pluto: "ღრმა ტრანსფორმაცია, ძალა, კონტროლი და აღორძინება",
  ascendant:
    "პირველი შთაბეჭდილება, როგორ აღგიქვამენ სხვები პირველი შეხვედრისას",
};

const SYSTEM =
  "შენ ხარ გამოცდილი ქართველი ასტროლოგი და მწერალი. წერ ბუნებრივ, მდიდარ, " +
  "ლიტერატურულ ქართულად, გრამატიკულად უნაკლო, ცოცხალი და კონკრეტული. " +
  'თავიდან აიცილე თარგმანის სტილი, გამეორებები და კლიშეები ("ვარსკვლავები გელიან").';

function prompt(subject, sign) {
  const placementKa =
    subject === "ascendant"
      ? `ამომავალი ნიშანი ${SIGN_KA[sign]}`
      : `${SUBJECT_KA[subject]} ${SIGN_KA[sign]}-ში`;
  return (
    `დაწერე "${placementKa}"-ს ინტერპრეტაცია (თემა: ${SUBJECT_DOMAIN_KA[subject]}).\n` +
    `6-8 წინადადება (დაახ. 130-170 სიტყვა), "შენ"-ის ფორმა, თბილი და კონკრეტული. ` +
    `ჩაურთე ამ მდებარეობის ძლიერი მხარეც და გამოწვევაც, ცოცხალი მაგალითებით. ` +
    `დააბრუნე მხოლოდ ტექსტი, სათაურის, ფორმატირების და ფრჩხილების გარეშე.`
  );
}

async function generate(subject, sign) {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${KEY}`,
      "HTTP-Referer": "https://vivida.ge",
      "X-Title": "Vivida interpretation library seed",
    },
    body: JSON.stringify({
      model: MODEL,
      reasoning: { effort: "low" },
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: prompt(subject, sign) },
      ],
      temperature: 0.8,
      // Give the answer room beyond the
      // thinking budget so it isn't truncated.
      max_tokens: 12000,
    }),
  });
  if (!res.ok)
    throw new Error(
      `OpenRouter ${res.status}: ${(await res.text()).slice(0, 200)}`,
    );
  const json = await res.json();
  if (json.error) throw new Error(`OpenRouter: ${json.error.message}`);
  const body = json.choices?.[0]?.message?.content?.trim();
  if (!body) throw new Error("empty");
  return body;
}

async function main() {
  if (!KEY) throw new Error("OPENROUTER_API_KEY missing");
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL missing");
  const sql = neon(process.env.DATABASE_URL);

  const subjects = Object.keys(SUBJECT_KA).filter(
    (s) => !only || only.includes(s),
  );

  // Existing rows → decide what to (re)generate without wasting AI calls.
  const existing = new Map(
    (await sql`SELECT key, edited FROM interpretation_library`).map((r) => [
      r.key,
      r.edited,
    ]),
  );
  const tasks = [];
  for (const subject of subjects) {
    for (const sign of SIGN_KEYS) {
      const key = `${subject}:${sign}`;
      const ex = existing.has(key);
      const edited = existing.get(key) === true;
      if (edited) continue; // never touch human-edited rows
      if (ex && !force) continue; // already present, not forcing
      tasks.push({ subject, sign, key });
    }
  }

  console.log(`tasks: ${tasks.length} (force=${force}, model=${MODEL})`);
  let done = 0,
    ok = 0,
    fail = 0;

  async function worker(queue) {
    for (;;) {
      const t = queue.shift();
      if (!t) return;
      try {
        const body = await generate(t.subject, t.sign);
        await sql`
          INSERT INTO interpretation_library (key, subject, sign, body, model)
          VALUES (${t.key}, ${t.subject}, ${t.sign}, ${body}, ${MODEL})
          ON CONFLICT (key) DO UPDATE
            SET body = EXCLUDED.body, model = EXCLUDED.model, updated_at = now()
          WHERE interpretation_library.edited = false`;
        ok++;
      } catch (e) {
        fail++;
        console.log("FAIL", t.key, e.message);
      }
      done++;
      if (done % 10 === 0) console.log(`  ${done}/${tasks.length}…`);
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
