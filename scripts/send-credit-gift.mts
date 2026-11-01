/**
 * Credit-gift campaign: 10 free credits for engaged spenders who ran down
 * to <= 3 credits and never topped up (lib/credit-gift.ts).
 *
 * Usage:
 *   npx tsx scripts/send-credit-gift.mts                  # dry-run, audience count only
 *   npx tsx scripts/send-credit-gift.mts --test=you@…     # grant + send to one user (is_test)
 *   npx tsx scripts/send-credit-gift.mts --execute        # grant + email the whole cohort
 */
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

// Allow importing Next.js server modules ("server-only") from a standalone CLI script.
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

const { resolveCreditGiftAudience, runCreditGiftCampaign, sendCreditGiftTest } =
  await import("@/lib/credit-gift");

const executeFlag = process.argv.includes("--execute");
const testArg = process.argv.find((a) => a.startsWith("--test="));
const testEmail = testArg ? testArg.slice("--test=".length).trim() : null;

if (testEmail) {
  console.log(`Sending test credit-gift email to ${testEmail}...`);
  const ok = await sendCreditGiftTest(testEmail);
  console.log(
    ok
      ? `✓ Sent test email to ${testEmail} (10 credits granted if not PRO).`
      : `✗ No user found with email ${testEmail}.`,
  );
  process.exit(ok ? 0 : 1);
}

if (!executeFlag) {
  const audience = await resolveCreditGiftAudience();
  const byBalance = audience.reduce<Record<number, number>>((acc, r) => {
    acc[r.balance] = (acc[r.balance] ?? 0) + 1;
    return acc;
  }, {});
  console.log(`\nDry-run audience: ${audience.length} eligible recipients.`);
  console.log(`By balance: ${JSON.stringify(byBalance)}`);
  console.log(
    "Pass --test=you@example.com to send a test, or --execute to launch the campaign.",
  );
  process.exit(0);
}

console.log("Executing credit-gift campaign...");
const result = await runCreditGiftCampaign();
console.log(
  `Done. audience=${result.audience} granted=${result.granted} emailed=${result.emailed} skipped=${result.skipped} failed=${result.failed.length}`,
);
for (const f of result.failed) console.log(`  failed ${f.userId}: ${f.error}`);
process.exit(result.failed.length > 0 ? 1 : 0);
