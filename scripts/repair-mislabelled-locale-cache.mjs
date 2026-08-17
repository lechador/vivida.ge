/**
 * Delete cached readings whose stored `language` disagrees with the script
 * their text is actually written in.
 *
 * Why these exist: the Armenian rows were inserted into
 * transit_interpretation_library BEFORE the code that filters that table by
 * language was deployed. In that window the live query was still
 * `WHERE key IN (...)` with no language predicate, so it got TWO rows per key
 * and `new Map(rows.map(...))` silently kept whichever came last — often the
 * Armenian one. Georgian readers got Armenian interpretations, and the
 * composed result was cached stamped `language: 'ka'`.
 *
 * That stamp is what makes it permanent: `ensureDailyFor` compares
 * `existing.language === locale`, sees 'ka' === 'ka', and returns the poisoned
 * row forever. Nothing self-heals. Deleting is the repair — both tables are
 * caches that regenerate on the next request, and the read path is fixed now.
 *
 * Safe to re-run: it only ever deletes rows that are currently inconsistent.
 *
 *   node scripts/repair-mislabelled-locale-cache.mjs [--apply]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { neon } from "@neondatabase/serverless";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const APPLY = process.argv.includes("--apply");

const env = Object.fromEntries(
  fs
    .readFileSync(path.join(ROOT, ".env.local"), "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.trimStart().startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim().replace(/^["']|["']$/g, "")]),
);
const sql = neon(env.DATABASE_URL);

const ARMENIAN = "[\\u0530-\\u058F]";
const GEORGIAN = "[\\u10A0-\\u10FF]";

/** For each locale, the script its text must NOT be written in. */
const WRONG_SCRIPT = { ka: ARMENIAN, am: GEORGIAN, en: null };

const TARGETS = [
  { table: "daily_horoscope", columns: ["headline", "summary", "body"], label: "daily readings" },
  { table: "weekly_forecast", columns: ["days::text"], label: "weekly forecasts" },
];

let total = 0;
for (const { table, columns, label } of TARGETS) {
  for (const [locale, wrong] of Object.entries(WRONG_SCRIPT)) {
    if (!wrong) continue;
    const test = columns.map((c) => `${c} ~ '${wrong}'`).join(" or ");
    const where = `language = '${locale}' and (${test})`;

    const [{ n }] = await sql.query(`select count(*)::int as n from "${table}" where ${where}`);
    if (n === 0) continue;

    total += n;
    console.log(`${table}: ${n} rows stamped '${locale}' contain the wrong script`);
    if (APPLY) {
      await sql.query(`delete from "${table}" where ${where}`);
      console.log(`  deleted — ${label} will regenerate on next request`);
    }
  }
}

console.log(total === 0 ? "\nNothing to repair." : APPLY ? `\nRepaired ${total} rows.` : `\n${total} rows would be deleted (re-run with --apply).`);
