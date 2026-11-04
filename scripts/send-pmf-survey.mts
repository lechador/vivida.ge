/**
 * Sean Ellis PMF baseline survey (wave 2026-11).
 *
 * One question to marketing-consented users active in the last 30 days:
 * "How would you feel if you could no longer use Vivida?" The score is the
 * share answering "very disappointed" (40% = strong PMF).
 *
 * Usage:
 *   npx tsx scripts/send-pmf-survey.mts   # dry-run: scoreboard + candidate count only
 *   npx tsx scripts/send-pmf-survey.mts --execute
 *
 * Do not run within a few days of a promo blast to the same base; the
 * audience overlaps heavily with the trial campaign's.
 */
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
require.cache[require.resolve("server-only")] = {
  id: "server-only",
  filename: "server-only",
  loaded: true,
  exports: {},
} as NodeModule;

try {
  for (const line of readFileSync(
    new URL("../.env.local", import.meta.url),
    "utf8",
  ).split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
} catch {
  /* env may already be loaded */
}

const { pmfSurveyScoreboard, sendPmfSurvey } = await import("@/lib/pmf-survey");

const execute = process.argv.includes("--execute");
const board = await pmfSurveyScoreboard();
console.log(
  `Current wave: ${board.responses} responses, very-disappointed ${board.veryDisappointedPct}%`,
);

if (!execute) {
  const dry = await sendPmfSurveyDryRun();
  console.log(
    `Dry-run candidates (active 30d, consented, not yet sent): ${dry}`,
  );
  console.log("Pass --execute to send.");
  process.exit(0);
}

async function sendPmfSurveyDryRun(): Promise<number> {
  // sendPmfSurvey has no dry-run mode (claims would be written); count via
  // a zero-allowance budget instead — reserve(0) sends nothing.
  const { SendBudget } = await import("@/lib/email-send-budget");
  const result = await sendPmfSurvey(new SendBudget(0));
  return result.candidates - result.skipped;
}

const result = await sendPmfSurvey();
console.log(JSON.stringify(result, null, 2));
const after = await pmfSurveyScoreboard();
console.log(
  `Wave now: ${after.responses} responses, very-disappointed ${after.veryDisappointedPct}%`,
);
process.exit(result.failed > 0 ? 1 : 0);
