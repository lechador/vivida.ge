// Seed the synastry (compatibility) interpretation library
// (synastry_interpretation_library). Two finite, reusable kinds:
//   - "aspect"  — one person's planet in aspect to the other's:
//                 (C(13,2)+13 same-body) pairs × 5 kinds = 455 combos
//   - "overlay" — one person's planet in the other's house: 13 × 12 = 156
// Total 611. One AI call per entry (Georgian is token-dense; batching truncates).
//
// All text is DIRECTION-NEUTRAL („ერთის“/„მეორის“/„წყვილი“ — never „შენი“/„მისი“)
// because the same row serves both directions of a pair.
//
// Uses Vertex AI Gemini via the existing GCP project (ADC auth), same as the
// house/transit library seeds. Skips existing rows unless --force; never
// touches human-edited rows.
//
// Usage:
//   node scripts/seed-synastry-library.mjs                → fill missing rows
//   node scripts/seed-synastry-library.mjs --force        → overwrite non-edited
//   node scripts/seed-synastry-library.mjs --kind=aspect  → only one kind
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

// ── Georgian vocabulary (mirrors lib/synastry-interpretation.ts labels) ──────
const BODY_KA = {
  sun: "მზე", moon: "მთვარე", mercury: "მერკური", venus: "ვენერა",
  mars: "მარსი", jupiter: "იუპიტერი", saturn: "სატურნი", uranus: "ურანი",
  neptune: "ნეპტუნი", pluto: "პლუტონი", chiron: "ქირონი",
  ascendant: "ასცენდენტი", midheaven: "MC (ზენიტი)",
};
const BODY_MEANING_KA = {
  sun: "იდენტობა, ეგო, სასიცოცხლო ენერგია",
  moon: "ემოციები, მოთხოვნილებები, უსაფრთხოების განცდა",
  mercury: "აზროვნება, კომუნიკაცია, ენა",
  venus: "სიყვარული, მიზიდულობა, ღირებულებები",
  mars: "ვნება, ენერგია, ბრძოლისუნარიანობა",
  jupiter: "ზრდა, ოპტიმიზმი, გულუხვობა",
  saturn: "სტრუქტურა, ვალდებულება, გაკვეთილები",
  uranus: "თავისუფლება, სიახლე, ელექტრობა",
  neptune: "ოცნება, ინტუიცია, იდეალიზაცია",
  pluto: "ინტენსივობა, ძალაუფლება, გარდასახვა",
  chiron: "შინაგანი ჭრილობა და განკურნების უნარი",
  ascendant: "გარეგნული „მე“, პირველი შთაბეჭდილება",
  midheaven: "მიზნები, კარიერა, საჯარო გზა",
};
const BODY_KEYS = Object.keys(BODY_KA);

const KIND_KA = {
  conjunction: { label: "შეერთება", nature: "ძლიერი შერწყმა — ორი ენერგია ერთ წერტილში ერთიანდება" },
  sextile: { label: "სექსტილი", nature: "მსუბუქი ჰარმონია — შესაძლებლობა, რომელიც ცოტა ძალისხმევას ითხოვს" },
  square: { label: "კვადრატი", nature: "დაძაბულობა და ხახუნი — მაგრამ ზრდის მთავარი ძრავა" },
  trine: { label: "ტრიგონი", nature: "ბუნებრივი, უპრობლემო დინება ორ ენერგიას შორის" },
  opposition: { label: "ოპოზიცია", nature: "პოლარობა — მიზიდულობაც და დაპირისპირებაც, ბალანსის ძიება" },
};
const ASPECT_KINDS = Object.keys(KIND_KA);

const HOUSE_KA = {
  1: { label: "1-ლი სახლი", theme: "პირადი იდენტობა, გარეგნული „მე“" },
  2: { label: "მე-2 სახლი", theme: "ღირებულებები, რესურსები, სტაბილურობა" },
  3: { label: "მე-3 სახლი", theme: "კომუნიკაცია, ყოველდღიური აზროვნება" },
  4: { label: "მე-4 სახლი", theme: "სახლი, ოჯახი, ემოციური ფესვები" },
  5: { label: "მე-5 სახლი", theme: "რომანი, სიხარული, შემოქმედება" },
  6: { label: "მე-6 სახლი", theme: "ყოველდღიურობა, რუტინა, ზრუნვა" },
  7: { label: "მე-7 სახლი", theme: "პარტნიორობა, ერთგულება" },
  8: { label: "მე-8 სახლი", theme: "სიღრმე, ინტიმი, გარდასახვა" },
  9: { label: "მე-9 სახლი", theme: "ჰორიზონტები, რწმენა, მოგზაურობა" },
  10: { label: "მე-10 სახლი", theme: "კარიერა, საჯარო გზა, ამბიცია" },
  11: { label: "მე-11 სახლი", theme: "მეგობრობა, თემი, საერთო ოცნებები" },
  12: { label: "მე-12 სახლი", theme: "შინაგანი სამყარო, ფარული კავშირი" },
};

const SYSTEM =
  "შენ ხარ გამოცდილი ქართველი ასტროლოგი და მწერალი, სინასტრიის (წყვილთა " +
  "თავსებადობის) სპეციალისტი. წერ ბუნებრივ, მდიდარ, ლიტერატურულ ქართულად — " +
  "გრამატიკულად უნაკლო, ცოცხალი და კონკრეტული. აუცილებელი წესი: ტექსტი " +
  "მიმართულების მიმართ ნეიტრალურია — არასდროს წერ „შენი“/„მისი“, მხოლოდ " +
  "„ერთის“/„მეორის“ ან „წყვილის“. თავიდან აიცილე თარგმანის სტილი და კლიშეები " +
  '("ვარსკვლავები გელიან", "მიენდე სამყაროს").';

function aspectPrompt(a, b, kind) {
  const k = KIND_KA[kind];
  const pair =
    a === b
      ? `ერთის ${BODY_KA[a]} მეორის ${BODY_KA[b]}-თან`
      : `ერთის ${BODY_KA[a]} მეორის ${BODY_KA[b]}-თან (მნიშვნელობა სიმეტრიულია — შეიძლება პირიქითაც)`;
  return (
    `დაწერე სინასტრიის (წყვილის თავსებადობის) ინტერპრეტაცია: ${pair} ${k.label}-შია.\n` +
    `${BODY_KA[a]} — ${BODY_MEANING_KA[a]}. ${BODY_KA[b]} — ${BODY_MEANING_KA[b]}.\n` +
    `${k.label}: ${k.nature}.\n\n` +
    "მოთხოვნები:\n" +
    "- 2 აბზაცი, ჯამში 70–110 სიტყვა.\n" +
    "- პირველი აბზაცი: რა დინამიკას ქმნის ეს კავშირი წყვილში — კონკრეტულად, ერთი ცხოვრებისეული მაგალითით.\n" +
    "- მეორე აბზაცი: რჩევა — როგორ გამოიყენონ (თუ ჰარმონიულია) ან როგორ დაარბილონ (თუ დაძაბულია).\n" +
    "- მიმართულების მიმართ ნეიტრალური ენა („ერთის“, „მეორის“, „წყვილი“).\n" +
    "- დააბრუნე მხოლოდ ტექსტი — სათაურის, ფორმატირების და ფრჩხილების გარეშე."
  );
}

function overlayPrompt(body, house) {
  const h = HOUSE_KA[house];
  return (
    `დაწერე სინასტრიის ინტერპრეტაცია: ერთის ${BODY_KA[body]} ხვდება მეორის ${h.label}-ში (${h.theme}).\n` +
    `${BODY_KA[body]} — ${BODY_MEANING_KA[body]}.\n\n` +
    "მოთხოვნები:\n" +
    "- 1 აბზაცი, 45–70 სიტყვა.\n" +
    "- რას ააქტიურებს ეს პლანეტა მასპინძლის ცხოვრების ამ სფეროში და როგორ იგრძნობა ეს ორივესთვის.\n" +
    "- მიმართულების მიმართ ნეიტრალური ენა („ერთის“, „მეორის“, „წყვილი“).\n" +
    "- დააბრუნე მხოლოდ ტექსტი — სათაურის, ფორმატირების და ფრჩხილების გარეშე."
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

  const kinds = ["aspect", "overlay"].filter((k) => !onlyKinds || onlyKinds.includes(k));
  const existing = new Map(
    (await sql`SELECT key, edited FROM synastry_interpretation_library`).map((r) => [r.key, r.edited])
  );

  const tasks = [];
  if (kinds.includes("aspect")) {
    for (let i = 0; i < BODY_KEYS.length; i++) {
      for (let j = i; j < BODY_KEYS.length; j++) {
        for (const kind of ASPECT_KINDS) {
          const [a, b] = [BODY_KEYS[i], BODY_KEYS[j]].sort();
          const key = `aspect:${a}-${b}-${kind}`;
          if (existing.get(key) === true) continue; // never touch human-edited rows
          if (existing.has(key) && !force) continue;
          tasks.push({ kind: "aspect", a, b, aspectKind: kind, key });
        }
      }
    }
  }
  if (kinds.includes("overlay")) {
    for (const body of BODY_KEYS) {
      for (let house = 1; house <= 12; house++) {
        const key = `overlay:${body}-${house}`;
        if (existing.get(key) === true) continue;
        if (existing.has(key) && !force) continue;
        tasks.push({ kind: "overlay", a: body, house, key });
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
        const prompt =
          t.kind === "aspect" ? aspectPrompt(t.a, t.b, t.aspectKind) : overlayPrompt(t.a, t.house);
        const body = await generate(prompt);
        await sql`
          INSERT INTO synastry_interpretation_library
            (key, kind, planet_a, planet_b, aspect_kind, house, body, model)
          VALUES (${t.key}, ${t.kind}, ${t.a}, ${t.b ?? null}, ${t.aspectKind ?? null},
                  ${t.house ?? null}, ${body}, ${MODEL})
          ON CONFLICT (key) DO UPDATE
            SET body = EXCLUDED.body, model = EXCLUDED.model, updated_at = now()
          WHERE synastry_interpretation_library.edited = false`;
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
