import { config } from "dotenv";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import * as quiz from "../lib/true-sign/quiz";

config({ path: ".env.local" });

const KEY = process.env.OPENROUTER_API_KEY;
const PROOFREAD = process.argv.includes("--proofread");
const FORCE = process.argv.includes("--force");
const BASE = resolve(".next/translation-cache/true-sign-am.json");
const CHECKPOINT = resolve(PROOFREAD ? ".next/translation-cache/true-sign-am-proofread.json" : ".next/translation-cache/true-sign-am.json");
const OUT = resolve("lib/true-sign/quiz-am.json");
if (!KEY) throw new Error("OPENROUTER_API_KEY is not set");

const quizExports = ((quiz as unknown as { default?: typeof quiz }).default ?? quiz);
const source = {
  questions: quizExports.TS_QUESTIONS_EN.map((question) => ({
    id: question.id,
    textEn: question.textEn,
    options: question.options.map((option) => ({
      textEn: option.textEn,
      ...(option.element ? { element: option.element } : {}),
      ...(option.modality ? { modality: option.modality } : {}),
    })),
  })),
  blurbs: quizExports.TS_SIGN_BLURB_EN,
};
const draft = PROOFREAD ? JSON.parse(readFileSync(BASE, "utf8")) : null;
let cached = !FORCE && existsSync(CHECKPOINT) ? JSON.parse(readFileSync(CHECKPOINT, "utf8")) : null;

const PROMPT = `Translate this English zodiac personality quiz into fluent, publication-quality Eastern Armenian. Return only JSON with exactly the same keys, key order, nested shape, and array lengths. Preserve id, element, and modality values exactly because they are machine identifiers. Translate every textEn value and every blurb value into Armenian; naturally localize tone, do not summarize or add content. Use Armenian zodiac vocabulary and the Armenian full stop “։”. Preserve all numbers and markup.`;
const PROOFREAD_PROMPT = `Copy-edit the supplied Armenian zodiac quiz against its English source into natural, polished Eastern Armenian. Return only the Armenian JSON with exactly the English source's keys, key order, shape, and array lengths. Preserve id, element, and modality machine values exactly. Keep every idea and item; correct calques, grammar, spelling, agreement, capitalization, and punctuation. Use “։” for sentence endings.`;

function machine(path: string) {
  return path.endsWith(".id") || path.endsWith(".element") || path.endsWith(".modality");
}
function validate(a: unknown, b: unknown, path = "root") {
  if (typeof a === "string") {
    if (typeof b !== "string" || !b.trim()) throw new Error(`${path} empty`);
    if (machine(path)) { if (a !== b) throw new Error(`${path} changed`); return; }
    if (!/[Ա-֏]/u.test(b) || /[Ⴀ-ჿ]/u.test(b)) throw new Error(`${path} is not clean Armenian: ${JSON.stringify(b)}`);
    const an = a.match(/\d+/g) ?? [], bn = b.match(/\d+/g) ?? [];
    if (JSON.stringify(an) !== JSON.stringify(bn)) throw new Error(`${path} changed numbers`);
    return;
  }
  if (typeof a === "number" || typeof a === "boolean") { if (a !== b) throw new Error(`${path} changed`); return; }
  if (Array.isArray(a)) { if (!Array.isArray(b) || a.length !== b.length) throw new Error(`${path} length`); a.forEach((v, i) => validate(v, b[i], `${path}[${i}]`)); return; }
  if (!b || typeof b !== "object" || Array.isArray(b)) throw new Error(`${path} object`);
  const ak = Object.keys(a as object), bk = Object.keys(b as object);
  if (JSON.stringify(ak) !== JSON.stringify(bk)) throw new Error(`${path} keys`);
  for (const key of ak) validate((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key], `${path}.${key}`);
}

function reorder(a: unknown, b: unknown, path = "root"): unknown {
  if (machine(path)) return a;
  if (Array.isArray(a)) return a.map((value, index) => reorder(value, (b as unknown[])[index], `${path}[${index}]`));
  if (a && typeof a === "object") {
    return Object.fromEntries(Object.keys(a).map((key) => [key, reorder((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key], `${path}.${key}`)]));
  }
  return b;
}

function normalizeArmenian(value: unknown, path = "root"): unknown {
  if (typeof value === "string") {
    return machine(path) ? value : value.replace(/\.(?=\s|$)/g, "։");
  }
  if (Array.isArray(value)) return value.map((item, index) => normalizeArmenian(item, `${path}[${index}]`));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, normalizeArmenian(item, `${path}.${key}`)]));
  }
  return value;
}

async function run() {
  if (cached) { validate(source, cached); return cached; }
  let last: unknown;
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json", "HTTP-Referer": "https://vividaastro.com", "X-Title": "Vivida Armenian True Sign Quiz" },
        body: JSON.stringify({ model: "google/gemini-2.5-flash", temperature: 0.2, response_format: { type: "json_object" }, messages: [{ role: "system", content: PROOFREAD ? PROOFREAD_PROMPT : PROMPT }, { role: "user", content: JSON.stringify(PROOFREAD ? { englishSource: source, armenianDraft: draft } : source) }] }),
        signal: AbortSignal.timeout(120_000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const parsed = JSON.parse((await response.json()).choices[0].message.content);
      if (!parsed.blurbs && parsed.results) parsed.blurbs = parsed.results;
      const result = reorder(source, parsed);
      validate(source, result);
      return result;
    } catch (error) { last = error; console.warn(`attempt ${attempt} failed`, error); }
  }
  throw last;
}

cached = normalizeArmenian(await run());
validate(source, cached);
mkdirSync(dirname(CHECKPOINT), { recursive: true });
writeFileSync(CHECKPOINT, `${JSON.stringify(cached, null, 2)}\n`);
writeFileSync(OUT, `${JSON.stringify(cached, null, 2)}\n`);
console.log(`Wrote ${OUT}`);
