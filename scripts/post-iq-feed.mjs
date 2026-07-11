// One-off: post the IQ-test launch announcement to the feed under the official
// "Vivida" brand account. Idempotent — skips if the exact body is already
// posted, so it's safe to re-run.
//
// Usage: node scripts/post-iq-feed.mjs
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

const VIVIDA_EMAIL = "team@vivida.ge";

const BODY = `🧠 ახალი ტესტი Vivida-ზე — IQ ტესტი

ადაპტიური და კულტურულად ნეიტრალური ტესტი, რომელიც შენს დონეს ერგება: რაც უფრო სწორად პასუხობ, მით უფრო რთულდება. ლოგიკა, რიცხვები, სივრცე და პატერნები — ერთ ადგილას.

მიიღე შენი IQ ქულა, პროცენტილი და აზროვნების პროფილი — უფასოდ, რეგისტრაციის გარეშე. შედეგი, თუ გინდა, შენს პროფილზეც გამოაჩინე.

გაიარე და დაწერე კომენტარში, რა ქულა მიიღე 👇
vivida.ge/iq-testi`;

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL missing");
  const sql = neon(process.env.DATABASE_URL);

  const [user] = await sql`SELECT id FROM "user" WHERE email = ${VIVIDA_EMAIL}`;
  if (!user) throw new Error("Vivida brand account not found — run seed-vivida-posts.mjs first");

  const existing = await sql`SELECT 1 FROM post WHERE user_id = ${user.id} AND body = ${BODY}`;
  if (existing.length) {
    console.log("already posted — nothing to do");
    return;
  }

  await sql`INSERT INTO post (id, user_id, body) VALUES (${randomUUID()}, ${user.id}, ${BODY})`;
  console.log("posted IQ-test announcement to the feed as Vivida ✨");
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
