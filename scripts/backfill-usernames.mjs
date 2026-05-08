// One-shot: assign a username to every profile row that doesn't have one.
//
// Legacy private profiles never had `username` set, but every profile is
// now public, so they need one or links to /u/<username> 404. This script
// generates a slug from the user's name (or "user") and falls back to
// random suffixes on collision.
//
// Idempotent — running it twice does nothing once every row has a username.

import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL);

function slugify(name) {
  const ascii = (name ?? "user")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 14);
  return ascii || "user";
}

function suffix() {
  return Math.floor(Math.random() * 9000 + 1000);
}

async function run() {
  const rows = await sql`
    SELECT p.user_id AS id, u.name
    FROM profile p
    LEFT JOIN "user" u ON u.id = p.user_id
    WHERE p.username IS NULL
  `;

  console.log(`Found ${rows.length} profile(s) without a username.`);

  let ok = 0;
  let failed = 0;

  for (const row of rows) {
    const base = slugify(row.name);
    let assigned = false;
    for (let attempt = 0; attempt < 8 && !assigned; attempt++) {
      const candidate = `${base}_${suffix()}`;
      try {
        await sql`
          UPDATE profile SET username = ${candidate}, updated_at = NOW()
          WHERE user_id = ${row.id} AND username IS NULL
        `;
        assigned = true;
        ok++;
        console.log(`  ✓ ${row.id} → ${candidate}`);
      } catch (err) {
        if (err?.code === "23505") {
          // Username collision — try a different suffix.
          continue;
        }
        throw err;
      }
    }
    if (!assigned) {
      failed++;
      console.warn(`  ✗ could not pick a unique username for ${row.id}`);
    }
  }

  console.log(`\nDone. ${ok} ok, ${failed} failed.`);
}

run().catch((err) => {
  console.error("Backfill failed:", err);
  process.exit(1);
});
