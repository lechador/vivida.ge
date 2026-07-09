// Seed the editable Astro-MBTI question table (mbti_question) from the canonical
// list in lib/mbti-questions.ts. The static array stays the source of truth for
// STRUCTURE (id/axis/pole); this table is the admin-editable WORDING surface the
// live quiz reads.
//
// Idempotent: inserts missing rows and refreshes wording on non-edited rows;
// never clobbers a row an admin has edited (edited=true), unless --force.
//
// Usage (tsx loader lets us import the .ts source, so the 60 strings live in
// exactly one place):
//   node --import tsx scripts/seed-mbti-questions.mjs           → insert missing + refresh non-edited
//   node --import tsx scripts/seed-mbti-questions.mjs --force   → overwrite even edited rows

import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const { MBTI_QUESTIONS } = await import("../lib/mbti-questions.ts");

const force = process.argv.includes("--force");

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL missing");
  const sql = neon(process.env.DATABASE_URL);

  let inserted = 0;
  let updated = 0;
  for (let i = 0; i < MBTI_QUESTIONS.length; i++) {
    const q = MBTI_QUESTIONS[i];
    const rows = force
      ? await sql`
          INSERT INTO mbti_question (id, axis, pole, text_ka, order_index, active, edited, updated_at)
          VALUES (${q.id}, ${q.axis}, ${q.pole}, ${q.textKa}, ${i}, true, false, now())
          ON CONFLICT (id) DO UPDATE
            SET axis = EXCLUDED.axis, pole = EXCLUDED.pole, text_ka = EXCLUDED.text_ka,
                order_index = EXCLUDED.order_index, edited = false, updated_at = now()
          RETURNING (xmax = 0) AS ins`
      : await sql`
          INSERT INTO mbti_question (id, axis, pole, text_ka, order_index, active, edited, updated_at)
          VALUES (${q.id}, ${q.axis}, ${q.pole}, ${q.textKa}, ${i}, true, false, now())
          ON CONFLICT (id) DO UPDATE
            SET axis = EXCLUDED.axis, pole = EXCLUDED.pole, text_ka = EXCLUDED.text_ka,
                order_index = EXCLUDED.order_index, updated_at = now()
            WHERE mbti_question.edited = false
          RETURNING (xmax = 0) AS ins`;
    if (rows.length === 0) continue; // skipped (edited row, no --force)
    if (rows[0].ins) inserted++;
    else updated++;
  }

  console.log(`done: ${inserted} inserted, ${updated} refreshed (force=${force})`);
}

main().catch((e) => { console.error(e.message); process.exit(1); });
