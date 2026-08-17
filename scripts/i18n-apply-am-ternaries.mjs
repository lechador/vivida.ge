/**
 * Step 3 of the Armenian UI backfill: APPLY.
 *
 * Rewrites `en ? "English" : "ქართული"` into
 * `am ? "Հայերեն" : en ? "English" : "ქართული"`, and declares `am` next to the
 * existing `en` in each file it touches.
 *
 * Purely deterministic string surgery — no model is involved at this stage, so
 * the worst case is a compile error caught by tsc, never silently mangled JSX.
 *
 * Safety rules:
 *  - only rewrites spans the extractor found (same conservative regex);
 *  - skips any file that already mentions "am" (hand-localised, don't clobber);
 *  - skips sites whose English had no accepted translation (URLs, brand names);
 *  - requires that EVERY `const en = …` in the file is the `locale !== "ka"`
 *    form, then declares `am` after every one of them.
 *
 * That last rule is the important one. 25 of these files declare `en` more
 * than once — once per component or per exported page in the same module —
 * and those declarations are separate scopes. Declaring `am` after only the
 * first (the default for a non-global String.replace) compiles to
 * "Cannot find name 'am'" in every other scope. Requiring the form to be
 * uniform also keeps the `(await getRequestLocale()) !== "ka"` files out,
 * where `locale` is not a binding at all.
 *
 *   node scripts/i18n-apply-am-ternaries.mjs <extract.json> <translations.json> [--dry-run]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DRY_RUN = process.argv.includes("--dry-run");

const extract = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const translations = JSON.parse(fs.readFileSync(process.argv[3], "utf8"));
const amById = new Map(translations.map((t) => [t.id, t.armenian]));

/** Every `const en = …` in the file, whatever it is assigned from. */
const ANY_EN_DECL = /const en = [^;]+;/g;
/** The one form we can derive `am` from, with its own indentation. */
const SUPPORTED_EN_DECL = /^([ \t]*)const en = locale !== "ka";$/gm;

function jsString(value) {
  return JSON.stringify(value);
}

const bySite = new Map();
for (const site of extract.sites) {
  if (!bySite.has(site.file)) bySite.set(site.file, []);
  bySite.get(site.file).push(site);
}

let filesChanged = 0;
let sitesChanged = 0;
let sitesSkipped = 0;
const skippedFiles = [];

for (const [rel, sites] of bySite) {
  const abs = path.join(ROOT, rel);
  let src = fs.readFileSync(abs, "utf8");

  if (src.includes('"am"')) {
    skippedFiles.push(`${rel} (already has an "am" branch)`);
    continue;
  }
  const allDecls = src.match(ANY_EN_DECL) ?? [];
  const supported = allDecls.filter((d) => d === 'const en = locale !== "ka";');
  if (supported.length === 0) {
    skippedFiles.push(`${rel} (no \`const en = locale !== "ka"\` — locale not provably in scope)`);
    continue;
  }
  if (supported.length !== allDecls.length) {
    // Mixed forms: some scopes in this file would get `am` and some would
    // not, and the ones that did not would fail to compile.
    skippedFiles.push(
      `${rel} (${allDecls.length - supported.length} of ${allDecls.length} \`const en\` declarations use another form)`,
    );
    continue;
  }

  let changedHere = 0;
  for (const site of sites) {
    const am = amById.get(site.id);
    if (am === undefined) {
      sitesSkipped++;
      continue;
    }
    // Untranslated-on-purpose: the model returned the source unchanged
    // (brand tokens, bare numerals). A third branch would be pure noise.
    if (am === site.english) {
      sitesSkipped++;
      continue;
    }
    const replacement = `am ? ${jsString(am)} : ${site.match}`;
    if (!src.includes(site.match)) continue;
    src = src.replace(site.match, replacement);
    changedHere++;
  }

  if (changedHere === 0) continue;

  // Declare `am` after EVERY `en`, matching each site's own indentation —
  // one per scope, so no usage is left without a binding.
  src = src.replace(
    SUPPORTED_EN_DECL,
    (line, indent) => `${line}\n${indent}const am = locale === "am";`,
  );

  if (!DRY_RUN) fs.writeFileSync(abs, src);
  filesChanged++;
  sitesChanged += changedHere;
}

console.log(`files rewritten: ${filesChanged}`);
console.log(`ternaries given an Armenian branch: ${sitesChanged}`);
console.log(`sites skipped (no usable translation): ${sitesSkipped}`);
if (skippedFiles.length) {
  console.log(`\nfiles left for a human (${skippedFiles.length}):`);
  for (const f of skippedFiles) console.log("  " + f);
}
if (DRY_RUN) console.log("\n(dry run — nothing written)");
