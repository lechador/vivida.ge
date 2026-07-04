// Seed the reusable per-aspect interpretation library (aspect_interpretation_library).
// Generates one rich Georgian text per (planetA, planetB, kind) — every possible
// major aspect between the 12 chart points — so the report reuses them across
// all users instead of a per-user AI call. One AI call per entry (Georgian is
// token-dense; batching truncates).
//
// Usage:
//   node scripts/seed-aspect-library.mjs                → fill only missing rows (330 total)
//   node scripts/seed-aspect-library.mjs --force         → also overwrite non-edited rows
//   node scripts/seed-aspect-library.mjs --kind=square,trine
//   node scripts/seed-aspect-library.mjs --body=sun,moon → only combos involving these bodies
//
// Reads OPENROUTER_API_KEY / DATABASE_URL from .env.local or the environment.

import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

try {
  for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
} catch {}

const KEY = process.env.OPENROUTER_API_KEY;
const MODEL = "google/gemini-3.1-pro-preview";
const CONCURRENCY = 5;
const force = process.argv.includes("--force");
const kindArg = process.argv.find((a) => a.startsWith("--kind="));
const onlyKinds = kindArg ? kindArg.slice("--kind=".length).split(",") : null;
const bodyArg = process.argv.find((a) => a.startsWith("--body="));
const onlyBodies = bodyArg ? bodyArg.slice("--body=".length).split(",") : null;

const BODIES = [
  "sun", "moon", "mercury", "venus", "mars", "jupiter",
  "saturn", "uranus", "neptune", "pluto", "ascendant", "midheaven",
];

const BODY_KA = {
  sun: "მზე", moon: "მთვარე", mercury: "მერკური", venus: "ვენერა", mars: "მარსი",
  jupiter: "იუპიტერი", saturn: "სატურნი", uranus: "ურანი", neptune: "ნეპტუნი",
  pluto: "პლუტონი", ascendant: "ამომავალი", midheaven: "ზენიტი",
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
  ascendant: "სოციალური ნიღაბი, პირველი შთაბეჭდილება",
  midheaven: "კარიერა, საზოგადოებრივი იმიჯი",
};

const KINDS = ["conjunction", "sextile", "square", "trine", "opposition"];
const KIND_KA = {
  conjunction: "შეერთება (conjunction)",
  sextile: "სექსტილი (sextile)",
  square: "კვადრატი (square)",
  trine: "ტრინი (trine)",
  opposition: "ოპოზიცია (opposition)",
};
const KIND_DYNAMIC_KA = {
  conjunction: "ორი ენერგია ერთმანეთში ერწყმის და ერთ ძალად მოქმედებს — არც კონფლიქტი, არც შვება, უბრალოდ შერწყმა, რომლის ხასიათი პლანეტებზეა დამოკიდებული.",
  sextile: "ორი ენერგია ბუნებრივად თანამშრომლობს — ადვილად ხელმისაწვდომი შესაძლებლობა, რომელიც მოქმედებას საჭიროებს გასააქტიურებლად.",
  square: "ორი ენერგია ერთმანეთს ეწინააღმდეგება — შინაგანი ხახუნი და დაძაბულობა, რომელიც ზრდის ყველაზე ძლიერი წყაროა, თუმცა თავიდან რთულად იგრძნობა.",
  trine: "ორი ენერგია ჰარმონიულად და ბუნებრივად მიედინება — ნიჭი და სიმარტივე, რომელიც ხანდახან თვითკმაყოფილებაშიც შეიძლება გადაიზარდოს.",
  opposition: "ორი ენერგია ერთმანეთის საპირისპირო პოლუსზეა — ცნობიერების საჭიროება ბალანსის საპოვნელად ორ უკიდურესობას შორის.",
};

const SYSTEM =
  'შენ ხარ გამოცდილი ქართველი ასტროლოგი და მწერალი. წერ ბუნებრივ, მდიდარ, ' +
  'ლიტერატურულ ქართულად — გრამატიკულად უნაკლო, ცოცხალი და კონკრეტული. ' +
  'თავიდან აიცილე თარგმანის სტილი, გამეორებები და კლიშეები ("ვარსკვლავები გელიან").';

function prompt(a, b, kind) {
  const aLabel = BODY_KA[a], bLabel = BODY_KA[b];
  return (
    `დაწერე ნატალური ასპექტის ინტერპრეტაცია: "${aLabel} ${KIND_KA[kind]} ${bLabel}".\n` +
    `${aLabel} — ${BODY_MEANING_KA[a]}. ${bLabel} — ${BODY_MEANING_KA[b]}.\n` +
    `ამ ასპექტის ბუნება: ${KIND_DYNAMIC_KA[kind]}\n\n` +
    `6-8 წინადადება (დაახ. 130-170 სიტყვა), "შენ"-ის ფორმა, თბილი და კონკრეტული. ` +
    `ახსენი: როგორ ერწყმის/ეჯახება ეს ორი ენერგია ერთმანეთს ცხოვრებაში, ` +
    `ერთი კონკრეტული ხელშესახები მაგალითი, და ერთი პრაქტიკული რჩევა ამ ` +
    `დინამიკასთან სამუშაოდ. დააბრუნე მხოლოდ ტექსტი — სათაურის, ` +
    `ფორმატირების და ფრჩხილების გარეშე.`
  );
}

async function generate(a, b, kind) {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${KEY}`,
      "HTTP-Referer": "https://vivida.ge",
      "X-Title": "Vivida aspect library seed",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: prompt(a, b, kind) },
      ],
      temperature: 0.8,
      // gemini-3.1-pro always reasons; give the answer room beyond the
      // thinking budget so it isn't truncated.
      max_tokens: 12000,
    }),
  });
  if (!res.ok) throw new Error(`OpenRouter ${res.status}: ${(await res.text()).slice(0, 200)}`);
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

  const kinds = KINDS.filter((k) => !onlyKinds || onlyKinds.includes(k));

  // Existing rows → decide what to (re)generate without wasting AI calls.
  const existing = new Map(
    (await sql`SELECT key, edited FROM aspect_interpretation_library`).map((r) => [r.key, r.edited])
  );

  const tasks = [];
  for (let i = 0; i < BODIES.length; i++) {
    for (let j = i + 1; j < BODIES.length; j++) {
      const [a, b] = [BODIES[i], BODIES[j]].sort();
      if (onlyBodies && !onlyBodies.includes(a) && !onlyBodies.includes(b)) continue;
      for (const kind of kinds) {
        const key = `${a}-${b}-${kind}`;
        const edited = existing.get(key) === true;
        if (edited) continue; // never touch human-edited rows
        if (existing.has(key) && !force) continue; // already present, not forcing
        tasks.push({ a, b, kind, key });
      }
    }
  }

  console.log(`tasks: ${tasks.length} (force=${force}, model=${MODEL})`);
  let done = 0, ok = 0, fail = 0;

  async function worker(queue) {
    for (;;) {
      const t = queue.shift();
      if (!t) return;
      try {
        const body = await generate(t.a, t.b, t.kind);
        await sql`
          INSERT INTO aspect_interpretation_library (key, planet_a, planet_b, kind, body, model)
          VALUES (${t.key}, ${t.a}, ${t.b}, ${t.kind}, ${body}, ${MODEL})
          ON CONFLICT (key) DO UPDATE
            SET body = EXCLUDED.body, model = EXCLUDED.model, updated_at = now()
          WHERE aspect_interpretation_library.edited = false`;
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
