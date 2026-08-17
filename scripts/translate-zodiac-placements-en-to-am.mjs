/**
 * Translate Moon signs, rising signs, elements, and their supporting hubs.
 *
 * Usage:
 *   node scripts/translate-zodiac-placements-en-to-am.mjs
 *   node scripts/translate-zodiac-placements-en-to-am.mjs --proofread
 *   node scripts/translate-zodiac-placements-en-to-am.mjs --force
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
  ".next/translation-cache/zodiac-placements-am.json",
);
const CHECKPOINT_PATH = resolve(
  PROOFREAD
    ? ".next/translation-cache/zodiac-placements-am-proofread.json"
    : ".next/translation-cache/zodiac-placements-am.json",
);
const OUT_PATH = resolve("lib/seo/zodiac-placements-am.json");
const DETAIL_KEYS = ["moons", "risings", "elements"];
const HUB_KEYS = ["moonHub", "risingHub", "elementsHub", "byDate"];
const SIGN_LABEL_AM = {
  aries: "Խոյ",
  taurus: "Ցուլ",
  gemini: "Երկվորյակ",
  cancer: "Խեցգետին",
  leo: "Առյուծ",
  virgo: "Կույս",
  libra: "Կշեռք",
  scorpio: "Կարիճ",
  sagittarius: "Աղեղնավոր",
  capricorn: "Այծեղջյուր",
  aquarius: "Ջրհոս",
  pisces: "Ձկներ",
};
const ELEMENT_LABEL_AM = {
  fire: "Կրակ",
  earth: "Հող",
  air: "Օդ",
  water: "Ջուր",
};

if (!KEY) {
  console.error("OPENROUTER_API_KEY is not set in .env.local — aborting.");
  process.exit(1);
}

const dataset = JSON.parse(readFileSync(SOURCE_PATH, "utf8"));
const jobs = [
  ...DETAIL_KEYS.flatMap((section) =>
    Object.entries(dataset[section]).map(([id, value]) => ({
      key: `${section}:${id}`,
      section,
      id,
      value,
    })),
  ),
  ...HUB_KEYS.map((section) => ({
    key: section,
    section,
    id: null,
    value: dataset[section],
  })),
];

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

const TRANSLATE_PROMPT = `You are a professional Eastern Armenian localization editor with expertise in Western astrology.
Translate the supplied English zodiac content object into natural, publication-quality Eastern Armenian.

Rules:
1. Return ONLY a valid JSON object with exactly the same keys, nested shape, key order, and array lengths as the source.
2. Never summarize, shorten, merge, add, or omit any paragraph, section, list item, famous person, or FAQ.
3. Preserve machine identifiers (slug), zodiac-sign slug arrays (signs), and symbol glyphs exactly. Translate or naturally transliterate every other human-readable string, including labelEn, headings, element names, dates, and famous names.
4. Preserve all numbers, {placeholders}, HTML, and Markdown tokens. Do not invent claims.
5. Write fluent, idiomatic contemporary Eastern Armenian in a warm editorial tone. Avoid Russianisms, literal English calques, and awkward machine-translation phrasing.
6. Use terminology consistently: Moon sign = Լուսնի նշան; rising sign / Ascendant = ասցենդենտ; Sun sign = Արեգակի նշան; Fire = Կրակ; Earth = Հող; Air = Օդ; Water = Ջուր; compatibility = համատեղելիություն; birth chart = նատալ քարտեզ.
7. Use Armenian zodiac names consistently: Խոյ, Ցուլ, Երկվորյակ, Խեցգետին, Առյուծ, Կույս, Կշեռք, Կարիճ, Աղեղնավոր, Այծեղջյուր, Ջրհոս, Ձկներ.
8. Use the Armenian full stop “։” (U+0589), not ASCII period or colon, for sentence endings and heading punctuation. Proofread before returning JSON.`;

const PROOFREAD_PROMPT = `You are the senior Eastern Armenian copy editor for an astrology publication.
You will receive an English source object and a structurally matching Armenian draft. Rewrite the draft into fluent, idiomatic, publication-quality Eastern Armenian while preserving every idea in the English source.

Rules:
1. Return ONLY a valid JSON object with exactly the same keys, nested shape, key order, and array lengths as the English source.
2. Never summarize, shorten, merge, add, or omit any paragraph, section, list item, famous person, or FAQ.
3. Correct mistranslations, spelling, agreement, case, word order, unnatural capitalization, awkward collocations, and literal English calques. Address the reader consistently and naturally.
4. Preserve slug, signs arrays, and symbol glyphs exactly. Preserve every number, concept, {placeholder}, HTML, and Markdown token. Translate or naturally transliterate every other human-readable string.
5. Use terminology consistently: Լուսնի նշան, ասցենդենտ, Արեգակի նշան, Կրակ, Հող, Օդ, Ջուր, համատեղելիություն, նատալ քարտեզ.
6. Use Armenian zodiac names consistently: Խոյ, Ցուլ, Երկվորյակ, Խեցգետին, Առյուծ, Կույս, Կշեռք, Կարիճ, Աղեղնավոր, Այծեղջյուր, Ջրհոս, Ձկներ.
7. Use the Armenian full stop “։” (U+0589), not ASCII period or colon, for sentence endings and heading punctuation.`;

function markupTokens(value) {
  return value.match(/\{[^{}]+\}|<[^>]+>/g) ?? [];
}

function numericTokens(value) {
  return value.match(/\d+(?:[.,]\d+)?/g) ?? [];
}

function isMachineValue(path) {
  return (
    path.endsWith(".slug") ||
    path.endsWith(".symbol") ||
    /\.signs\[\d+\]$/u.test(path)
  );
}

function normalizeArmenianPunctuation(value, path = "root") {
  if (typeof value === "string") {
    return isMachineValue(path) ? value : value.replace(/[.:](?=\s|$)/gu, "։");
  }
  if (Array.isArray(value)) {
    return value.map((child, index) =>
      normalizeArmenianPunctuation(child, `${path}[${index}]`),
    );
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [
        key,
        normalizeArmenianPunctuation(child, `${path}.${key}`),
      ]),
    );
  }
  return value;
}

function normalizeKnownLabels(value, job) {
  if (!value || typeof value !== "object" || job.id == null) return value;
  if (job.section === "moons" || job.section === "risings") {
    return { ...value, labelEn: SIGN_LABEL_AM[job.id] };
  }
  if (job.section === "elements") {
    return { ...value, labelEn: ELEMENT_LABEL_AM[job.id] };
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
    if (isMachineValue(path)) {
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
  if (typeof sourceValue === "number" || typeof sourceValue === "boolean") {
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

async function translate(job) {
  let lastError;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const response = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://vividaastro.com",
          "X-Title": "Vivida Armenian Zodiac Placement Translation",
        },
        body: JSON.stringify({
          model: MODEL,
          temperature: 0.2,
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content: PROOFREAD ? PROOFREAD_PROMPT : TRANSLATE_PROMPT,
            },
            {
              role: "user",
              content: JSON.stringify(
                PROOFREAD
                  ? {
                      englishSource: job.value,
                      armenianDraft: translationDrafts[job.key],
                    }
                  : job.value,
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
      const parsed = normalizeKnownLabels(JSON.parse(raw), job);
      const translated = PROOFREAD
        ? normalizeArmenianPunctuation(parsed, job.key)
        : parsed;
      validate(job.value, translated, job.key);
      return translated;
    } catch (error) {
      lastError = error;
      console.warn(`${job.key}: attempt ${attempt} failed — ${error.message}`);
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

let nextIndex = 0;
const worker = async () => {
  while (nextIndex < jobs.length) {
    const index = nextIndex;
    nextIndex += 1;
    const job = jobs[index];
    if (!FORCE && checkpoint[job.key]) {
      try {
        validate(job.value, checkpoint[job.key], job.key);
        console.log(`✓ ${job.key} already translated`);
        continue;
      } catch {
        delete checkpoint[job.key];
      }
    }
    console.log(
      `${PROOFREAD ? "Proofreading" : "Translating"} ${index + 1}/${jobs.length}: ${job.key}`,
    );
    checkpoint[job.key] = await translate(job);
    saveCheckpoint();
    console.log(`Saved ${job.key}`);
  }
};

await Promise.all(Array.from({ length: 3 }, () => worker()));

const output = Object.fromEntries(
  [...DETAIL_KEYS, ...HUB_KEYS].map((key) => [
    key,
    DETAIL_KEYS.includes(key) ? {} : null,
  ]),
);
for (const job of jobs) {
  const translated = checkpoint[job.key];
  if (!translated) throw new Error(`missing translation for ${job.key}`);
  validate(job.value, translated, job.key);
  if (job.id == null) output[job.section] = translated;
  else output[job.section][job.id] = translated;
}

writeFileSync(OUT_PATH, `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(`Wrote ${OUT_PATH}`);
