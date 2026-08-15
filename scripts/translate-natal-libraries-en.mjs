import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { neon } from "@neondatabase/serverless";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

try {
  const envContent = fs.readFileSync(path.join(rootDir, ".env.local"), "utf8");
  for (const line of envContent.split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
} catch {}

const sql = neon(process.env.DATABASE_URL);
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "google/gemini-2.5-flash";
const API_KEY = process.env.OPENROUTER_API_KEY;

if (!API_KEY) {
  console.error("Missing OPENROUTER_API_KEY");
  process.exit(1);
}

const SYSTEM_PROMPT =
  "You are an expert psychological astrologer, literary translator, and prose stylist. " +
  "Translate the provided Georgian natal chart interpretation directly, faithfully, and completely into natural, rich, psychological English. " +
  "Preserve all nuances, second-person voice (you/your), tone, metaphors, and practical guidance without summarizing or shortening. " +
  "Output only the translated English text with no quotes, commentary, markdown headings, or code fences.";

async function translateText(text) {
  if (!text || text.trim().length === 0) return "";
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const res = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
          "HTTP-Referer": "https://vivida.ge",
          "X-Title": "Vivida Natal Translations",
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: text },
          ],
          temperature: 0.3,
        }),
        signal: AbortSignal.timeout(45000),
      });

      if (!res.ok) {
        const errTxt = await res.text();
        console.warn(`[HTTP ${res.status}] Attempt ${attempt + 1} failed: ${errTxt.slice(0, 100)}`);
        await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
        continue;
      }

      const json = await res.json();
      const content = json.choices?.[0]?.message?.content?.trim();
      if (!content) throw new Error("Empty translation returned");
      return content.replace(/^```(?:json|markdown)?\s*/i, "").replace(/\s*```$/, "").trim();
    } catch (err) {
      console.warn(`[Error] Attempt ${attempt + 1}: ${err.message}`);
      await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
    }
  }
  throw new Error("Failed to translate after 5 attempts");
}

async function runWorkerPool(items, workerFn, concurrency = 12) {
  let index = 0;
  const total = items.length;
  let completed = 0;

  async function worker() {
    while (index < total) {
      const currentIndex = index++;
      const item = items[currentIndex];
      try {
        await workerFn(item, currentIndex);
      } catch (err) {
        console.error(`Error on item ${currentIndex}:`, err);
      }
      completed++;
      if (completed % 25 === 0 || completed === total) {
        console.log(`Progress: ${completed}/${total} (${Math.round((completed / total) * 100)}%)`);
      }
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, total) }, () => worker());
  await Promise.all(workers);
}

async function main() {
  console.log("=== Translating Natal Interpretation Libraries to English ===");

  // 1. Placements (132 rows)
  const interpFile = path.join(rootDir, "lib/seo/interpretation-library-en.json");
  let interpEn = {};
  if (fs.existsSync(interpFile)) {
    try {
      interpEn = JSON.parse(fs.readFileSync(interpFile, "utf8"));
    } catch {}
  }
  const interpRows = await sql`SELECT key, body FROM interpretation_library`;
  console.log(`Fetched ${interpRows.length} interpretation_library rows from DB.`);
  const missingInterps = interpRows.filter((r) => !interpEn[r.key] || interpEn[r.key].length < 50);
  console.log(`Missing/incomplete placements to translate: ${missingInterps.length}`);

  if (missingInterps.length > 0) {
    await runWorkerPool(missingInterps, async (row) => {
      const translated = await translateText(row.body);
      interpEn[row.key] = translated;
      if (Math.random() < 0.1) {
        fs.writeFileSync(interpFile, JSON.stringify(interpEn, null, 2));
      }
    }, 12);
    fs.writeFileSync(interpFile, JSON.stringify(interpEn, null, 2));
    console.log(`Saved ${Object.keys(interpEn).length} placements to ${interpFile}`);
  }

  // 2. House library (276 rows)
  const houseFile = path.join(rootDir, "lib/seo/house-library-en.json");
  let houseEn = {};
  if (fs.existsSync(houseFile)) {
    try {
      houseEn = JSON.parse(fs.readFileSync(houseFile, "utf8"));
    } catch {}
  }
  const houseRows = await sql`SELECT key, body FROM house_interpretation_library`;
  console.log(`Fetched ${houseRows.length} house_interpretation_library rows from DB.`);
  const missingHouses = houseRows.filter((r) => !houseEn[r.key] || houseEn[r.key].length < 50);
  console.log(`Missing/incomplete houses to translate: ${missingHouses.length}`);

  if (missingHouses.length > 0) {
    await runWorkerPool(missingHouses, async (row) => {
      const translated = await translateText(row.body);
      houseEn[row.key] = translated;
      if (Math.random() < 0.1) {
        fs.writeFileSync(houseFile, JSON.stringify(houseEn, null, 2));
      }
    }, 12);
    fs.writeFileSync(houseFile, JSON.stringify(houseEn, null, 2));
    console.log(`Saved ${Object.keys(houseEn).length} houses to ${houseFile}`);
  }

  // 3. Aspect library (390 rows)
  const aspectFile = path.join(rootDir, "lib/seo/aspect-library-en.json");
  let aspectEn = {};
  if (fs.existsSync(aspectFile)) {
    try {
      aspectEn = JSON.parse(fs.readFileSync(aspectFile, "utf8"));
    } catch {}
  }
  const aspectRows = await sql`SELECT key, body FROM aspect_interpretation_library`;
  console.log(`Fetched ${aspectRows.length} aspect_interpretation_library rows from DB.`);
  const missingAspects = aspectRows.filter((r) => !aspectEn[r.key] || aspectEn[r.key].length < 50);
  console.log(`Missing/incomplete aspects to translate: ${missingAspects.length}`);

  if (missingAspects.length > 0) {
    await runWorkerPool(missingAspects, async (row) => {
      const translated = await translateText(row.body);
      aspectEn[row.key] = translated;
      if (Math.random() < 0.1) {
        fs.writeFileSync(aspectFile, JSON.stringify(aspectEn, null, 2));
      }
    }, 12);
    fs.writeFileSync(aspectFile, JSON.stringify(aspectEn, null, 2));
    console.log(`Saved ${Object.keys(aspectEn).length} aspects to ${aspectFile}`);
  }

  console.log("=== All Natal Interpretation Libraries Successfully Translated! ===");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
