// Proofread ALL Georgian copy for the Big Five test, the 40 items, trait
// names/taglines, the 15 trait interpretations, and the SEO page copy, for
// grammar/orthography/naturalness. Sends everything to gemini-3.8-flash (Vertex,
// Google credits) with a strict "fix language only, preserve meaning +
// agree-direction" instruction and prints every change so the static source
// (lib/big-five/*.ts) can be synced by hand.
//
// Usage: node --import tsx scripts/proofread-bigfive.mjs

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

const { BIG5_QUESTIONS, BIG5_TRAITS } =
  await import("../lib/big-five/questions.ts");
const { BIG5_TRAIT_INTERP } = await import("../lib/big-five/scoring.ts");
const { BIG5_INTRO, BIG5_FAQ, BIG5_META_DESCRIPTION } =
  await import("../lib/big-five/content.ts");

// ── Collect every string with a stable key ─────────────────────────────────
const items = [];
for (const q of BIG5_QUESTIONS)
  items.push({ key: `q-${q.id}`, text: q.textKa });
for (const t of BIG5_TRAITS) {
  items.push({ key: `trait-${t.key}-name`, text: t.nameKa });
  items.push({ key: `trait-${t.key}-tagline`, text: t.taglineKa });
}
for (const [trait, byLevel] of Object.entries(BIG5_TRAIT_INTERP))
  for (const [level, text] of Object.entries(byLevel))
    items.push({ key: `interp-${trait}-${level}`, text });
BIG5_INTRO.forEach((text, i) => items.push({ key: `intro-${i}`, text }));
BIG5_FAQ.forEach((f, i) => {
  items.push({ key: `faq-${i}-q`, text: f.q });
  items.push({ key: `faq-${i}-a`, text: f.a });
});
items.push({ key: "meta-desc", text: BIG5_META_DESCRIPTION });

const SYSTEM =
  "შენ ხარ ქართული ენის პროფესიონალი კორექტორი. გისწორებ პიროვნების ტესტის ტექსტებს " +
  "მხოლოდ გრამატიკულად, ორთოგრაფიულად და სტილისტურად. აუცილებელი წესები: (1) არ შეცვალო " +
  "წინადადების აზრი და ტესტის დებულებებში ის, თუ რომელ პოლუსს ეთანხმება; (2) შეინარჩუნე " +
  "„მე“-ს პირველი პირი დებულებებში; (3) გახადე ბუნებრივი, გამართული და მკაფიო; (4) დაიცავი " +
  "ფსიქოლოგიური ტერმინოლოგიის სისწორე; (5) თუ ტექსტი უკვე გამართულია, დააბრუნე უცვლელად. " +
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
  const corrected = JSON.parse(raw);
  const byKey = new Map(corrected.map((c) => [c.key, String(c.text).trim()]));

  let changed = 0;
  for (const it of items) {
    const fixed = byKey.get(it.key);
    if (!fixed || fixed === it.text) continue;
    changed++;
    console.log(`\n[${it.key}]`);
    console.log(`  - ${it.text}`);
    console.log(`  + ${fixed}`);
  }
  console.log(
    `\n${changed} of ${items.length} strings changed (dry run, apply to source by hand).`,
  );
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
