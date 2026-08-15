/**
 * Translate all rich Georgian astrology SEO content from lib/seo/zodiac-content.json
 * into natural, comprehensive English using OpenRouter (Gemini 2.5 Flash).
 *
 * Saves output to lib/seo/zodiac-content-en.json
 *
 * Usage:
 *   node scripts/translate-zodiac-content-en.mjs
 *   node scripts/translate-zodiac-content-en.mjs --force
 */

import { config } from "dotenv";
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";

config({ path: ".env.local" });

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "google/gemini-2.5-flash";
const KEY = process.env.OPENROUTER_API_KEY;
if (!KEY) {
  console.error("OPENROUTER_API_KEY is not set in .env.local — aborting.");
  process.exit(1);
}

const SRC_PATH = resolve("lib/seo/zodiac-content.json");
const OUT_PATH = resolve("lib/seo/zodiac-content-en.json");
mkdirSync(dirname(OUT_PATH), { recursive: true });

const srcData = JSON.parse(readFileSync(SRC_PATH, "utf8"));
let outData = existsSync(OUT_PATH)
  ? JSON.parse(readFileSync(OUT_PATH, "utf8"))
  : {};

// Ensure top-level containers exist
outData.signs = outData.signs || {};
outData.elements = outData.elements || {};
outData.moons = outData.moons || {};
outData.risings = outData.risings || {};
outData.pairs = outData.pairs || {};
outData.yearly = outData.yearly || { "2026": {} };
outData.yearly["2026"] = outData.yearly["2026"] || {};

const force = process.argv.includes("--force");

async function callOpenRouter(systemPrompt, userPrompt) {
  let attempts = 0;
  while (attempts < 4) {
    try {
      attempts++;
      const res = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://vividaastro.com",
          "X-Title": "Vivida Content Translation",
        },
        body: JSON.stringify({
          model: MODEL,
          temperature: 0.3,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error(`HTTP ${res.status}: ${text}`);
        await new Promise((r) => setTimeout(r, 2000 * attempts));
        continue;
      }

      const json = await res.json();
      const raw = json.choices?.[0]?.message?.content;
      if (!raw) throw new Error("Empty response from LLM");
      return JSON.parse(raw);
    } catch (err) {
      console.warn(`Attempt ${attempts} failed: ${err.message}`);
      if (attempts >= 4) throw err;
      await new Promise((r) => setTimeout(r, 2000 * attempts));
    }
  }
}

function save() {
  writeFileSync(OUT_PATH, JSON.stringify(outData, null, 2), "utf8");
}

const TRANSLATE_PROMPT = `You are a master astrologer, psychologist, and professional English localization editor for Vivida (vividaastro.com).
Your task is to faithfully, directly, and beautifully translate the provided Georgian astrology JSON object into natural, modern, psychological, and rich English.

Rules:
1. Return ONLY a valid JSON object matching the exact keys and structures of the input. Do NOT change field names.
2. Maintain the exact same paragraph count, bullet count, and depth. Do NOT summarize, shorten, or simplify.
3. Translate all Georgian sign names, elements, modalities, and cultural phrases into standard English astrology terms (e.g., "ვერძი" -> "Aries", "კურო" -> "Taurus", "ცეცხლი" -> "Fire", "კარდინალური" -> "Cardinal", "მარსი" -> "Mars").
4. Maintain a warm, modern, empowering, second-person tone ("you").
5. Return purely the translated JSON. No markdown code fences.`;

async function mapConcurrent(items, concurrency, fn) {
  const results = [];
  let index = 0;
  async function worker() {
    while (index < items.length) {
      const i = index++;
      results[i] = await fn(items[i], i);
    }
  }
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

async function translateSigns() {
  console.log("\n--- Translating Zodiac Signs ---");
  const entries = Object.entries(srcData.signs || {});
  await mapConcurrent(entries, 4, async ([slug, item]) => {
    if (outData.signs[slug] && !force) {
      console.log(`✓ Sign ${slug} already translated`);
      return;
    }
    console.log(`Translating sign: ${slug}...`);
    const prompt = `Translate this full Georgian zodiac sign profile into English JSON.
Maintain the exact structure with keys: slug, labelEn, symbol, element, modality, ruler, dates, pageTitle, metaDescription, tagline, intro, personality, strengths, weaknesses, love, career, compatibility, famous, faq.
Note: In "compatibility", convert "signKa" to "signEn" (or keep key as signEn) and translate "level" ("ძლიერი" -> "Strong", "ჰარმონიული" -> "Harmonious", "გამომწვევი" -> "Challenging") and translate the note.

Source Georgian JSON:
${JSON.stringify(item, null, 2)}`;

    try {
      const translated = await callOpenRouter(TRANSLATE_PROMPT, prompt);
      translated.slug = slug;
      outData.signs[slug] = translated;
      save();
      console.log(`Saved sign ${slug}`);
    } catch (err) {
      console.error(`Error translating sign ${slug}:`, err.message);
    }
  });
}

async function translateElements() {
  console.log("\n--- Translating Elements ---");
  const entries = Object.entries(srcData.elements || {});
  await mapConcurrent(entries, 4, async ([slug, item]) => {
    if (outData.elements[slug] && !force) {
      console.log(`✓ Element ${slug} already translated`);
      return;
    }
    console.log(`Translating element: ${slug}...`);
    const prompt = `Translate this full Georgian element guide into English JSON.
Maintain keys: slug, labelEn, signs, pageTitle, metaDescription, tagline, intro, personality, strengths, weaknesses, love, career, compatibility, faq.

Source Georgian JSON:
${JSON.stringify(item, null, 2)}`;

    try {
      const translated = await callOpenRouter(TRANSLATE_PROMPT, prompt);
      translated.slug = slug;
      outData.elements[slug] = translated;
      save();
      console.log(`Saved element ${slug}`);
    } catch (err) {
      console.error(`Error translating element ${slug}:`, err.message);
    }
  });
}

async function translateMoons() {
  console.log("\n--- Translating Moon Signs ---");
  const entries = Object.entries(srcData.moons || {});
  await mapConcurrent(entries, 4, async ([slug, item]) => {
    if (outData.moons[slug] && !force) {
      console.log(`✓ Moon sign ${slug} already translated`);
      return;
    }
    console.log(`Translating moon sign: ${slug}...`);
    const prompt = `Translate this full Georgian Moon sign guide into English JSON.
Maintain keys: slug, labelEn, symbol, pageTitle, metaDescription, tagline, intro, emotionalCore, love, shadow, compatibility, famous, faq.

Source Georgian JSON:
${JSON.stringify(item, null, 2)}`;

    try {
      const translated = await callOpenRouter(TRANSLATE_PROMPT, prompt);
      translated.slug = slug;
      outData.moons[slug] = translated;
      save();
      console.log(`Saved moon sign ${slug}`);
    } catch (err) {
      console.error(`Error translating moon ${slug}:`, err.message);
    }
  });
}

async function translateRisings() {
  console.log("\n--- Translating Rising Signs ---");
  const entries = Object.entries(srcData.risings || {});
  await mapConcurrent(entries, 4, async ([slug, item]) => {
    if (outData.risings[slug] && !force) {
      console.log(`✓ Rising sign ${slug} already translated`);
      return;
    }
    console.log(`Translating rising sign: ${slug}...`);
    const prompt = `Translate this full Georgian Rising sign (Ascendant) guide into English JSON.
Maintain keys: slug, labelEn, symbol, pageTitle, metaDescription, tagline, intro, firstImpression, appearance, approach, bestPaired, famous, faq.

Source Georgian JSON:
${JSON.stringify(item, null, 2)}`;

    try {
      const translated = await callOpenRouter(TRANSLATE_PROMPT, prompt);
      translated.slug = slug;
      outData.risings[slug] = translated;
      save();
      console.log(`Saved rising sign ${slug}`);
    } catch (err) {
      console.error(`Error translating rising ${slug}:`, err.message);
    }
  });
}

async function translatePairs() {
  console.log("\n--- Translating Compatibility Pairs ---");
  const entries = Object.entries(srcData.pairs || {});
  
  await mapConcurrent(entries, 6, async ([slug, item], i) => {
    if (outData.pairs[slug] && !force) {
      console.log(`✓ Pair (${i + 1}/${entries.length}) ${slug} already translated`);
      return;
    }
    console.log(`Translating pair (${i + 1}/${entries.length}): ${slug}...`);
    const prompt = `Translate this full Georgian compatibility pair profile into English JSON.
Maintain keys: slug, signA, signB, labelA, labelB, pageTitle, metaDescription, tagline, overallScore, overall, love, friendship, communication, strengths, challenges, verdict, faq.
Note: Translate overallScore to "Strong" | "Harmonious" | "Challenging" (from "ძლიერი" | "ჰარმონიული" | "გამომწვევი").

Source Georgian JSON:
${JSON.stringify(item, null, 2)}`;

    try {
      const translated = await callOpenRouter(TRANSLATE_PROMPT, prompt);
      translated.slug = slug;
      outData.pairs[slug] = translated;
      save();
      console.log(`Saved pair ${slug} (${i + 1}/${entries.length})`);
    } catch (err) {
      console.error(`Failed pair ${slug}:`, err.message);
    }
  });
}

async function translateYearly() {
  console.log("\n--- Translating 2026 Yearly Horoscopes ---");
  const entries = Object.entries(srcData.yearly?.["2026"] || {});
  await mapConcurrent(entries, 4, async ([slug, item]) => {
    if (outData.yearly["2026"][slug] && !force) {
      console.log(`✓ Yearly 2026 ${slug} already translated`);
      return;
    }
    console.log(`Translating 2026 yearly horoscope: ${slug}...`);
    const prompt = `Translate this full Georgian 2026 yearly horoscope into English JSON.
Maintain keys: slug, year, labelEn, pageTitle, metaDescription, tagline, overview, love, career, money, health, growth, bestMonths, hardMonths, keyDates, faq.
Note: For bestMonths and hardMonths, use standard English month names (e.g. "April", "August").
For love, career, money, health, growth, maintain objects { "title": string, "body": string }.
For keyDates, maintain array of { "date": string, "note": string }.

Source Georgian JSON:
${JSON.stringify(item, null, 2)}`;

    try {
      const translated = await callOpenRouter(TRANSLATE_PROMPT, prompt);
      translated.slug = slug;
      translated.year = 2026;
      outData.yearly["2026"][slug] = translated;
      save();
      console.log(`Saved 2026 yearly for ${slug}`);
    } catch (err) {
      console.error(`Failed yearly ${slug}:`, err.message);
    }
  });
}

async function translateHubs() {
  console.log("\n--- Translating Hubs ---");
  const hubs = ["hub", "elementsHub", "compatibilityHub", "moonHub", "risingHub", "byDate"];
  for (const hubKey of hubs) {
    if (srcData[hubKey] && (!outData[hubKey] || force)) {
      console.log(`Translating hub: ${hubKey}...`);
      const prompt = `Translate this Georgian hub content into English JSON with the exact same keys and structure.

Source Georgian JSON:
${JSON.stringify(srcData[hubKey], null, 2)}`;
      const translated = await callOpenRouter(TRANSLATE_PROMPT, prompt);
      outData[hubKey] = translated;
      save();
      console.log(`Saved hub ${hubKey}`);
    }
  }
}

async function main() {
  console.log("Starting full direct translation of zodiac-content.json to English...");
  await translateSigns();
  await translateElements();
  await translateMoons();
  await translateRisings();
  await translateYearly();
  await translateHubs();
  await translatePairs();
  console.log("\n✅ ALL TRANSLATIONS COMPLETED SUCCESSFULLY!");
}

main().catch((err) => {
  console.error("FATAL ERROR during translation:", err);
  process.exit(1);
});
