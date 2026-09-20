/**
 * Run a Georgian grammar/style pass over lib/seo/home-content.json using
 * Gemini 2.5 Pro (higher quality than Flash for editorial work). Sends the
 * whole JSON, gets back a corrected JSON with the same structure, writes
 * it back. Idempotent — running twice should converge.
 *
 * Usage:
 *   node scripts/grammar-check-home.mjs
 *   node scripts/grammar-check-home.mjs --diff   (print before/after lines)
 */

import { config } from "dotenv";
import { writeFileSync, readFileSync } from "fs";
import { resolve } from "path";

config({ path: ".env.local" });

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "google/gemini-3.8-flash";
const KEY = process.env.OPENROUTER_API_KEY;
if (!KEY) {
  console.error("OPENROUTER_API_KEY is not set in .env.local — aborting.");
  process.exit(1);
}

const PATH = resolve("lib/seo/home-content.json");
const showDiff = process.argv.includes("--diff");

const SYSTEM_PROMPT = `შენ ხარ პროფესიონალი ქართული რედაქტორი/კორექტორი. მოგეცემა JSON ფაილი ვიდიდას — Vivida — ქართული B2C ასტროლოგიური ვებ-აპლიკაციის მთავარი გვერდის ქართული ტექსტებით.

შენი დავალება: გადახედე ყველა ქართული ტექსტი და გაასწორე:
- გრამატიკული შეცდომები (ბრუნვები, თანდებულები, ზმნური ფორმები)
- ორთოგრაფია
- პუნქტუაცია
- სტილი (ცარიელი ფრაზების შეცვლა კონკრეტულით, არაბუნებრივი თარგმანის გასწორება)
- დროის თანხმობა
- სიტყვის ფორმები ("ნიშანი" → "ნიშანში", "სახლი" → "სახლში")

წესები:
- შეინახე იდენტური JSON სტრუქტურა (ყველა გასაღები, მათი იერარქია)
- შეინარჩუნე "შენ"-ის ფორმა (არა "თქვენ")
- შეინარჩუნე ყველა ფაქტობრივი შინაარსი (10 პლანეტა, 12 სახლი, 78 წყვილი, AI Gemini, ვებ-აპი vivida.ge და ა.შ.)
- "Big Three" — გამოიყენე "დიდი სამეული" (არა transliterate, არა ინგლისურად)
- ბრენდის სახელი "Vivida" დარჩება ლათინურად
- ტექნიკური სიტყვები — "Google", "AI", "Gemini" — ლათინურად
- აცილე ცვლილებებს, რომლებიც აშკარა შეცდომებს არ ასწორებენ — მცირე გადახედვა, არა გადაწერა

ფაქტობრივი ცნებები (გამოიყენე ეს ზუსტი ფორმები):
- ნატალური რუკა (არა "ნატური", "ნატურული")
- ასცენდენტი ან ამომავალი ნიშანი (არა "ასცედენტი" — ეს შეცდომაა)
- სინასტრია, სინასტრიული
- ტრანზიტი, ტრანზიტები
- ცის ნიშანი (არა "ცას ნიშანი")
- დიდი სამეული (Big Three-ის ქართული)

დააბრუნე მხოლოდ ვალიდური JSON იმავე სტრუქტურით, ფენსების გარეშე.`;

async function callOpenRouter(content) {
  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${KEY}`,
      "HTTP-Referer": "https://vivida.ge",
      "X-Title": "Vivida home grammar pass",
    },
    body: JSON.stringify({
      model: MODEL,
      reasoning: { effort: "low" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `გადახედე და გაასწორე ეს JSON. დააბრუნე იგივე სტრუქტურით, გრამატიკულად სუფთა ქართულით:\n\n${content}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2, // editorial work — be conservative
      // Gemini 3.8 Flash spends a chunk on reasoning tokens before emitting
      // visible output; cap high enough that the JSON body still fits.
      max_tokens: 32000,
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`OpenRouter ${res.status}: ${text.slice(0, 400)}`);
  }
  const json = await res.json();
  if (json.error) throw new Error(`OpenRouter: ${json.error.message}`);
  const raw = json.choices?.[0]?.message?.content;
  if (!raw) {
    console.error("--- raw response ---");
    console.error(JSON.stringify(json, null, 2).slice(0, 1500));
    throw new Error("Empty response");
  }
  return raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
}

/**
 * Walk two parallel objects and report every changed leaf-string side by
 * side. Used to surface what the model edited so the user can spot-check.
 */
function diffStrings(before, after, path = "") {
  if (typeof before === "string") {
    if (typeof after === "string" && before !== after) {
      console.log(`\n  ${path}`);
      console.log(`    -  ${before}`);
      console.log(`    +  ${after}`);
    }
    return;
  }
  if (Array.isArray(before)) {
    for (let i = 0; i < before.length; i++) {
      diffStrings(before[i], after?.[i], `${path}[${i}]`);
    }
    return;
  }
  if (before && typeof before === "object") {
    for (const k of Object.keys(before)) {
      diffStrings(before[k], after?.[k], path ? `${path}.${k}` : k);
    }
  }
}

async function run() {
  console.log(`→ reading ${PATH}`);
  const beforeRaw = readFileSync(PATH, "utf8");
  const before = JSON.parse(beforeRaw);

  console.log(`→ submitting to ${MODEL} for grammar review…`);
  const t0 = Date.now();
  const correctedRaw = await callOpenRouter(beforeRaw);
  console.log(`  ✓ response in ${(Date.now() - t0) / 1000}s`);

  let after;
  try {
    after = JSON.parse(correctedRaw);
  } catch (err) {
    console.error("✗ model returned invalid JSON:", err.message);
    console.error("---raw response (first 500ch)---");
    console.error(correctedRaw.slice(0, 500));
    process.exit(1);
  }

  // Sanity check: same top-level keys
  const beforeKeys = Object.keys(before).sort().join(",");
  const afterKeys = Object.keys(after).sort().join(",");
  if (beforeKeys !== afterKeys) {
    console.error(
      `✗ key mismatch: before [${beforeKeys}] vs after [${afterKeys}]`,
    );
    process.exit(1);
  }

  if (showDiff) {
    console.log("\n=== changes ===");
    diffStrings(before, after);
  }

  writeFileSync(PATH, JSON.stringify(after, null, 2));
  console.log(`\n✓ wrote corrected JSON back to ${PATH}`);
}

run().catch((err) => {
  console.error("✗ failed:", err);
  process.exit(1);
});
