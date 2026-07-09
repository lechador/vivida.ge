// Grammar/orthography proofread of the user-facing MBTI library rows — the type
// portraits and the 7 profile sections (strengths, weaknesses, romantic,
// friendship, career, workplace, growth). One gemini-2.5-pro call per row,
// preserving meaning AND format (**bold** list markers, paragraph breaks,
// "შენ"-form). Skips admin-edited rows. The type_sun astro-fusion rows are
// excluded — they're no longer used by the (now psychology-focused) synthesis.
//
// Usage: node scripts/proofread-mbti-library.mjs [--force]
//   --force also reproofreads edited rows.

import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";
import { GoogleGenAI } from "@google/genai";

for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const MODEL = "gemini-2.5-pro";
const CONCURRENCY = 5;
const force = process.argv.includes("--force");
const KINDS = ["type", "strengths", "weaknesses", "romantic", "friendship", "career", "workplace", "growth"];

const SYSTEM =
  "შენ ხარ ქართული ენის პროფესიონალი კორექტორი. გისწორებ ტექსტს მხოლოდ გრამატიკულად, " +
  "ორთოგრაფიულად და სტილისტურად — ბუნებრივ, გამართულ ქართულამდე. მკაცრი წესები: " +
  "(1) არ შეცვალო აზრი, ინფორმაცია და ტონი; (2) ზუსტად შეინარჩუნე ფორმატი — თუ არის " +
  "**მუქი სათაურები**, დატოვე **ვარსკვლავები**; შეინარჩუნე ხაზები და აბზაცები; " +
  "(3) შეინარჩუნე „შენ“-ის მიმართვის ფორმა; (4) არ დაამატო ან წაშალო აბზაცი. " +
  "დააბრუნე მხოლოდ გასწორებული ტექსტი, ყოველგვარი კომენტარის გარეშე.";

const ai = new GoogleGenAI({
  vertexai: true,
  project: process.env.GOOGLE_CLOUD_PROJECT,
  location: process.env.GOOGLE_CLOUD_LOCATION || "us-central1",
});

async function proofread(text) {
  const res = await ai.models.generateContent({
    model: MODEL,
    contents: "გაასწორე შემდეგი ტექსტი:\n\n" + text,
    config: { systemInstruction: SYSTEM, temperature: 0.2 },
  });
  const out = (res.text ?? "").trim();
  if (!out) throw new Error("empty");
  return out;
}

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL missing");
  if (!process.env.GOOGLE_CLOUD_PROJECT) throw new Error("GOOGLE_CLOUD_PROJECT missing");
  const sql = neon(process.env.DATABASE_URL);

  const rows = force
    ? await sql`SELECT key, body FROM mbti_interpretation_library WHERE kind = ANY(${KINDS})`
    : await sql`SELECT key, body FROM mbti_interpretation_library WHERE kind = ANY(${KINDS}) AND edited = false`;

  console.log(`proofreading ${rows.length} rows (model=${MODEL})`);
  let done = 0, changed = 0, fail = 0;
  const queue = [...rows];

  async function worker() {
    for (;;) {
      const r = queue.shift();
      if (!r) return;
      try {
        const fixed = await proofread(r.body);
        if (fixed !== r.body) {
          // The SELECT already scoped to eligible rows (non-edited unless
          // --force), so a plain key-update is correct here.
          await sql`UPDATE mbti_interpretation_library
                    SET body = ${fixed}, updated_at = now()
                    WHERE key = ${r.key}`;
          changed++;
        }
      } catch (e) {
        fail++;
        console.log("FAIL", r.key, e.message);
      }
      done++;
      if (done % 20 === 0) console.log(`  ${done}/${rows.length}…`);
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));
  console.log(`done: ${changed} changed, ${fail} failed, ${rows.length} total`);
}

main().catch((e) => { console.error(e.message); process.exit(1); });
