#!/usr/bin/env node

/**
 * Production dependency audit gate.
 *
 * Behaves like `npm audit --omit=dev --audit-level=high`, with one addition:
 * an advisory can be accepted explicitly in `security/audit-allowlist.json`.
 * Every acceptance carries a reason, the affected package and a review date,
 * so the exception has to be re-justified instead of quietly rotting.
 *
 * Anything not on the list still fails the build, and an entry that is no
 * longer reported is flagged so it can be deleted.
 */

import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const run = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const allowlistPath = path.join(root, "security", "audit-allowlist.json");

// `npm audit --audit-level=high` blocks on high and critical only.
const BLOCKING_SEVERITIES = new Set(["critical", "high"]);
const SEVERITY_ORDER = { critical: 0, high: 1, moderate: 2, low: 3 };

async function readAuditReport() {
  try {
    const { stdout } = await run("npm", ["audit", "--omit=dev", "--json"], {
      cwd: root,
      maxBuffer: 32 * 1024 * 1024,
    });
    return JSON.parse(stdout);
  } catch (error) {
    // npm exits non-zero as soon as it finds anything; the report is still
    // complete and valid, so parse it instead of treating the exit as failure.
    if (error.stdout) {
      try {
        return JSON.parse(error.stdout);
      } catch {
        // Fall through to the real error below.
      }
    }
    throw new Error(
      `npm audit could not run: ${String(error.stderr || error.message).trim()}`,
    );
  }
}

function advisoryId(url) {
  const match = /GHSA-[a-z0-9-]+/i.exec(url ?? "");
  return match ? match[0].toUpperCase() : null;
}

/** Collapse the package-keyed report into one record per advisory. */
function collectAdvisories(report) {
  const advisories = new Map();

  for (const [packageName, entry] of Object.entries(
    report.vulnerabilities ?? {},
  )) {
    for (const via of entry.via ?? []) {
      // A string entry just means "vulnerable through that other package";
      // the advisory itself is reported wherever the chain roots.
      if (typeof via !== "object" || via === null) continue;

      const id = advisoryId(via.url);
      if (!id) continue;

      const existing = advisories.get(id);
      if (existing) {
        existing.packages.add(packageName);
        continue;
      }

      advisories.set(id, {
        id,
        title: via.title ?? "(no title)",
        severity: via.severity ?? entry.severity ?? "unknown",
        range: via.range ?? "",
        packages: new Set([packageName]),
      });
    }
  }

  return [...advisories.values()];
}

async function readAllowlist() {
  let raw;
  try {
    raw = await readFile(allowlistPath, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") return new Map();
    throw error;
  }

  const parsed = JSON.parse(raw);
  const entries = Array.isArray(parsed.entries) ? parsed.entries : [];
  const allowlist = new Map();

  for (const entry of entries) {
    allowlist.set(String(entry.id ?? "").toUpperCase(), entry);
  }

  return allowlist;
}

function describe(advisory) {
  const packages = [...advisory.packages].sort().join(", ");
  return `${advisory.id} ${advisory.title} [${advisory.severity}] (${packages} ${
    advisory.range
  })`;
}

async function main() {
  const report = await readAuditReport();
  const advisories = collectAdvisories(report);
  const allowlist = await readAllowlist();

  const blocking = advisories.filter((advisory) =>
    BLOCKING_SEVERITIES.has(advisory.severity),
  );
  const informational = advisories.length - blocking.length;

  const unaccepted = [];
  const accepted = [];
  const problems = [];

  for (const advisory of blocking) {
    const entry = allowlist.get(advisory.id);

    if (!entry) {
      unaccepted.push(advisory);
      continue;
    }

    const reviewBy = Date.parse(entry.expires);
    if (Number.isNaN(reviewBy)) {
      problems.push(`${advisory.id} has an invalid "expires" date.`);
      unaccepted.push(advisory);
      continue;
    }

    if (reviewBy < Date.now()) {
      problems.push(
        `${advisory.id} was accepted until ${entry.expires}; re-check whether a fix exists and extend or remove the entry.`,
      );
      unaccepted.push(advisory);
      continue;
    }

    if (entry.package && !advisory.packages.has(entry.package)) {
      problems.push(
        `${advisory.id} is now reported under ${[...advisory.packages].join(
          ", ",
        )}, not ${entry.package}; the acceptance does not apply.`,
      );
      unaccepted.push(advisory);
      continue;
    }

    accepted.push({ advisory, entry });
  }

  const reportedIds = new Set(advisories.map((advisory) => advisory.id));
  for (const [id, entry] of allowlist) {
    if (!reportedIds.has(id)) {
      problems.push(
        `${id} is on the allowlist but is no longer reported; remove it.`,
      );
    }
  }

  for (const { advisory, entry } of accepted) {
    console.log(
      `accepted ${advisory.id} (${[...advisory.packages].join(", ")}), reviewed until ${entry.expires}: ${entry.reason}`,
    );
  }

  if (informational > 0) {
    console.log(
      `${informational} moderate/low advisory record(s) below the blocking threshold.`,
    );
  }

  for (const problem of problems) {
    console.error(`allowlist: ${problem}`);
  }

  if (unaccepted.length === 0) {
    console.log("Production audit clean at high and critical severity.");
    return;
  }

  unaccepted.sort(
    (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity],
  );

  console.error("");
  console.error(
    `${unaccepted.length} unaccepted advisory record(s) at high or critical severity:`,
  );
  for (const advisory of unaccepted) {
    console.error(` - ${describe(advisory)}`);
  }
  console.error("");
  console.error(
    "Upgrade the dependency or accept the advisory in security/audit-allowlist.json with a reason and a review date.",
  );

  process.exitCode = 1;
}

await main();
