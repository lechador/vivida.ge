/**
 * Fails when code reads a `process.env.X` key missing from `.env.example`.
 *
 * Usage: node scripts/check-env.mjs
 * CI runs it before lint so env drift breaks the build, not onboarding.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const EXAMPLE = join(ROOT, ".env.example");

// Vercel/Next/Node built-ins, never belong in .env.example.
const ALLOWLIST = new Set(["NODE_ENV", "VERCEL", "VERCEL_ENV"]);

const SCAN_DIRS = ["app", "lib", "actions", "components", "scripts"];
const SCAN_FILES = ["auth.ts", "auth.config.ts", "proxy.ts"];

function exampleKeys() {
  const text = readFileSync(EXAMPLE, "utf8");
  const keys = new Set();
  for (const line of text.split("\n")) {
    const m = line.match(/^([A-Z][A-Z0-9_]*)=/);
    if (m) keys.add(m[1]);
  }
  return keys;
}

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (entry === "node_modules" || entry === ".next") continue;
      yield* walk(full);
    } else if (/\.(ts|tsx|mjs|js)$/.test(entry)) {
      yield full;
    }
  }
}

function usedKeys() {
  const files = [];
  for (const d of SCAN_DIRS) files.push(...walk(join(ROOT, d)));
  for (const f of SCAN_FILES) files.push(join(ROOT, f));
  const pat = /process\.env\.([A-Z][A-Z0-9_]*)/g;
  const keys = new Map(); // key -> first file
  for (const file of files) {
    if (file.endsWith("scripts/check-env.mjs")) continue; // self (doc comment)
    let text;
    try {
      text = readFileSync(file, "utf8");
    } catch {
      continue;
    }
    for (const m of text.matchAll(pat)) {
      if (!keys.has(m[1])) keys.set(m[1], relative(ROOT, file));
    }
  }
  return keys;
}

const documented = exampleKeys();
const used = usedKeys();
const missing = [...used.entries()].filter(
  // Trailing-underscore hits (e.g. `process.env.NEXT_PUBLIC_…` in a comment)
  // are documentation artifacts, not real keys.
  ([key]) => !key.endsWith("_") && !documented.has(key) && !ALLOWLIST.has(key),
);

if (missing.length > 0) {
  console.error("Missing from .env.example:");
  for (const [key, file] of missing.sort()) {
    console.error(`  ${key} (first used in ${file})`);
  }
  console.error("\nAdd documented entries to .env.example, then re-run.");
  process.exit(1);
}

console.log(`OK, ${used.size} env keys used, all documented in .env.example.`);
