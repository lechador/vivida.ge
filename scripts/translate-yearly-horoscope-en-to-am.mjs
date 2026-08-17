/**
 * Translate the English 2026 yearly horoscope cluster into Armenian.
 *
 * Usage:
 *   node scripts/translate-yearly-horoscope-en-to-am.mjs
 *   node scripts/translate-yearly-horoscope-en-to-am.mjs --force
 *   node scripts/translate-yearly-horoscope-en-to-am.mjs --proofread
 */

import { config } from "dotenv";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

config({ path: ".env.local" });

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "google/gemini-2.5-flash";
const KEY = process.env.OPENROUTER_API_KEY;
const FORCE = process.argv.includes("--force");
const PROOFREAD = process.argv.includes("--proofread");
const SOURCE_PATH = resolve("lib/seo/zodiac-content-en.json");
const TRANSLATION_CHECKPOINT_PATH = resolve(
  ".next/translation-cache/yearly-horoscope-am.json",
);
const CHECKPOINT_PATH = resolve(
  PROOFREAD
    ? ".next/translation-cache/yearly-horoscope-am-proofread.json"
    : ".next/translation-cache/yearly-horoscope-am.json",
);
const OUT_PATH = resolve("lib/seo/yearly-horoscope-am.json");

if (!KEY) {
  console.error("OPENROUTER_API_KEY is not set in .env.local — aborting.");
  process.exit(1);
}

const source = JSON.parse(readFileSync(SOURCE_PATH, "utf8")).yearly["2026"];
let translationDrafts = null;
if (PROOFREAD) {
  if (!existsSync(TRANSLATION_CHECKPOINT_PATH)) {
    throw new Error("Run the translation pass before --proofread.");
  }
  translationDrafts = JSON.parse(
    readFileSync(TRANSLATION_CHECKPOINT_PATH, "utf8"),
  );
}
let checkpoint = {};
if (!FORCE && existsSync(CHECKPOINT_PATH)) {
  checkpoint = JSON.parse(readFileSync(CHECKPOINT_PATH, "utf8"));
}

const SYSTEM_PROMPT = `You are a professional Eastern Armenian localization editor with expertise in astrology.
Translate the supplied English yearly horoscope into natural, publication-quality Eastern Armenian.

Rules:
1. Return ONLY a valid JSON object with exactly the same keys, nested object shape, and array lengths as the source.
2. Never summarize, shorten, merge, add, or omit any paragraph, section, month, date, or FAQ.
3. Preserve slug and year exactly. Translate every other human-readable string, including labelEn, headings, month names, and dates.
4. Preserve all numbers, years, zodiac concepts, punctuation meaning, {placeholders}, HTML, and Markdown tokens. Do not invent claims.
5. Write fluent, idiomatic contemporary Eastern Armenian in a warm editorial tone. Avoid Russianisms, literal English calques, and awkward machine-translation phrasing.
6. Use Armenian zodiac names consistently: Aries = Խոյ, Taurus = Ցուլ, Gemini = Երկվորյակ, Cancer = Խեցգետին, Leo = Առյուծ, Virgo = Կույս, Libra = Կշեռք, Scorpio = Կարիճ, Sagittarius = Աղեղնավոր, Capricorn = Այծեղջյուր, Aquarius = Ջրհոս, Pisces = Ձկներ.
7. Use the Armenian full stop “։” (U+0589) for sentence endings. Proofread spelling, agreement, case endings, and naturalness before returning JSON.`;

const PROOFREAD_PROMPT = `You are the senior Eastern Armenian copy editor for an astrology publication.
You will receive an English source horoscope and a structurally matching Armenian draft. Rewrite the Armenian draft into fluent, idiomatic, publication-quality Eastern Armenian while preserving every idea in the English source.

Rules:
1. Return ONLY a valid JSON object with exactly the same keys, nested object shape, key order, and array lengths as the English source.
2. Never summarize, shorten, merge, add, or omit any paragraph, section, month, date, or FAQ.
3. Treat the English as the meaning source and the Armenian as a draft to copy-edit. Correct mistranslations, spelling, agreement, case, word order, unnatural capitalization, awkward collocations, and literal English calques.
4. Preserve slug and year exactly. Translate every other human-readable string. Preserve all numbers, concepts, {placeholders}, HTML, and Markdown tokens.
5. Make the prose sound as if it was originally written by an educated native Eastern Armenian editor. Address the reader consistently in the polite plural without gratuitous capitalization.
6. Use the Armenian full stop “։” (U+0589), not ASCII period or colon, for sentence endings and heading punctuation.
7. Use Armenian zodiac names consistently: Խոյ, Ցուլ, Երկվորյակ, Խեցգետին, Առյուծ, Կույս, Կշեռք, Կարիճ, Աղեղնավոր, Այծեղջյուր, Ջրհոս, Ձկներ.`;

function markupTokens(value) {
  return value.match(/\{[^{}]+\}|<[^>]+>/g) ?? [];
}

function numericTokens(value) {
  return value.match(/\d+(?:[.,]\d+)?/g) ?? [];
}

function normalizeArmenianPunctuation(value) {
  if (typeof value === "string") {
    return value.replace(/[.:](?=\s|$)/gu, "։");
  }
  if (Array.isArray(value)) return value.map(normalizeArmenianPunctuation);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [
        key,
        key === "slug" ? child : normalizeArmenianPunctuation(child),
      ]),
    );
  }
  return value;
}

function validate(sourceValue, translatedValue, path = "root") {
  if (typeof sourceValue === "string") {
    if (typeof translatedValue !== "string" || !translatedValue.trim()) {
      throw new Error(`${path} must be a non-empty string`);
    }
    if (/[Ⴀ-ჿ]/u.test(translatedValue)) {
      throw new Error(`${path} contains Georgian text`);
    }
    if (path.endsWith(".slug")) {
      if (translatedValue !== sourceValue) throw new Error(`${path} changed`);
      return;
    }
    if (!/[Ա-֏]/u.test(translatedValue)) {
      throw new Error(`${path} contains no Armenian text`);
    }
    if (PROOFREAD && /[.:]/u.test(translatedValue)) {
      throw new Error(`${path} contains ASCII sentence punctuation`);
    }
    if (
      JSON.stringify(markupTokens(sourceValue)) !==
      JSON.stringify(markupTokens(translatedValue))
    ) {
      throw new Error(`${path} changed markup or placeholder tokens`);
    }
    if (
      JSON.stringify(numericTokens(sourceValue)) !==
      JSON.stringify(numericTokens(translatedValue))
    ) {
      throw new Error(`${path} changed numeric tokens`);
    }
    return;
  }
  if (typeof sourceValue === "number") {
    if (translatedValue !== sourceValue) throw new Error(`${path} changed`);
    return;
  }
  if (Array.isArray(sourceValue)) {
    if (
      !Array.isArray(translatedValue) ||
      translatedValue.length !== sourceValue.length
    ) {
      throw new Error(`${path} array length differs`);
    }
    sourceValue.forEach((value, index) =>
      validate(value, translatedValue[index], `${path}[${index}]`),
    );
    return;
  }
  if (
    !translatedValue ||
    typeof translatedValue !== "object" ||
    Array.isArray(translatedValue)
  ) {
    throw new Error(`${path} must be an object`);
  }
  const sourceKeys = Object.keys(sourceValue);
  const translatedKeys = Object.keys(translatedValue);
  if (JSON.stringify(translatedKeys) !== JSON.stringify(sourceKeys)) {
    throw new Error(`${path} object keys or order differ`);
  }
  for (const key of sourceKeys) {
    validate(sourceValue[key], translatedValue[key], `${path}.${key}`);
  }
}

async function translate(sign, value) {
  let lastError;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const response = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://vividaastro.com",
          "X-Title": "Vivida Armenian Yearly Horoscope Translation",
        },
        body: JSON.stringify({
          model: MODEL,
          temperature: 0.2,
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content: PROOFREAD ? PROOFREAD_PROMPT : SYSTEM_PROMPT,
            },
            {
              role: "user",
              content: JSON.stringify(
                PROOFREAD
                  ? {
                      englishSource: value,
                      armenianDraft: translationDrafts[sign],
                    }
                  : value,
                null,
                2,
              ),
            },
          ],
        }),
        signal: AbortSignal.timeout(120_000),
      });
      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}: ${(await response.text()).slice(0, 240)}`,
        );
      }
      const payload = await response.json();
      const raw = payload.choices?.[0]?.message?.content;
      if (!raw) throw new Error("empty model response");
      const translated = PROOFREAD
        ? normalizeArmenianPunctuation(JSON.parse(raw))
        : JSON.parse(raw);
      validate(value, translated, sign);
      return translated;
    } catch (error) {
      lastError = error;
      console.warn(`${sign}: attempt ${attempt} failed — ${error.message}`);
      if (attempt < 4) {
        await new Promise((resolvePromise) =>
          setTimeout(resolvePromise, attempt * 2_000),
        );
      }
    }
  }
  throw lastError;
}

function saveCheckpoint() {
  mkdirSync(dirname(CHECKPOINT_PATH), { recursive: true });
  writeFileSync(
    CHECKPOINT_PATH,
    `${JSON.stringify(checkpoint, null, 2)}\n`,
    "utf8",
  );
}

const entries = Object.entries(source);
let nextIndex = 0;
const worker = async () => {
  while (nextIndex < entries.length) {
    const index = nextIndex;
    nextIndex += 1;
    const [sign, value] = entries[index];
    if (!FORCE && checkpoint[sign]) {
      try {
        validate(value, checkpoint[sign], sign);
        console.log(`✓ ${sign} already translated`);
        continue;
      } catch {
        delete checkpoint[sign];
      }
    }
    console.log(
      `${PROOFREAD ? "Proofreading" : "Translating"} ${index + 1}/${entries.length}: ${sign}`,
    );
    checkpoint[sign] = await translate(sign, value);
    saveCheckpoint();
    console.log(`Saved ${sign}`);
  }
};

await Promise.all(Array.from({ length: 3 }, () => worker()));

const output = {};
for (const [sign, value] of entries) {
  if (!checkpoint[sign]) throw new Error(`missing translation for ${sign}`);
  validate(value, checkpoint[sign], sign);
  output[sign] = checkpoint[sign];
}
writeFileSync(OUT_PATH, `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(`Wrote ${OUT_PATH}`);
