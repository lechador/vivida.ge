/**
 * Step 1 of the Armenian UI backfill: EXTRACT.
 *
 * The codebase localises inline, as `en ? "English" : "ქართული"`, where `en`
 * is uniformly `locale !== "ka"`. That idiom gives Armenian readers English —
 * a deliberate stopgap (see usesEnglishCopy) — and the only way to give them
 * Armenian is a third branch at each site.
 *
 * This script does NOT edit anything. It emits the exact source spans and
 * their English text, so a model can translate plain strings and a separate,
 * deterministic script can splice the result back in. Letting a model rewrite
 * TSX directly is how you get mangled JSX and broken escapes across 100+
 * files; letting it translate a JSON array of strings is safe.
 *
 * Deliberately conservative — it only matches a double-quoted ternary with no
 * embedded double quotes, so template literals, nested JSX and multi-line
 * conditionals are left alone rather than guessed at.
 *
 *   node scripts/i18n-extract-en-ternaries.mjs > /tmp/strings.json
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIRS = ["app", "components"];

/** `en ? "<english>" : "<georgian>"` — no escapes, no inner double quotes. */
const TERNARY = /\ben \? "([^"\\]*)" : "([^"\\]*)"/g;

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
      walk(full, out);
    } else if (entry.name.endsWith(".tsx") || entry.name.endsWith(".ts")) {
      out.push(full);
    }
  }
  return out;
}

const files = DIRS.flatMap((d) => walk(path.join(ROOT, d)));
const result = [];
const seen = new Map(); // english -> id, so identical copy translates once

for (const file of files) {
  const src = fs.readFileSync(file, "utf8");
  // A file that already branches on "am" has been localised by hand; leaving
  // it alone keeps human translations from being overwritten by machine ones.
  if (src.includes('"am"')) continue;

  const matches = [...src.matchAll(TERNARY)];
  if (matches.length === 0) continue;

  const rel = path.relative(ROOT, file);
  for (const m of matches) {
    const [full, english, georgian] = m;
    if (!seen.has(english)) seen.set(english, seen.size);
    result.push({
      id: seen.get(english),
      file: rel,
      match: full,
      english,
      georgian,
    });
  }
}

const unique = [...seen.keys()].map((english, id) => ({ id, english }));

process.stdout.write(
  JSON.stringify(
    {
      sites: result,
      unique,
      stats: {
        files: new Set(result.map((r) => r.file)).size,
        sites: result.length,
        uniqueStrings: unique.length,
      },
    },
    null,
    2,
  ),
);
