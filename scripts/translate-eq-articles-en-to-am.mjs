/**
 * Translate the English EQ article cluster into Armenian with strict shape
 * validation and a resume-on-rerun checkpoint.
 *
 * Usage:
 *   node --experimental-strip-types scripts/translate-eq-articles-en-to-am.mjs
 *   node --experimental-strip-types scripts/translate-eq-articles-en-to-am.mjs --force
 *   node --experimental-strip-types scripts/translate-eq-articles-en-to-am.mjs --proofread
 */

import { config } from "dotenv";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";

config({ path: ".env.local" });

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "google/gemini-2.5-flash";
const KEY = process.env.OPENROUTER_API_KEY;
const FORCE = process.argv.includes("--force");
const PROOFREAD = process.argv.includes("--proofread");
const TRANSLATION_CHECKPOINT_PATH = resolve(
  ".next/translation-cache/eq-articles-am.json",
);
const CHECKPOINT_PATH = resolve(
  PROOFREAD
    ? ".next/translation-cache/eq-articles-am-proofread.json"
    : ".next/translation-cache/eq-articles-am.json",
);
const OUT_PATH = resolve("lib/seo/eq-articles-am.ts");

if (!KEY) {
  console.error("OPENROUTER_API_KEY is not set in .env.local — aborting.");
  process.exit(1);
}

const sourceModule = await import(
  pathToFileURL(resolve("lib/seo/eq-articles-en.ts")).href
);
const sourceArticles = sourceModule.EQ_ARTICLES_EN;

let checkpoint = {};
if (!FORCE && existsSync(CHECKPOINT_PATH)) {
  checkpoint = JSON.parse(readFileSync(CHECKPOINT_PATH, "utf8"));
}

const TRANSLATE_PROMPT = `You are a professional Armenian localization editor with expertise in psychology and emotional intelligence.
Translate the supplied English EQ article into natural, publication-quality Eastern Armenian.

Rules:
1. Return ONLY a valid JSON object with exactly these keys: title, description, category, intro, sections, steps, faq.
2. Preserve the exact array lengths and nested shape. Never summarize, shorten, merge, or omit a paragraph, step, or FAQ.
3. Translate every human-readable string, including category labels. Do not add new information.
4. Use contemporary, idiomatic Eastern Armenian and a warm, precise educational tone. Proofread spelling, agreement, and case endings before returning the JSON; avoid literal English calques.
5. Use the Armenian full stop “։” (U+0589) for sentence endings.
6. Preserve every {placeholder} token and any inline HTML or Markdown markup exactly.
7. Do not transliterate Georgian URL slugs; slugs are not included in the object you translate.
8. Keep EQ, IQ, WHO, and established proper names unchanged where appropriate.
9. Apply this glossary consistently: emotional intelligence = էմոցիոնալ ինտելեկտ; emotion/emotional = էմոցիա/էմոցիոնալ; empathy = էմպաթիա; compassion = կարեկցանք; self-awareness = ինքնաճանաչում; self-regulation = ինքնակարգավորում; active listening = ակտիվ լսում; perspective-taking = ուրիշի տեսանկյունն ընկալելու կարողություն; trigger = հրահրիչ or ազդակ according to context; partner in a relationship = զուգընկեր. Do not substitute “կարեկցանք” for empathy, and avoid the software-like term “գործարկիչ” for a psychological trigger.`;

const PROOFREAD_PROMPT = `You are the senior Eastern Armenian copy editor for a psychology publication.
You will receive an English source article and a structurally matching Armenian draft. Rewrite the Armenian draft into fluent, idiomatic, publication-quality Eastern Armenian while preserving every idea in the English source.

Rules:
1. Return ONLY a valid JSON object with exactly these keys: title, description, category, intro, sections, steps, faq.
2. Preserve the exact array lengths and nested shape. Never summarize, shorten, merge, add, or omit a paragraph, step, or FAQ.
3. Treat the English as the meaning source and the Armenian as a draft to copy-edit. Correct mistranslations, spelling, agreement, case, word order, awkward collocations, and literal English calques.
4. Make the prose sound as if it was originally written by an educated native Eastern Armenian editor. Read every sentence for naturalness before returning it.
5. Use the Armenian full stop “։” (U+0589) for sentence endings and preserve every {placeholder} or inline markup token exactly.
6. Use these terms consistently: emotional intelligence = էմոցիոնալ ինտելեկտ; emotion/emotional = էմոցիա/էմոցիոնալ; empathy = էմպաթիա; compassion = կարեկցանք; self-awareness = ինքնաճանաչում; self-regulation = ինքնակարգավորում; active listening = ակտիվ լսում; perspective-taking = ուրիշի տեսանկյունն ընկալելու կարողություն; trigger = հրահրիչ or ազդակ; relationship partner = զուգընկեր.
7. Avoid mechanical phrases such as “ինքնազեկուցման թեստ”, “էմոցիան իմաստ ունի”, “մնում է իր փորձառության հեղինակությունը”, and “հաճախ հանգեցնում է էմպաթիայի”. Prefer natural equivalents such as “ինքնագնահատման թեստ”, “զգացմունքը տվյալ համատեքստում հասկանալի է”, “իր փորձառության լավագույն մեկնաբանն ինքն է”, and “հաճախ նույնացնում են միայն էմպաթիայի հետ”.
8. In active-listening contexts, render “Would you like listening, comfort, or ideas?” naturally as “Կցանկանայի՞ք, որ պարզապես լսեմ ձեզ, մխիթարե՞մ, թե՞ գաղափարներ առաջարկեմ” rather than asking whether the reader wants to listen.`;

let translationDrafts = null;
if (PROOFREAD) {
  if (!existsSync(TRANSLATION_CHECKPOINT_PATH)) {
    throw new Error("Run the translation pass before --proofread.");
  }
  translationDrafts = JSON.parse(
    readFileSync(TRANSLATION_CHECKPOINT_PATH, "utf8"),
  );
}

function translatableFields(article) {
  return {
    title: article.title,
    description: article.description,
    category: article.category,
    intro: article.intro,
    sections: article.sections,
    steps: article.steps,
    faq: article.faq,
  };
}

function sortedKeys(value) {
  return Object.keys(value).sort().join(",");
}

function markupTokens(value) {
  return value.match(/\{[^{}]+\}|<[^>]+>/g) ?? [];
}

function validateStringPair(source, translated, path) {
  if (typeof translated !== "string" || translated.trim().length === 0) {
    throw new Error(`${path} must be a non-empty string`);
  }
  if (/[\u10a0-\u10ff]/u.test(translated)) {
    throw new Error(`${path} contains Georgian text`);
  }
  if (!/[\u0531-\u058f]/u.test(translated)) {
    throw new Error(`${path} contains no Armenian text`);
  }
  const sourceTokens = markupTokens(source);
  const translatedTokens = markupTokens(translated);
  if (JSON.stringify(sourceTokens) !== JSON.stringify(translatedTokens)) {
    throw new Error(`${path} changed placeholder or markup tokens`);
  }
}

function validateTranslation(source, translated) {
  const expectedKeys = "category,description,faq,intro,sections,steps,title";
  if (!translated || typeof translated !== "object" || Array.isArray(translated)) {
    throw new Error("translation must be an object");
  }
  if (sortedKeys(translated) !== expectedKeys) {
    throw new Error(`top-level keys differ: ${sortedKeys(translated)}`);
  }

  for (const key of ["title", "description", "category", "intro"]) {
    validateStringPair(source[key], translated[key], key);
  }

  if (!Array.isArray(translated.sections) || translated.sections.length !== source.sections.length) {
    throw new Error("section count differs");
  }
  source.sections.forEach((section, sectionIndex) => {
    const result = translated.sections[sectionIndex];
    if (!result || sortedKeys(result) !== "heading,paragraphs") {
      throw new Error(`sections[${sectionIndex}] shape differs`);
    }
    validateStringPair(section.heading, result.heading, `sections[${sectionIndex}].heading`);
    if (!Array.isArray(result.paragraphs) || result.paragraphs.length !== section.paragraphs.length) {
      throw new Error(`sections[${sectionIndex}].paragraph count differs`);
    }
    section.paragraphs.forEach((paragraph, paragraphIndex) =>
      validateStringPair(
        paragraph,
        result.paragraphs[paragraphIndex],
        `sections[${sectionIndex}].paragraphs[${paragraphIndex}]`,
      ),
    );
  });

  if (!Array.isArray(translated.steps) || translated.steps.length !== source.steps.length) {
    throw new Error("step count differs");
  }
  source.steps.forEach((step, index) =>
    validateStringPair(step, translated.steps[index], `steps[${index}]`),
  );

  if (!Array.isArray(translated.faq) || translated.faq.length !== source.faq.length) {
    throw new Error("FAQ count differs");
  }
  source.faq.forEach((entry, index) => {
    const result = translated.faq[index];
    if (!result || sortedKeys(result) !== "a,q") {
      throw new Error(`faq[${index}] shape differs`);
    }
    validateStringPair(entry.q, result.q, `faq[${index}].q`);
    validateStringPair(entry.a, result.a, `faq[${index}].a`);
  });
}

function completeArticle(source, translated) {
  return {
    slug: source.slug,
    title: translated.title,
    description: translated.description,
    category: translated.category,
    readingMinutes: source.readingMinutes,
    domains: source.domains,
    intro: translated.intro,
    sections: translated.sections,
    steps: translated.steps,
    faq: translated.faq,
  };
}

async function callOpenRouter(article) {
  const source = translatableFields(article);
  const userContent = PROOFREAD
    ? {
        englishSource: source,
        armenianDraft: translatableFields(translationDrafts[article.slug]),
      }
    : source;
  let lastError;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const response = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://vividaastro.com",
          "X-Title": "Vivida Armenian EQ Translation",
        },
        body: JSON.stringify({
          model: MODEL,
          temperature: 0.25,
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content: PROOFREAD ? PROOFREAD_PROMPT : TRANSLATE_PROMPT,
            },
            { role: "user", content: JSON.stringify(userContent, null, 2) },
          ],
        }),
        signal: AbortSignal.timeout(90_000),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${(await response.text()).slice(0, 240)}`);
      }
      const payload = await response.json();
      const raw = payload.choices?.[0]?.message?.content;
      if (!raw) throw new Error("empty model response");
      const translated = JSON.parse(raw);
      validateTranslation(source, translated);
      return completeArticle(article, translated);
    } catch (error) {
      lastError = error;
      console.warn(`${article.slug}: attempt ${attempt} failed — ${error.message}`);
      if (attempt < 4) {
        await new Promise((resolvePromise) => setTimeout(resolvePromise, 2_000 * attempt));
      }
    }
  }
  throw lastError;
}

function saveCheckpoint() {
  mkdirSync(dirname(CHECKPOINT_PATH), { recursive: true });
  writeFileSync(CHECKPOINT_PATH, `${JSON.stringify(checkpoint, null, 2)}\n`, "utf8");
}

async function translateAll() {
  let nextIndex = 0;
  const worker = async () => {
    while (nextIndex < sourceArticles.length) {
      const index = nextIndex;
      nextIndex += 1;
      const source = sourceArticles[index];
      const cached = checkpoint[source.slug];
      if (cached && !FORCE) {
        try {
          validateTranslation(translatableFields(source), translatableFields(cached));
          console.log(`✓ ${source.slug} already translated`);
          continue;
        } catch {
          delete checkpoint[source.slug];
        }
      }
      console.log(
        `${PROOFREAD ? "Proofreading" : "Translating"} ${index + 1}/${sourceArticles.length}: ${source.slug}`,
      );
      checkpoint[source.slug] = await callOpenRouter(source);
      saveCheckpoint();
      console.log(`Saved ${source.slug}`);
    }
  };

  await Promise.all(Array.from({ length: 3 }, () => worker()));
}

function writeTypeScript() {
  const articles = sourceArticles.map((source) => {
    const translated = checkpoint[source.slug];
    if (!translated) throw new Error(`missing translation for ${source.slug}`);
    validateTranslation(translatableFields(source), translatableFields(translated));
    return translated;
  });

  const output = `import type { EqDomainKey } from "@/lib/eq/questions";

export type EqArticleAm = {
  slug: string;
  title: string;
  description: string;
  category: string;
  readingMinutes: number;
  domains: EqDomainKey[];
  intro: string;
  sections: { heading: string; paragraphs: string[] }[];
  steps: string[];
  faq: { q: string; a: string }[];
};

export const EQ_HUB_AM = {
  title: "Էմոցիոնալ ինտելեկտ․ գործնական ուղեցույցներ և վարժություններ (EQ)",
  description:
    "Զարգացրեք էմոցիոնալ ինտելեկտը գիտականորեն հիմնավորված ուղեցույցներով՝ ինքնաճանաչում, էմոցիաների կառավարում, էմպաթիա, մոտիվացիա, հաղորդակցություն և հարաբերություններ։",
};

export const EQ_ARTICLES_AM: EqArticleAm[] = ${JSON.stringify(articles, null, 2)};

export const EQ_AM_BY_SLUG: Record<string, EqArticleAm> = Object.fromEntries(
  EQ_ARTICLES_AM.map((item) => [item.slug, item]),
);

export function eqArticleAmBySlug(slug: string): EqArticleAm | undefined {
  return EQ_AM_BY_SLUG[slug];
}
`;

  writeFileSync(OUT_PATH, output, "utf8");
}

await translateAll();
writeTypeScript();
console.log(`Wrote ${OUT_PATH}`);
