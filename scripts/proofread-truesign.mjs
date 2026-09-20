// Proofread the "true zodiac sign" quiz copy — questions, answer options and
// the 12 sign blurbs — for Georgian grammar/orthography/naturalness. Sends
// everything to gemini-3.8-flash (Vertex) with a strict "fix language only,
// preserve meaning + the element/modality it points to" instruction and prints
// every change so the static source (lib/true-sign/quiz.ts) can be synced.
//
// Usage: node --import tsx scripts/proofread-truesign.mjs

import { readFileSync } from "node:fs";
import { GoogleGenAI } from "@google/genai";

for (const line of readFileSync(
  new URL("../.env.local", import.meta.url),
  "utf8",
).split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]])
    process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const { TS_QUESTIONS, TS_SIGN_BLURB } =
  await import("../lib/true-sign/quiz.ts");

const items = [];
for (const q of TS_QUESTIONS) {
  items.push({ key: `q-${q.id}`, text: q.textKa });
  q.options.forEach((opt, i) =>
    items.push({ key: `q-${q.id}-o-${i}`, text: opt.textKa }),
  );
}
for (const [sign, text] of Object.entries(TS_SIGN_BLURB))
  items.push({ key: `blurb-${sign}`, text });

const SYSTEM =
  "შენ ხარ ქართული ენის პროფესიონალი კორექტორი. გისწორებ პიროვნების ქვიზის ტექსტებს " +
  "მხოლოდ გრამატიკულად, ორთოგრაფიულად და სტილისტურად. აუცილებელი წესები: (1) არ შეცვალო " +
  "წინადადების აზრი და ის, თუ რომელ ხასიათს/ელემენტს მიემართება პასუხი; (2) შეინარჩუნე " +
  "„მე“-ს პირველი პირი პასუხებში და მხიარული, მიმზიდველი ტონი; (3) გახადე ბუნებრივი, " +
  "გამართული და მოკლე; (4) თუ ტექსტი უკვე გამართულია, დააბრუნე უცვლელად. " +
  'დააბრუნე მხოლოდ ვალიდური JSON მასივი: [{"key": string, "text": string}].';

const ai = new GoogleGenAI({
  vertexai: true,
  project: process.env.GOOGLE_CLOUD_PROJECT,
  location: "global",
});

async function main() {
  if (!process.env.GOOGLE_CLOUD_PROJECT)
    throw new Error("GOOGLE_CLOUD_PROJECT missing");
  const res = await ai.models.generateContent({
    model: "gemini-3.8-flash",
    contents: "გაასწორე ეს ტექსტები:\n" + JSON.stringify(items, null, 2),
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
  const byKey = new Map(
    JSON.parse(raw).map((c) => [c.key, String(c.text).trim()]),
  );

  let changed = 0;
  for (const it of items) {
    const fixed = byKey.get(it.key);
    if (!fixed || fixed === it.text) continue;
    changed++;
    console.log(`\n[${it.key}]\n  - ${it.text}\n  + ${fixed}`);
  }
  console.log(
    `\n${changed} of ${items.length} strings changed (dry run — apply to source by hand).`,
  );
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
