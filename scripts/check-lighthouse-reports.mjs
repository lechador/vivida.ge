#!/usr/bin/env node

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const reportDirectory = path.resolve(process.argv[2] ?? ".lighthouserc");

async function findJsonReports(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await findJsonReports(entryPath)));
    } else if (
      entry.isFile() &&
      entry.name.endsWith(".json") &&
      entry.name !== "manifest.json"
    ) {
      files.push(entryPath);
    }
  }

  return files;
}

async function main() {
  let reportFiles;
  try {
    reportFiles = await findJsonReports(reportDirectory);
  } catch (error) {
    console.error(
      `Lighthouse report directory is unavailable: ${reportDirectory}`,
    );
    console.error(error.message);
    process.exitCode = 1;
    return;
  }

  if (reportFiles.length === 0) {
    console.error(`No Lighthouse JSON reports found in ${reportDirectory}`);
    process.exitCode = 1;
    return;
  }

  const failures = [];
  for (const reportPath of reportFiles) {
    let report;
    try {
      report = JSON.parse(await readFile(reportPath, "utf8"));
    } catch (error) {
      failures.push(
        `${path.relative(process.cwd(), reportPath)}: ${error.message}`,
      );
      continue;
    }

    const label = path.relative(process.cwd(), reportPath);
    if (
      !report ||
      typeof report !== "object" ||
      !report.audits ||
      typeof report.audits !== "object" ||
      Array.isArray(report.audits) ||
      Object.keys(report.audits).length === 0
    ) {
      failures.push(`${label}: not a Lighthouse report (missing audits)`);
      continue;
    }

    if (report.runtimeError) {
      failures.push(
        `${label}: runtimeError ${report.runtimeError.code ?? "unknown"}: ${report.runtimeError.message ?? "Lighthouse runtime failed"}`,
      );
    }

    for (const [auditId, audit] of Object.entries(report.audits)) {
      if (audit?.scoreDisplayMode === "error") {
        failures.push(
          `${label}: audit "${auditId}" has scoreDisplayMode=error`,
        );
      }
    }
  }

  if (failures.length > 0) {
    console.error("Lighthouse report integrity check failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exitCode = 1;
    return;
  }

  console.log(
    `Lighthouse report integrity check passed (${reportFiles.length} report${reportFiles.length === 1 ? "" : "s"}).`,
  );
}

await main();
