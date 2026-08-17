/**
 * Step 2 of the Armenian UI backfill: TRANSLATE.
 *
 * Reads the `unique` array produced by i18n-extract-en-ternaries.mjs and
 * returns an id -> Armenian map. Only ever handles plain strings — it does
 * not see or produce source code.
 *
 *   node scripts/i18n-translate-strings.mjs <extract.json> <out.json>
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv() {
  const raw = fs.readFileSync(path.join(ROOT, ".env.local"), "utf8");
  const out = {};
  for (const line of raw.split("\n")) {
    const i = line.indexOf("=");
    if (i === -1 || line.trimStart().startsWith("#")) continue;
    out[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^["']|["']$/g, "");
  }
  return out;
}

const env = loadEnv();
const API_KEY = env.OPENROUTER_API_KEY;
if (!API_KEY) throw new Error("OPENROUTER_API_KEY missing from .env.local");

const MODEL = "google/gemini-2.5-flash";
const BATCH_SIZE = 40;
const CONCURRENCY = 4;
const MAX_ATTEMPTS = 4;

const SYSTEM_PROMPT = `You translate user-interface strings from English into Eastern Armenian for an astrology web app called Vivida.

You receive a JSON array of {"id": number, "text": string}.
Return ONLY {"items": [{"id": number, "text": string}, ...]} — one item per input, same ids, same order.

Rules:
- These are UI labels, buttons, headings, form fields and short messages. Keep them SHORT — an Armenian button label must still fit a button.
- Use natural, idiomatic Armenian, not word-for-word calques. Match the tone: friendly, direct, second person.
- Keep the brand name "Vivida" and product tier names like "PRO" in Latin script, untranslated.
- Preserve any placeholder or markup fragment EXACTLY as it appears (e.g. {name}, %s, \\n, numerals, emoji).
- Preserve leading/trailing whitespace exactly.
- If a string is a bare number, symbol, or a proper noun with no Armenian equivalent, return it unchanged.
- Astrology vocabulary must use standard Armenian terms: Արև, Լուսին, Մերկուրի, Վեներա, Մարս, Յուպիտեր, Սատուրն, Ուրան, Նեպտուն, Պլուտոն, Ասցենդենտ, նատալ քարտեզ (natal chart), հորոսկոպ, կենդանակերպ (zodiac), համատեղելիություն (compatibility), սինաստրիա (synastry), տուն (house), ասպեկտ (aspect).
- Never add commentary, quotes around the whole value, or code fences.`;

const ARMENIAN_RE = /[԰-֏]/;
/** Latin letters that are NOT part of an allowed brand token. */
const BRAND_OK = /^(Vivida|PRO|AI|IQ|EQ|MBTI|Big Five|Google|Apple|PDF|OK)$/i;

function validate(item, source) {
  if (!item || typeof item !== "object") return "not an object";
  if (item.id !== source.id) return `id mismatch (${item.id} vs ${source.id})`;
  if (typeof item.text !== "string") return "text not a string";
  if (item.text.trim().length === 0 && source.english.trim().length > 0) return "empty";
  // A string with no Armenian at all is only acceptable when the source had
  // no letters to translate (numbers, symbols) or is a known brand token.
  const hasLetters = /[a-z]/i.test(source.english);
  if (hasLetters && !ARMENIAN_RE.test(item.text) && !BRAND_OK.test(source.english.trim())) {
    return "no Armenian script in a translatable string";
  }
  return null;
}

async function translateBatch(rows, attempt = 1) {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
      "HTTP-Referer": "https://vivida.ge",
      "X-Title": "Vivida UI AM backfill",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: JSON.stringify(rows.map((r) => ({ id: r.id, text: r.english }))),
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 16000,
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`OpenRouter ${res.status}: ${text.slice(0, 200)}`);
  }
  const json = await res.json();
  if (json.error) throw new Error(`OpenRouter: ${json.error.message}`);
  const raw = json.choices?.[0]?.message?.content;
  if (!raw) throw new Error("empty completion");

  const stripped = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  const parsed = JSON.parse(stripped);
  const items = Array.isArray(parsed) ? parsed : parsed.items;
  if (!Array.isArray(items)) throw new Error("no items array");

  const byId = new Map(items.map((i) => [i?.id, i]));
  const good = [];
  const bad = [];
  for (const source of rows) {
    const item = byId.get(source.id);
    const problem = validate(item, source);
    if (problem) bad.push({ source, problem });
    else good.push({ id: source.id, english: source.english, armenian: item.text });
  }

  if (bad.length > 0 && attempt < MAX_ATTEMPTS) {
    process.stderr.write(`  retry ${attempt}: ${bad.length}/${rows.length} rejected (${bad[0].problem})\n`);
    good.push(...(await translateBatch(bad.map((b) => b.source), attempt + 1)));
    return good;
  }
  for (const b of bad) {
    process.stderr.write(`  GIVING UP on ${JSON.stringify(b.source.english)}: ${b.problem}\n`);
  }
  return good;
}

const extract = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const rows = extract.unique;
const batches = [];
for (let i = 0; i < rows.length; i += BATCH_SIZE) batches.push(rows.slice(i, i + BATCH_SIZE));

const out = [];
let cursor = 0;
async function worker() {
  while (cursor < batches.length) {
    const batch = batches[cursor++];
    try {
      out.push(...(await translateBatch(batch)));
    } catch (err) {
      process.stderr.write(`  batch failed: ${err.message}\n`);
    }
    console.log(`  ${out.length}/${rows.length} translated`);
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker));

out.sort((a, b) => a.id - b.id);
fs.writeFileSync(process.argv[3], JSON.stringify(out, null, 2));
console.log(`\nWrote ${out.length}/${rows.length} translations to ${process.argv[3]}`);
