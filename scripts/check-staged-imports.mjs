#!/usr/bin/env node
/**
 * Refuse a commit that would leave the tree unbuildable.
 *
 * The failure this prevents, which happened in practice: a set of tracked files
 * were modified to import new modules, but the new modules were still untracked.
 * `git commit -a` (or simply forgetting `git add`) stages the modifications and
 * omits the new files, so the committed revision cannot resolve those imports.
 * Verified against this repository by exporting HEAD, applying only the tracked
 * diff, and typechecking: **18 unresolved-module errors**.
 *
 * The check is deliberately narrow and fast: for every staged `.ts`/`.tsx` file,
 * look at its relative imports and path-alias imports, and confirm each resolves
 * to a file that is either already tracked or staged in this commit. It never
 * reads file contents beyond import resolution, so it stays cheap enough for a
 * pre-commit hook.
 *
 * Exits non-zero with an actionable message listing exactly what to `git add`.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const ROOT = execFileSync("git", ["rev-parse", "--show-toplevel"], {
  encoding: "utf8",
}).trim();

function git(args) {
  return execFileSync("git", args, { cwd: ROOT, encoding: "utf8" });
}

/**
 * Files to check.
 *
 * Default is what this commit stages, which is the pre-commit case. With
 * `--all`, every tracked `.ts`/`.tsx` file is checked instead — the CI case,
 * where there is no meaningful "staged" set and the question is simply whether
 * the repository as committed can resolve its own imports.
 */
function filesToCheck(checkAll) {
  const args = checkAll
    ? ["ls-files"]
    : ["diff", "--cached", "--name-only", "--diff-filter=ACMR"];
  const out = git(args);
  return out
    .split("\n")
    .map((s) => s.trim())
    .filter((f) => f && /\.(ts|tsx)$/.test(f));
}

/** Tracked files in the index (i.e. what the commit will actually contain). */
function trackedFiles() {
  const out = git(["ls-files"]);
  return new Set(
    out
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean),
  );
}

/**
 * Resolve a specifier to a repository-relative path, or null when it is a bare
 * package import or otherwise not our concern.
 */
function resolveSpecifier(fromFile, specifier) {
  let base;
  if (specifier.startsWith("@/")) {
    base = specifier.slice(2);
  } else if (specifier.startsWith(".")) {
    base = path.posix.join(path.posix.dirname(fromFile), specifier);
  } else {
    return null; // node_modules or builtin
  }

  const candidates = [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    `${base}.js`,
    `${base}.mjs`,
    `${base}/index.ts`,
    `${base}/index.tsx`,
    `${base}/index.js`,
  ];
  for (const candidate of candidates) {
    const normalized = path.posix.normalize(candidate);
    if (existsSync(path.join(ROOT, normalized))) {
      try {
        if (statSync(path.join(ROOT, normalized)).isFile()) return normalized;
      } catch {
        /* ignore */
      }
    }
    // Also accept a resolution that only exists on disk as a directory index.
  }
  return null;
}

/** Static import/export specifiers, plus dynamic import() string literals. */
function importSpecifiers(source) {
  const specs = new Set();
  const patterns = [
    /\bfrom\s+["']([^"']+)["']/g,
    /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g,
    /\brequire\s*\(\s*["']([^"']+)["']\s*\)/g,
  ];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(source)) !== null) specs.add(m[1]);
  }
  return [...specs];
}

function main() {
  const checkAll = process.argv.includes("--all");
  const staged = filesToCheck(checkAll);
  if (staged.length === 0) return 0;

  const tracked = trackedFiles();
  /** @type {Map<string, Set<string>>} missing module -> importing files */
  const missing = new Map();

  for (const file of staged) {
    let source;
    try {
      // `:path` reads the staged blob in pre-commit mode; the working file is
      // what CI checks, and for a tracked file the two agree once committed.
      source = checkAll
        ? readFileSync(path.join(ROOT, file), "utf8")
        : execFileSync("git", ["show", `:${file}`], {
            cwd: ROOT,
            encoding: "utf8",
          });
    } catch {
      continue;
    }

    for (const spec of importSpecifiers(source)) {
      const resolved = resolveSpecifier(file, spec);
      if (!resolved) continue;
      if (tracked.has(resolved)) continue;
      // The import resolves on disk but the target is not in this commit.
      if (!missing.has(resolved)) missing.set(resolved, new Set());
      missing.get(resolved).add(file);
    }
  }

  if (missing.size === 0) return 0;

  console.error(
    checkAll
      ? "\n\x1b[31mFiles import modules that are not tracked in this repository.\x1b[0m\n"
      : "\n\x1b[31mCommit refused: staged files import modules that are not part of this commit.\x1b[0m\n",
  );
  for (const [target, importers] of missing) {
    console.error(`  ${target}`);
    for (const importer of importers)
      console.error(`    imported by ${importer}`);
  }
  console.error(
    checkAll
      ? "\nThese files exist on disk but are untracked, so the committed revision\n" +
          "cannot resolve them. Track them with:\n\n  git add " +
          [...missing.keys()].join(" ") +
          "\n"
      : "\nStaging these files will leave the committed revision unable to build.\n" +
          "Add them with:\n\n  git add " +
          [...missing.keys()].join(" ") +
          "\n",
  );
  return 1;
}

process.exit(main());
