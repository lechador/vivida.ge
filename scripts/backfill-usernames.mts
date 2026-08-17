/**
 * One-shot: give every registered user a username.
 *
 * Two populations need it:
 *   1. Users with a `profile` row whose `username` is NULL (legacy private
 *      profiles, and the fast-onboarding funnel before ensureUsername existed).
 *   2. Users with NO `profile` row at all — they signed up and never entered
 *      birth data, so nothing ever created one. This is the large group, and
 *      the previous .mjs version of this script missed it entirely because it
 *      selected FROM profile.
 *
 * Both are invisible on every people surface (/people, discovery, the match
 * deck, site search, @mention autocomplete all filter on username IS NOT NULL)
 * and unreachable at /u/<username>.
 *
 * Runs through lib/username.ts `ensureUsername` — the same function signup now
 * calls — so the backfill and the live path can never drift apart. Idempotent:
 * users who already have a username are skipped by the query and, belt-and-
 * braces, by ensureUsername itself.
 *
 * Usage:
 *   npx tsx scripts/backfill-usernames.mts --dry    # report only, no writes
 *   npx tsx scripts/backfill-usernames.mts
 */
import { readFileSync } from "node:fs";

// Load .env.local the same way the other scripts in this directory do, before
// anything imports @/db (which throws at import time without DATABASE_URL).
try {
  for (const line of readFileSync(
    new URL("../.env.local", import.meta.url),
    "utf8"
  ).split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
} catch {
  /* env may already be in the environment */
}

const { db } = await import("@/db");
const { profiles, users } = await import("@/db/schema");
const { ensureUsername } = await import("@/lib/username");
const { suggestUsername } = await import("@/lib/profile-utils");
const { eq, isNull, or } = await import("drizzle-orm");

const dry = process.argv.includes("--dry");

const targets = await db
  .select({ id: users.id, name: users.name, hasProfile: profiles.userId })
  .from(users)
  .leftJoin(profiles, eq(profiles.userId, users.id))
  .where(or(isNull(profiles.userId), isNull(profiles.username)));

console.log(
  `${targets.length} user(s) without a username` +
    ` (${targets.filter((t) => !t.hasProfile).length} with no profile row).`
);
if (dry) {
  for (const t of targets) {
    console.log(
      `  would assign ${suggestUsername(t.name)}  ← ${t.name ?? "(no name)"}`
    );
  }
  console.log("\nDry run — nothing written.");
  process.exit(0);
}

let ok = 0;
let failed = 0;
for (const t of targets) {
  try {
    const username = await ensureUsername(t.id, t.name);
    if (username) {
      ok += 1;
      console.log(`  ✓ ${t.id} → ${username}`);
    } else {
      failed += 1;
      console.warn(`  ✗ no unique username found for ${t.id}`);
    }
  } catch (err) {
    failed += 1;
    console.warn(`  ✗ ${t.id}: ${(err as Error).message}`);
  }
}

console.log(`\nDone. ${ok} assigned, ${failed} failed.`);
process.exit(failed > 0 ? 1 : 0);
