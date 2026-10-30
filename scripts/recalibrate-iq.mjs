// Recalibrate the IQ test from real responses, REPORT ONLY (never writes).
//
// Two outputs:
//   1. Observed difficulty (b) per item, from the stored per-taker θ and each
//      item's right/wrong (conditional Rasch MLE). Compare to the assigned b in
//      lib/iq/items.ts and nudge the outliers.
//   2. A suggested θ→IQ anchor (THETA_MEAN, THETA_SD) so the real population of
//      takers maps to IQ mean 100 / SD 15, replaces the provisional constants
//      in lib/iq/scoring.ts once the sample is big enough.
//
// Usage: node scripts/recalibrate-iq.mjs   (needs DATABASE_URL in .env.local)

import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";

for (const line of readFileSync(
  new URL("../.env.local", import.meta.url),
  "utf8",
).split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]])
    process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}
const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL missing in .env.local");
  process.exit(1);
}

const MIN_RESULTS = 100; // don't trust a re-norm below this many completed tests
const MIN_EXPOSURES = 30; // per item, before its observed b means anything

const sql = neon(url);
const rows = await sql`SELECT theta, item_correct
  FROM iq_result WHERE item_correct IS NOT NULL AND theta IS NOT NULL`;

console.log(`completed tests with per-item data: ${rows.length}`);
if (rows.length < MIN_RESULTS) {
  console.log(
    `\nNeed ≥ ${MIN_RESULTS} to re-norm with confidence, collecting. (Nothing changed.)`,
  );
  process.exit(0);
}

// ── 1. Suggested θ→IQ anchor from the real θ distribution ────────────────────
const thetas = rows.map((r) => Number(r.theta)).filter(Number.isFinite);
const mean = thetas.reduce((a, b) => a + b, 0) / thetas.length;
const sd = Math.sqrt(
  thetas.reduce((a, b) => a + (b - mean) ** 2, 0) / thetas.length,
);
console.log("\n── Suggested anchor (lib/iq/scoring.ts) ──");
console.log(
  `  THETA_MEAN = ${mean.toFixed(2)}   (see THETA_MEAN in lib/iq/scoring.ts)`,
);
console.log(
  `  THETA_SD   = ${sd.toFixed(2)}   (see THETA_SD in lib/iq/scoring.ts)`,
);

// ── 2. Observed difficulty per item (conditional Rasch MLE for b) ────────────
const byItem = new Map(); // id → [{theta, correct}]
for (const r of rows) {
  const th = Number(r.theta);
  for (const [id, ok] of Object.entries(r.item_correct)) {
    if (!byItem.has(id)) byItem.set(id, []);
    byItem.get(id).push({ theta: th, correct: ok === true });
  }
}

/** MLE of b given known θ's: solve Σ (y - 1/(1+e^-(θ-b))) = 0 by Newton. */
function observedB(pts) {
  let b = 0;
  for (let it = 0; it < 60; it++) {
    let g = 0;
    let h = 0;
    for (const { theta, correct } of pts) {
      const p = 1 / (1 + Math.exp(-(theta - b)));
      g += (correct ? 1 : 0) - p; // ∂LL/∂θ; ∂/∂b = -that
      h += p * (1 - p);
    }
    if (h < 1e-6) break;
    const step = -g / h; // note sign: increasing b lowers p
    b = Math.max(-4, Math.min(5, b + step));
    if (Math.abs(step) < 1e-4) break;
  }
  return b;
}

const report = [];
for (const [id, pts] of byItem) {
  const pass = pts.filter((p) => p.correct).length / pts.length;
  report.push({
    id,
    seen: pts.length,
    pass: Math.round(pass * 100),
    b: pts.length >= MIN_EXPOSURES ? observedB(pts).toFixed(2) : ", (low n)",
  });
}
report.sort((a, b) => a.seen - b.seen);

console.log(
  "\n── Observed item difficulty (compare to assigned b in items.ts) ──",
);
console.log("  item     seen   pass%   observed b");
for (const r of report) {
  console.log(
    `  ${r.id.padEnd(7)} ${String(r.seen).padStart(5)}  ${String(r.pass).padStart(5)}   ${r.b}`,
  );
}
console.log(
  "\nReport only, no changes written. Edit items.ts / scoring.ts by hand.",
);
