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
  "You are an expert psychological astrologer, literary translator, and synastry (compatibility) specialist. " +
  "Translate the provided Georgian synastry text directly, faithfully, and completely into natural, rich, psychological English. " +
  "Preserve all nuances, tone, relationship dynamics, and practical advice without summarizing or shortening. " +
  "Output only the translated English text with no quotes, commentary, markdown headings, or code fences.";

const SYSTEM_PROMPT_JSON =
  "You are an expert psychological astrologer, literary translator, and synastry specialist. " +
  "Translate the provided Georgian synastry aspect detail (which has 'positive', 'negative', and 'takeaway' fields) directly and faithfully into natural, rich, psychological English. " +
  "Return only a valid JSON object with the exact same keys: positive, negative, takeaway. Do not use markdown code fences.";

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
          "X-Title": "Vivida Synastry Translations",
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

async function translateAspectJson(item) {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const res = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
          "HTTP-Referer": "https://vivida.ge",
          "X-Title": "Vivida Synastry JSON Translations",
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: "system", content: SYSTEM_PROMPT_JSON },
            { role: "user", content: JSON.stringify(item) },
          ],
          response_format: { type: "json_object" },
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
      const clean = content.replace(/^```(?:json|markdown)?\s*/i, "").replace(/\s*```$/, "").trim();
      const parsed = JSON.parse(clean);
      if (!parsed.positive || !parsed.negative || !parsed.takeaway) {
        throw new Error("Missing fields in translated JSON");
      }
      return parsed;
    } catch (err) {
      console.warn(`[Error] Attempt ${attempt + 1}: ${err.message}`);
      await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
    }
  }
  throw new Error("Failed to translate aspect JSON after 5 attempts");
}

async function runWorkerPool(items, workerFn, concurrency = 16) {
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
  console.log("=== Translating Synastry Interpretations to English ===");

  // 1. synastry_interpretation_library (611 rows)
  const libFile = path.join(rootDir, "lib/seo/synastry-library-en.json");
  let libEn = {};
  if (fs.existsSync(libFile)) {
    try {
      libEn = JSON.parse(fs.readFileSync(libFile, "utf8"));
    } catch {}
  }
  const libRows = await sql`SELECT key, body FROM synastry_interpretation_library`;
  console.log(`Fetched ${libRows.length} synastry_interpretation_library rows from DB.`);
  const missingLib = libRows.filter((r) => !libEn[r.key] || libEn[r.key].length < 30);
  console.log(`Missing synastry library rows to translate: ${missingLib.length}`);

  if (missingLib.length > 0) {
    await runWorkerPool(missingLib, async (row) => {
      const translated = await translateText(row.body);
      libEn[row.key] = translated;
      if (Math.random() < 0.1) {
        fs.writeFileSync(libFile, JSON.stringify(libEn, null, 2));
      }
    }, 16);
    fs.writeFileSync(libFile, JSON.stringify(libEn, null, 2));
    console.log(`Saved ${Object.keys(libEn).length} synastry library entries to ${libFile}`);
  }

  // 2. synastry-aspects.json (455 items)
  const aspectsEnFile = path.join(rootDir, "lib/seo/synastry-aspects-en.json");
  let aspectsEn = {};
  if (fs.existsSync(aspectsEnFile)) {
    try {
      aspectsEn = JSON.parse(fs.readFileSync(aspectsEnFile, "utf8"));
    } catch {}
  }
  const aspectsKaPath = path.join(rootDir, "lib/seo/synastry-aspects.json");
  const aspectsKa = JSON.parse(fs.readFileSync(aspectsKaPath, "utf8"));
  const aspectEntries = Object.entries(aspectsKa).map(([key, val]) => ({ key, ...val }));
  console.log(`Loaded ${aspectEntries.length} synastry aspect detail items.`);
  const missingAspects = aspectEntries.filter(
    (a) => !aspectsEn[a.key] || !aspectsEn[a.key].positive || !aspectsEn[a.key].takeaway
  );
  console.log(`Missing synastry aspect detail items to translate: ${missingAspects.length}`);

  if (missingAspects.length > 0) {
    await runWorkerPool(missingAspects, async (item) => {
      const translated = await translateAspectJson({
        positive: item.positive,
        negative: item.negative,
        takeaway: item.takeaway,
      });
      aspectsEn[item.key] = translated;
      if (Math.random() < 0.1) {
        fs.writeFileSync(aspectsEnFile, JSON.stringify(aspectsEn, null, 2));
      }
    }, 16);
    fs.writeFileSync(aspectsEnFile, JSON.stringify(aspectsEn, null, 2));
    console.log(`Saved ${Object.keys(aspectsEn).length} synastry aspect details to ${aspectsEnFile}`);
  }

  console.log("=== All Synastry Translations Completed Successfully! ===");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
