// Proofread the 60 Astro-MBTI questions for Georgian grammar/orthography.
// Sends the whole set to gemini-3.8-flash (Vertex, Google credits) with a strict
// "fix grammar only, preserve meaning + agree-direction" instruction, then
// writes any corrections to mbti_question and prints every change so the static
// source (lib/mbti-questions.ts) can be synced to match.
//
// Usage: node --import tsx scripts/proofread-mbti-questions.mjs [--write]
//   (default prints diffs only; --write also updates the DB)

import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";
import { GoogleGenAI } from "@google/genai";

for (const line of readFileSync(
  new URL("../.env.local", import.meta.url),
  "utf8",
).split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]])
    process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const { MBTI_QUESTIONS } = await import("../lib/mbti-questions.ts");
const write = process.argv.includes("--write");

const SYSTEM =
  "შენ ხარ ქართული ენის პროფესიონალი კორექტორი. გისწორებ პიროვნების ტესტის დებულებებს " +
  "მხოლოდ გრამატიკულად, ორთოგრაფიულად და სტილისტურად. აუცილებელი წესები: (1) არ შეცვალო " +
  "წინადადების აზრი და ის, თუ რომელ პოლუსს ეთანხმება; (2) შეინარჩუნე „მე“-ს პირველი პირი; " +
  "(3) გახადე ბუნებრივი და გამართული, მაგრამ მოკლე; (4) თუ წინადადება უკვე გამართულია, " +
  'დააბრუნე უცვლელად. დააბრუნე მხოლოდ ვალიდური JSON მასივი: [{"id": number, "text": string}].';

const ai = new GoogleGenAI({
  vertexai: true,
  project: process.env.GOOGLE_CLOUD_PROJECT,
  location: "global",
});

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL missing");
  if (!process.env.GOOGLE_CLOUD_PROJECT)
    throw new Error("GOOGLE_CLOUD_PROJECT missing");

  const input = MBTI_QUESTIONS.map((q) => ({ id: q.id, text: q.textKa }));
  const res = await ai.models.generateContent({
    model: "gemini-3.8-flash",
    contents: "გაასწორე ეს დებულებები:\n" + JSON.stringify(input, null, 2),
    config: {
      thinkingConfig: { thinkingLevel: "LOW" },
      systemInstruction: SYSTEM,
      temperature: 0.2,
      responseMimeType: "application/json",
    },
  });
  const raw = (res.text ?? "")
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");
  const corrected = JSON.parse(raw);
  const byId = new Map(corrected.map((c) => [c.id, String(c.text).trim()]));

  const sql = neon(process.env.DATABASE_URL);
  let changed = 0;
  for (const q of MBTI_QUESTIONS) {
    const fixed = byId.get(q.id);
    if (!fixed || fixed === q.textKa) continue;
    changed++;
    console.log(`\n#${q.id}`);
    console.log(`  - ${q.textKa}`);
    console.log(`  + ${fixed}`);
    if (write) {
      await sql`UPDATE mbti_question SET text_ka = ${fixed}, updated_at = now()
                WHERE id = ${q.id} AND edited = false`;
    }
  }
  console.log(
    `\n${changed} of ${MBTI_QUESTIONS.length} changed${write ? " (written to DB)" : " (dry run)"}.`,
  );
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
