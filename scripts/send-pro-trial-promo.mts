/**
 * PRO Free Trial Launch Campaign (7 days of unlimited PRO, ₾0 today).
 *
 * Targets every marketing-consented user who has never had a subscription
 * (trial eligibility) and is not PRO right now. Prepared 2026-11-03 for the
 * 2026-11-04 morning send.
 *
 * Usage:
 *   npx tsx scripts/send-pro-trial-promo.mts                        # dry-run audience count
 *   npx tsx scripts/send-pro-trial-promo.mts --test=you@example.com # send one real test email
 *   npx tsx scripts/send-pro-trial-promo.mts --execute              # create campaign + send all
 *   npx tsx scripts/send-pro-trial-promo.mts --execute --limit=500  # send the next batch of 500
 *
 * Retrying --execute is safe: recipients with a sent row on the campaign
 * are excluded before anyone is mailed twice.
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

const { PRO_TRIAL_DAYS } = await import("@/lib/billing-config");
const {
  ensureProTrialCampaign,
  sendBulk,
  sendProTrialTest,
  PRO_TRIAL_CAMPAIGN_SLUG,
} = await import("@/lib/email-marketing");

const executeFlag = process.argv.includes("--execute");
const testArg = process.argv.find((a) => a.startsWith("--test="));
const testEmail = testArg ? testArg.slice("--test=".length).trim() : null;
const limitArg = process.argv.find((a) => a.startsWith("--limit="));
const limit = limitArg
  ? Number.parseInt(limitArg.slice("--limit=".length), 10)
  : NaN;

console.log("=== PRO Free Trial Launch Campaign ===");
console.log(`Campaign slug : ${PRO_TRIAL_CAMPAIGN_SLUG}`);
console.log(
  `Offer         : ${PRO_TRIAL_DAYS} days unlimited PRO free, then buyer's chosen plan`,
);
console.log(
  "Audience      : email_marketing = true, never subscribed, not PRO now",
);
console.log("");

if (testEmail) {
  console.log(`Sending test PRO trial email to ${testEmail}...`);
  const ok = await sendProTrialTest(testEmail);
  console.log(
    ok ? `✓ Sent test email to ${testEmail}.` : "✗ Test send skipped.",
  );
  process.exit(ok ? 0 : 1);
}

if (!executeFlag) {
  const dry = await sendBulk({ template: "pro_trial", dryRun: true });
  console.log(
    `Dry-run audience count: ${dry.audienceTotal} eligible recipients.`,
  );
  console.log(
    "Pass --test=you@example.com to send a test, or --execute to launch the campaign.",
  );
  process.exit(0);
}

const campaign = await ensureProTrialCampaign();
console.log(
  `Launching campaign (${campaign.id})${Number.isFinite(limit) && limit > 0 ? `, batch limit ${limit}` : ""}...`,
);
const result = await sendBulk({
  template: "pro_trial",
  campaignId: campaign.id,
  limit: Number.isFinite(limit) && limit > 0 ? limit : undefined,
});
console.log("\n=== Campaign Result ===");
console.log(JSON.stringify(result, null, 2));
process.exit(result.failed.length > 0 ? 1 : 0);
