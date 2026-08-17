/**
 * Backfill Armenian rows into transit_interpretation_library.
 *
 * The table holds one row per (key, language). Every row was Georgian, so an
 * Armenian reader's daily horoscope had nothing to read and fell back first to
 * Georgian (a bug) and then to English (the stopgap). This translates the
 * curated Georgian corpus rather than generating fresh Armenian, so the two
 * languages say the same thing about the same transit.
 *
 * Idempotent and resumable: it only reads `ka` keys that have no `am` row yet,
 * so re-running after a crash picks up exactly where it stopped. Nothing is
 * ever updated in place — a row that already exists is left alone.
 *
 * Usage:
 *   node scripts/translate-transit-library.mjs [--limit N] [--dry-run]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { neon } from "@neondatabase/serverless";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv() {
  const raw = fs.readFileSync(path.join(ROOT, ".env.local"), "utf8");
  const out = {};
  for (const line of raw.split("\n")) {
    const i = line.indexOf("=");
    if (i === -1 || line.trimStart().startsWith("#")) continue;
    out[line.slice(0, i).trim()] = line
      .slice(i + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
  }
  return out;
}

const env = loadEnv();
const sql = neon(env.DATABASE_URL);
const API_KEY = env.OPENROUTER_API_KEY;
if (!API_KEY) throw new Error("OPENROUTER_API_KEY missing from .env.local");

const MODEL = "google/gemini-2.5-flash";
const BATCH_SIZE = 10;
const CONCURRENCY = 4;
const MAX_ATTEMPTS = 4;

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const LIMIT = (() => {
  const i = args.indexOf("--limit");
  return i === -1 ? null : Number(args[i + 1]);
})();

const SYSTEM_PROMPT = `You are a professional Georgian-to-Armenian translator specialising in astrology copy.

You receive a JSON array of items, each {"key": string, "title": string, "body": string} in Georgian.
Return ONLY a JSON object {"items": [{"key": string, "title": string, "body": string}, ...]} with every item translated into natural, literary Eastern Armenian.

Rules:
- Return EXACTLY one item per input item, with the SAME "key" values, in the SAME order. Never merge, drop, reorder or invent items.
- Translate meaning, not words. The result must read as if written by an Armenian astrologer, not as a translation.
- Keep the register warm, concrete and second-person ("դու"), matching the Georgian.
- Astrological vocabulary must use standard Armenian terms:
  Արև, Լուսին, Մերկուրի, Վեներա, Մարս, Յուպիտեր, Սատուրն, Ուրան, Նեպտուն, Պլուտոն, Ասցենդենտ.
  Signs: Խոյ, Ցուլ, Երկվորյակներ, Խեցգետին, Առյուծ, Կույս, Կշեռք, Կարիճ, Աղեղնավոր, Այծեղջյուր, Ջրհոս, Ձկներ.
  Aspects: միացում (conjunction), եռանկյուն (trine), քառակուսի (square), հակադրություն (opposition), վեցանկյուն (sextile).
- Preserve the title as a SHORT headline (3-7 words). Preserve the body's paragraph structure and approximate length.
- Never add commentary, disclaimers or code fences.`;

function buildUserMessage(rows) {
  return JSON.stringify(
    rows.map((r) => ({ key: r.key, title: r.title, body: r.body })),
    null,
    1,
  );
}

const ARMENIAN_RE = /[԰-֏]/;
const GEORGIAN_RE = /[Ⴀ-ჿ]/;

/** Reject anything that is not actually Armenian — a silent passthrough of
 *  the Georgian input would poison the table with the very bug being fixed. */
function validate(item, source) {
  if (!item || typeof item !== "object") return "not an object";
  if (item.key !== source.key) return `key mismatch (${item.key} vs ${source.key})`;
  for (const field of ["title", "body"]) {
    const v = item[field];
    if (typeof v !== "string" || v.trim().length === 0) return `empty ${field}`;
    if (!ARMENIAN_RE.test(v)) return `${field} contains no Armenian script`;
    if (GEORGIAN_RE.test(v)) return `${field} still contains Georgian script`;
  }
  if (item.body.length < source.body.length * 0.4) return "body suspiciously short";
  return null;
}

async function translateBatch(rows, attempt = 1) {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
      "HTTP-Referer": "https://vivida.ge",
      "X-Title": "Vivida transit library AM backfill",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserMessage(rows) },
      ],
      response_format: { type: "json_object" },
      temperature: 0.4,
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
  let parsed;
  try {
    parsed = JSON.parse(stripped);
  } catch (err) {
    throw new Error(`invalid JSON: ${err.message}`);
  }
  const items = Array.isArray(parsed) ? parsed : parsed.items;
  if (!Array.isArray(items)) throw new Error("no items array in response");

  const byKey = new Map(items.map((i) => [i?.key, i]));
  const good = [];
  const bad = [];
  for (const source of rows) {
    const item = byKey.get(source.key);
    const problem = validate(item, source);
    if (problem) bad.push({ source, problem });
    else good.push({ source, item });
  }

  // Retry only the items that failed, halving the batch so a single poison
  // row cannot keep dragging its neighbours down with it.
  if (bad.length > 0 && attempt < MAX_ATTEMPTS) {
    process.stderr.write(
      `    retry ${attempt}: ${bad.length}/${rows.length} rejected (${bad[0].problem})\n`,
    );
    const retryRows = bad.map((b) => b.source);
    const halves =
      retryRows.length > 1
        ? [retryRows.slice(0, Math.ceil(retryRows.length / 2)), retryRows.slice(Math.ceil(retryRows.length / 2))]
        : [retryRows];
    for (const half of halves) {
      if (half.length === 0) continue;
      good.push(...(await translateBatch(half, attempt + 1)));
    }
    return good;
  }

  for (const b of bad) {
    process.stderr.write(`    GIVING UP on ${b.source.key}: ${b.problem}\n`);
  }
  return good;
}

async function main() {
  const pending = await sql`
    select ka.key, ka.kind, ka.transit, ka.aspect_kind, ka.subject, ka.title, ka.body
    from transit_interpretation_library ka
    where ka.language = 'ka'
      and not exists (
        select 1 from transit_interpretation_library am
        where am.key = ka.key and am.language = 'am'
      )
    order by ka.key
  `;

  const todo = LIMIT ? pending.slice(0, LIMIT) : pending;
  console.log(`${pending.length} Georgian rows still need Armenian; processing ${todo.length}.`);
  if (todo.length === 0) return;

  const batches = [];
  for (let i = 0; i < todo.length; i += BATCH_SIZE) {
    batches.push(todo.slice(i, i + BATCH_SIZE));
  }

  let done = 0;
  let written = 0;
  let failed = 0;
  let cursor = 0;

  async function worker() {
    while (cursor < batches.length) {
      const batch = batches[cursor++];
      let results = [];
      try {
        results = await translateBatch(batch);
      } catch (err) {
        process.stderr.write(`  batch failed entirely: ${err.message}\n`);
        failed += batch.length;
        continue;
      }
      failed += batch.length - results.length;

      if (!DRY_RUN) {
        for (const { source, item } of results) {
          await sql`
            insert into transit_interpretation_library
              (key, kind, transit, aspect_kind, subject, title, body, model, language)
            values (${source.key}, ${source.kind}, ${source.transit},
                    ${source.aspect_kind}, ${source.subject},
                    ${item.title}, ${item.body}, ${MODEL}, 'am')
            on conflict (key, language) do nothing
          `;
          written++;
        }
      } else {
        written += results.length;
        if (results.length > 0) {
          console.log(`  sample ${results[0].source.key}:\n    ${results[0].item.title}\n    ${results[0].item.body.slice(0, 140)}…`);
        }
      }

      done += batch.length;
      console.log(`  ${done}/${todo.length} processed, ${written} written, ${failed} failed`);
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  console.log(`\nDone. written=${written} failed=${failed}${DRY_RUN ? " (dry run — nothing persisted)" : ""}`);
}

await main();
