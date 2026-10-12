// Backfill the 20-credit signup bonus for users who never received it.
//
// Root cause: web Google sign-ups are created by the Auth.js DrizzleAdapter,
// which (until the createUser event hook was added) never called
// onUserSignedUp, so those users got no signup bonus. This grants it
// retroactively, but ONLY to users who received no welcome grant through any
// channel (signup_bonus / grandfather / admin_grant), so grandfathered users
// and the ones already hand-fixed via the admin gift tool are left untouched.
//
// Idempotent: after a grant the user has a signup_bonus row, so re-running
// is a no-op. Mirrors grantCredits (account upsert + ledger + credit
// notification).
//
// Usage:
//   node scripts/backfill-signup-bonus.mjs --dry   → count + list, grants nothing
//   node scripts/backfill-signup-bonus.mjs         → grants

import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

try {
  for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
} catch {}

const SIGNUP_BONUS = 20;
const dry = process.argv.includes("--dry");
const sql = neon(process.env.DATABASE_URL);

const targets = await sql`
  SELECT u.id, u.email
  FROM "user" u
  WHERE NOT EXISTS (
    SELECT 1 FROM credit_transaction t
    WHERE t.user_id = u.id
      AND t.reason IN ('signup_bonus', 'grandfather', 'admin_grant')
  )
  ORDER BY u.created_at`;

console.log(`target users (no welcome grant): ${targets.length}${dry ? " (DRY RUN, nothing granted)" : ""}`);
if (dry) {
  targets.slice(0, 30).forEach((t) => console.log("  -", t.email ?? t.id));
  process.exit(0);
}

let ok = 0;
for (const t of targets) {
  try {
    const acct = await sql`
      INSERT INTO credit_account (user_id, balance) VALUES (${t.id}, ${SIGNUP_BONUS})
      ON CONFLICT (user_id) DO UPDATE SET balance = credit_account.balance + ${SIGNUP_BONUS}, updated_at = now()
      RETURNING balance`;
    const balance = acct[0]?.balance ?? SIGNUP_BONUS;
    await sql`
      INSERT INTO credit_transaction (id, user_id, amount, reason)
      VALUES (gen_random_uuid()::text, ${t.id}, ${SIGNUP_BONUS}, 'signup_bonus')`;
    const payload = JSON.stringify({
      creditAmount: SIGNUP_BONUS,
      creditReason: "signup_bonus",
      creditBalance: balance,
    });
    await sql`
      INSERT INTO notification (id, user_id, kind, payload)
      VALUES (gen_random_uuid()::text, ${t.id}, 'credit', ${payload}::jsonb)`;
    ok++;
  } catch (e) {
    console.log("FAIL", t.email ?? t.id, e.message);
  }
}
console.log(`done: ${ok}/${targets.length} granted +${SIGNUP_BONUS}`);
