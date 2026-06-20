// One-shot, READ-ONLY: list existing accounts whose natal birth date puts
// them under the minimum age. The age gate (saveBirthDataCore) only catches
// new/edited profiles, so accounts onboarded before it shipped are unchecked.
//
// This script ONLY SELECTs — it never writes, suspends, or deletes anything.
// Decide handling from the printed list.
//
//   node scripts/scan-underage.mjs

import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

config({ path: ".env.local" });

const MIN_AGE = 18;
const sql = neon(process.env.DATABASE_URL);

const rows = await sql`
  SELECT
    u.id,
    u.email,
    u.name,
    p.username,
    p.date_of_birth,
    EXTRACT(YEAR FROM age(p.date_of_birth))::int AS age,
    p.created_at AS onboarded_at
  FROM profile p
  JOIN "user" u ON u.id = p.user_id
  WHERE p.date_of_birth IS NOT NULL
    AND p.date_of_birth > (CURRENT_DATE - (${MIN_AGE} || ' years')::interval)
  ORDER BY p.date_of_birth DESC
`;

const total = await sql`SELECT count(*)::int AS n FROM profile WHERE date_of_birth IS NOT NULL`;

console.log(`\nMinimum age: ${MIN_AGE}`);
console.log(`Profiles with a birth date: ${total[0].n}`);
console.log(`Under ${MIN_AGE}: ${rows.length}\n`);

if (rows.length === 0) {
  console.log("✓ No existing accounts are under the minimum age.");
} else {
  for (const r of rows) {
    console.log(
      `- age ${String(r.age).padStart(2)} | dob ${r.date_of_birth} | ${r.username ?? "(no handle)"} | ${r.name ?? "?"} <${r.email ?? "?"}> | id=${r.id}`
    );
  }
}
console.log("");
