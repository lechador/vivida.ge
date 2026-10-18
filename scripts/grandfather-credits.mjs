// One-time: grant every EXISTING user 30 credits as they move onto the credit
// model (they predate the wallet, so they never got the +20 signup bonus).
//
// Idempotent + safe next to new signups: only grants to users with NO credit
// activity at all, so anyone who already earned/bought/got-the-signup-bonus is
// skipped. Re-running is a no-op.
//
// Usage: node scripts/grandfather-credits.mjs [--dry]
// Reads DATABASE_URL from .env.local or the environment.

import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";
import { randomUUID } from "node:crypto";

try {
  for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
} catch {}

const GRANT = 30;
const dry = process.argv.includes("--dry");

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL missing");
  const sql = neon(process.env.DATABASE_URL);

  const users = await sql`
    SELECT u.id FROM "user" u
    WHERE NOT EXISTS (SELECT 1 FROM credit_transaction t WHERE t.user_id = u.id)`;

  console.log(`users to grandfather: ${users.length} × ${GRANT} credits${dry ? " (DRY RUN)" : ""}`);
  if (dry) return;

  let done = 0;
  for (const { id } of users) {
    await sql`INSERT INTO credit_account (user_id, balance) VALUES (${id}, ${GRANT})
              ON CONFLICT (user_id) DO UPDATE SET balance = credit_account.balance + ${GRANT}, updated_at = now()`;
    await sql`INSERT INTO credit_transaction (id, user_id, amount, reason)
              VALUES (${randomUUID()}, ${id}, ${GRANT}, 'grandfather')`;
    done++;
    if (done % 50 === 0) console.log(`  ${done}/${users.length}…`);
  }
  console.log(`done: ${done} users credited`);
}

main().catch((e) => { console.error(e.message); process.exit(1); });
