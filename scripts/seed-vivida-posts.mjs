// One-off: create the official "Vivida" brand account (if missing) and post
// a couple of engagement-driving posts to the feed under it — a comment-
// driven rating prompt and an icebreaker, both designed to pull people into
// writing posts/comments rather than just reacting.
//
// Idempotent: re-running skips account creation if it already exists, and
// only inserts posts once (checked by exact body match) so it's safe to
// re-run after editing copy below for new posts.
//
// Usage: node scripts/seed-vivida-posts.mjs
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

const SITE = "https://www.vivida.ge";
const VIVIDA_EMAIL = "team@vivida.ge";
const VIVIDA_USERNAME = "vivida";

const POSTS = [
  "1-დან 10-მდე, რამდენს დაუწერდი ვივიდას? ✨\n\nდაწერე შენი შეფასება კომენტარში — და ერთი სიტყვით დაამატე, რა გინდა ვნახოთ შემდეგში 👇",
  "გავიცნოთ ერთმანეთი 🌌\n\nდაწერე კომენტარში: შენი მზის ნიშანი + ერთი სიტყვა, რომელიც ყველაზე კარგად გხატავს.\n\nდა თუ გაინტერესებს სხვა ვივიდელების გაცნობა — ეწვიე „ხალხის\" გვერდს, იქ ახალი ადამიანების პოვნა შეგიძლია 🔭",
];

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL missing");
  const sql = neon(process.env.DATABASE_URL);

  let [user] = await sql`SELECT id FROM "user" WHERE email = ${VIVIDA_EMAIL}`;
  if (!user) {
    const id = randomUUID();
    await sql`
      INSERT INTO "user" (id, name, email, image, "emailVerified")
      VALUES (${id}, ${"Vivida"}, ${VIVIDA_EMAIL}, ${`${SITE}/apple-icon.png`}, now())`;
    // Not discoverable: this is a brand account, not a person to "match"
    // with via compatibility — keep it out of /people and suggestion rails.
    // It's still fully visible via the feed and its direct profile link.
    await sql`
      INSERT INTO profile (user_id, username, display_name, bio, discoverable)
      VALUES (${id}, ${VIVIDA_USERNAME}, ${"Vivida"}, ${"Vivida-ს ოფიციალური გვერდი ✨"}, false)`;
    user = { id };
    console.log("created Vivida account:", id);
  } else {
    console.log("Vivida account already exists:", user.id);
  }

  const existing = await sql`SELECT body FROM post WHERE user_id = ${user.id}`;
  const existingBodies = new Set(existing.map((r) => r.body));

  let posted = 0;
  for (const body of POSTS) {
    if (existingBodies.has(body)) {
      console.log("skip (already posted):", body.slice(0, 30) + "…");
      continue;
    }
    // posts.id has no DB-level default (Drizzle generates it in JS), so a
    // raw SQL insert must supply one explicitly.
    await sql`INSERT INTO post (id, user_id, body) VALUES (${randomUUID()}, ${user.id}, ${body})`;
    posted++;
    console.log("posted:", body.slice(0, 40).replace(/\n/g, " ") + "…");
  }
  console.log(`done: ${posted} new post(s)`);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
