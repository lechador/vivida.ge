import { config } from "dotenv";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import * as mbtiModule from "../lib/mbti-questions";
import * as eqModule from "../lib/eq/questions";
import * as bigFiveModule from "../lib/big-five/questions";
import * as iqModule from "../lib/iq/items";

config({ path: ".env.local" });

const KEY = process.env.OPENROUTER_API_KEY;
const PROOFREAD = process.argv.includes("--proofread");
const FORCE = process.argv.includes("--force");
const BASE = resolve(".next/translation-cache/test-banks-am.json");
const CHECKPOINT = resolve(PROOFREAD ? ".next/translation-cache/test-banks-am-proofread.json" : ".next/translation-cache/test-banks-am.json");
const OUT = resolve("lib/tests-content-am.json");
if (!KEY) throw new Error("OPENROUTER_API_KEY is not set");

const mbti = ((mbtiModule as unknown as { default?: typeof mbtiModule }).default ?? mbtiModule);
const eq = ((eqModule as unknown as { default?: typeof eqModule }).default ?? eqModule);
const bigFive = ((bigFiveModule as unknown as { default?: typeof bigFiveModule }).default ?? bigFiveModule);
const iq = ((iqModule as unknown as { default?: typeof iqModule }).default ?? iqModule);

const source = {
  mbti: mbti.MBTI_QUESTIONS_EN.map((question) => ({ id: question.id, text: question.textEn })),
  eq: eq.EQ_QUESTIONS_EN.map((question) => ({ id: question.id, text: question.textEn })),
  bigFive: bigFive.BIG5_QUESTIONS_EN.map((question) => ({ id: question.id, text: question.textEn })),
  iq: iq.IQ_ITEMS.filter((item) => item.stem.type === "logic").map((item) => ({
    id: item.id,
    text: item.stem.type === "logic" ? item.stem.textEn : "",
    options: item.options.map((option) => option.kind === "text" ? (option.textEn ?? option.text) : ""),
  })),
};

const draft = PROOFREAD ? JSON.parse(readFileSync(BASE, "utf8")) : null;
let cached = !FORCE && existsSync(CHECKPOINT) ? JSON.parse(readFileSync(CHECKPOINT, "utf8")) : null;

const PROMPT = `Translate the supplied English psychological and reasoning assessment text into fluent, publication-quality Eastern Armenian. Return only JSON with exactly the same keys, key order, nested shape, array lengths, ids, and numbers. Replace every human-facing English text value with Armenian. Preserve pure numbers, formulas, comparison symbols, and Latin variable letters exactly. Do not summarize or add content. Use respectful second-person Armenian consistently and the Armenian full stop “։”.`;
const PROOFREAD_PROMPT = `Copy-edit the Armenian psychological and reasoning assessment against its English source into natural, polished Eastern Armenian. Return only Armenian JSON with exactly the English source's keys, key order, nested shape, array lengths, ids, and numbers. Preserve every item and its meaning, including reverse-worded statements. Preserve pure numbers, formulas, comparison symbols, and Latin variable letters. Correct calques, grammar, agreement, terminology, and punctuation; use “։” for sentence endings.`;

function machine(path: string) { return path.endsWith(".id"); }
function translatable(sourceText: string) { return /[A-Za-z]/.test(sourceText) && !/^[A-Z]$/.test(sourceText) && !/^[A-Z]\s*[><=]\s*[A-Z]$/.test(sourceText); }
function validate(a: unknown, b: unknown, path = "root") {
  if (typeof a === "string") {
    if (typeof b !== "string" || !b.trim()) throw new Error(`${path} empty`);
    if (machine(path) || !translatable(a)) {
      if (a !== b) throw new Error(`${path} changed`);
      return;
    }
    if (!/[Ա-֏]/u.test(b) || /[Ⴀ-ჿ]/u.test(b)) throw new Error(`${path} is not clean Armenian: ${JSON.stringify(b)}`);
    const an = a.match(/\d+(?:\.\d+)?/g) ?? [], bn = b.match(/\d+(?:\.\d+)?/g) ?? [];
    if (JSON.stringify(an) !== JSON.stringify(bn)) throw new Error(`${path} changed numbers`);
    return;
  }
  if (typeof a === "number" || typeof a === "boolean") {
    if (a !== b) throw new Error(`${path} changed`);
    return;
  }
  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) throw new Error(`${path} length`);
    a.forEach((value, index) => validate(value, b[index], `${path}[${index}]`));
    return;
  }
  if (!b || typeof b !== "object" || Array.isArray(b)) throw new Error(`${path} object`);
  const ak = Object.keys(a as object), bk = Object.keys(b as object);
  if (JSON.stringify(ak) !== JSON.stringify(bk)) throw new Error(`${path} keys`);
  for (const key of ak) validate((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key], `${path}.${key}`);
}

function reorder(a: unknown, b: unknown, path = "root"): unknown {
  if (machine(path)) return a;
  if (Array.isArray(a)) return a.map((value, index) => reorder(value, (b as unknown[])[index], `${path}[${index}]`));
  if (a && typeof a === "object") return Object.fromEntries(Object.keys(a).map((key) => [key, reorder((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key], `${path}.${key}`)]));
  if (typeof a === "string" && !translatable(a)) return a;
  return b;
}

function normalize(value: unknown, path = "root"): unknown {
  if (typeof value === "string") return machine(path) ? value : value.replace(/\.(?=\s|$)/g, "։");
  if (Array.isArray(value)) return value.map((item, index) => normalize(item, `${path}[${index}]`));
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, normalize(item, `${path}.${key}`)]));
  return value;
}

function restoreTranslatedDraft(sourceValue: unknown, resultValue: unknown, draftValue: unknown, path = "root"): unknown {
  if (typeof sourceValue === "string") {
    if (PROOFREAD && translatable(sourceValue) && typeof resultValue === "string" && !/[Ա-֏]/u.test(resultValue) && typeof draftValue === "string") return draftValue;
    return resultValue;
  }
  if (Array.isArray(sourceValue)) return sourceValue.map((item, index) => restoreTranslatedDraft(item, (resultValue as unknown[])[index], (draftValue as unknown[])[index], `${path}[${index}]`));
  if (sourceValue && typeof sourceValue === "object") return Object.fromEntries(Object.keys(sourceValue).map((key) => [key, restoreTranslatedDraft((sourceValue as Record<string, unknown>)[key], (resultValue as Record<string, unknown>)[key], (draftValue as Record<string, unknown>)[key], `${path}.${key}`)]));
  return resultValue;
}

async function run() {
  if (cached) { validate(source, cached); return cached; }
  let last: unknown;
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json", "HTTP-Referer": "https://vividaastro.com", "X-Title": "Vivida Armenian Assessments" },
        body: JSON.stringify({ model: "google/gemini-2.5-flash", temperature: 0.15, response_format: { type: "json_object" }, messages: [{ role: "system", content: PROOFREAD ? PROOFREAD_PROMPT : PROMPT }, { role: "user", content: JSON.stringify(PROOFREAD ? { englishSource: source, armenianDraft: draft } : source) }] }),
        signal: AbortSignal.timeout(180_000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const parsed = JSON.parse((await response.json()).choices[0].message.content);
      const reordered = reorder(source, parsed);
      const result = normalize(PROOFREAD ? restoreTranslatedDraft(source, reordered, draft) : reordered);
      validate(source, result);
      return result;
    } catch (error) {
      last = error;
      console.warn(`attempt ${attempt} failed`, error);
    }
  }
  throw last;
}

cached = normalize(await run());
validate(source, cached);
mkdirSync(dirname(CHECKPOINT), { recursive: true });
writeFileSync(CHECKPOINT, `${JSON.stringify(cached, null, 2)}\n`);
writeFileSync(OUT, `${JSON.stringify(cached, null, 2)}\n`);
console.log(`Wrote ${OUT}`);
