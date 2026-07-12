// Backfill profile.gender for existing users by inferring sex from their first
// name (Georgian names are strongly gendered → cheap + accurate). NAME ONLY.
//
// Only touches rows where gender IS NULL or gender_source='ai' (never
// overwrites a self-reported value). Genuinely ambiguous / unknowable names
// are left blank. Sets gender_source='ai'.
//
// Batched: sends many names per Vertex call (this is a simple classification,
// so batching is safe, unlike the prose libraries). Model returns strict JSON.
//
// Usage:
//   node scripts/backfill-gender.mjs --dry   → classify + print counts, no write
//   node scripts/backfill-gender.mjs         → write results
//
// Reads GOOGLE_CLOUD_PROJECT / GOOGLE_CLOUD_LOCATION / DATABASE_URL from
// .env.local or the environment.

import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";
import { GoogleGenAI } from "@google/genai";

try {
  for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
} catch {}

const MODEL = "gemini-2.5-flash"; // classification — flash is plenty
const BATCH = 40;
const dry = process.argv.includes("--dry");

const SYSTEM =
  "You classify the likely sex of a person from their first name, for Georgian " +
  "(ქართული) names primarily, but also international ones. For each input " +
  "{id, name} return {id, g} where g is 'male', 'female', or 'unknown'. Use " +
  "'unknown' ONLY when the name is genuinely unisex, a nickname/handle with no " +
  "gender signal, empty, or not a personal name. Georgian male names typically " +
  "end in -ი (გიორგი, ლევანი, ნიკა), female in -ა/-ი (ნინო, თამარი, ანა, მარიამი) " +
  "— judge by the actual name, not just the ending. Return ONLY a JSON array.";

const ai = new GoogleGenAI({
  vertexai: true,
  project: process.env.GOOGLE_CLOUD_PROJECT,
  location: process.env.GOOGLE_CLOUD_LOCATION || "us-central1",
});

async function classify(batch) {
  const res = await ai.models.generateContent({
    model: MODEL,
    contents: JSON.stringify(batch.map((r) => ({ id: r.id, name: r.name }))),
    config: {
      systemInstruction: SYSTEM,
      temperature: 0,
      responseMimeType: "application/json",
    },
  });
  const raw = (res.text ?? "").trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  return JSON.parse(raw);
}

async function main() {
  if (!process.env.GOOGLE_CLOUD_PROJECT) throw new Error("GOOGLE_CLOUD_PROJECT missing");
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL missing");
  const sql = neon(process.env.DATABASE_URL);

  // Candidates: have a name, and no self-reported gender.
  const rows = await sql`
    SELECT u.id, COALESCE(p.display_name, u.name) AS name
    FROM "user" u
    JOIN profile p ON p.user_id = u.id
    WHERE (p.gender IS NULL OR p.gender_source = 'ai')
      AND COALESCE(p.display_name, u.name) IS NOT NULL
      AND btrim(COALESCE(p.display_name, u.name)) <> ''`;

  console.log(`candidates: ${rows.length} (model=${MODEL}${dry ? ", DRY RUN" : ""})`);
  const tally = { male: 0, female: 0, unknown: 0, written: 0 };

  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH).map((r) => ({
      id: r.id,
      name: String(r.name).trim().split(/\s+/)[0], // first name only
    }));
    let out;
    try {
      out = await classify(batch);
    } catch (e) {
      console.log("batch FAIL", i, e.message);
      continue;
    }
    for (const { id, g } of out) {
      if (g === "male" || g === "female") {
        tally[g]++;
        if (!dry) {
          await sql`UPDATE profile SET gender = ${g}, gender_source = 'ai', updated_at = now()
                    WHERE user_id = ${id} AND (gender IS NULL OR gender_source = 'ai')`;
          tally.written++;
        }
      } else {
        tally.unknown++;
      }
    }
    console.log(`  ${Math.min(i + BATCH, rows.length)}/${rows.length}…`);
  }

  console.log(
    `done: male ${tally.male}, female ${tally.female}, unknown ${tally.unknown}` +
      (dry ? " (nothing written)" : `, written ${tally.written}`)
  );
}

main().catch((e) => { console.error(e.message); process.exit(1); });
