/**
 * Halloween Low-Credit Win-Back Campaign (1 month unlimited PRO for ₾9.99).
 *
 * Targets users with <= 3 credits who spent credits down to <= 3 and still
 * returned to the site afterwards.
 *
 * Usage:
 *   npx tsx scripts/send-halloween-promo.mts                        # dry-run preflight
 *   npx tsx scripts/send-halloween-promo.mts --ensure-stripe        # create/verify ₾9.99 Stripe price
 *   npx tsx scripts/send-halloween-promo.mts --test=you@example.com # send test email + entitle tester
 *   npx tsx scripts/send-halloween-promo.mts --execute              # ensure Stripe price + send campaign
 */
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import Stripe from "stripe";

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

const { HALLOWEEN_PROMO_PLAN, PREMIUM_PLANS_BY_COUNTRY } =
  await import("@/lib/billing-config");
const {
  LOW_CREDIT_OFFER_CAMPAIGN_SLUG,
  LOW_CREDIT_OFFER_ENDS_AT,
  LOW_CREDIT_OFFER_THRESHOLD,
} = await import("@/lib/promo-offer");
const { ensureLowCreditOfferCampaign, sendBulk, sendLowCreditOfferTest } =
  await import("@/lib/email-marketing");

const ensureStripeFlag = process.argv.includes("--ensure-stripe");
const executeFlag = process.argv.includes("--execute");
const testArg = process.argv.find((a) => a.startsWith("--test="));
const testEmail = testArg ? testArg.slice("--test=".length).trim() : null;

async function ensureStripePrice(
  createIfMissing: boolean,
): Promise<string | null> {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    console.warn("⚠ STRIPE_SECRET_KEY is not set; skipping Stripe check.");
    return null;
  }
  const stripe = new Stripe(secret);
  const existing = await stripe.prices.list({
    active: true,
    lookup_keys: [HALLOWEEN_PROMO_PLAN.stripeLookupKey],
    limit: 1,
  });

  if (existing.data[0]) {
    const p = existing.data[0];
    console.log(
      `✓ Stripe price ready: ${p.id} (${p.lookup_key}, ${p.unit_amount} ${p.currency}/${p.recurring?.interval})`,
    );
    return p.id;
  }

  if (!createIfMissing) {
    console.log(
      `• Stripe price ${HALLOWEEN_PROMO_PLAN.stripeLookupKey} not created yet (pass --ensure-stripe or --execute to create).`,
    );
    return null;
  }

  // Find the Georgian PRO product from the existing monthly price
  const anchorPrices = await stripe.prices.list({
    lookup_keys: [PREMIUM_PLANS_BY_COUNTRY.GE.stripeLookupKey],
    limit: 1,
  });
  const productId =
    typeof anchorPrices.data[0]?.product === "string"
      ? anchorPrices.data[0].product
      : anchorPrices.data[0]?.product?.id;

  if (!productId) {
    throw new Error(
      `Could not find Stripe product via ${PREMIUM_PLANS_BY_COUNTRY.GE.stripeLookupKey}`,
    );
  }

  const created = await stripe.prices.create({
    product: productId,
    currency: HALLOWEEN_PROMO_PLAN.currency,
    unit_amount: HALLOWEEN_PROMO_PLAN.amountMinor,
    recurring: {
      interval: HALLOWEEN_PROMO_PLAN.interval,
      interval_count: HALLOWEEN_PROMO_PLAN.intervalCount ?? 1,
    },
    lookup_key: HALLOWEEN_PROMO_PLAN.stripeLookupKey,
    transfer_lookup_key: true,
    nickname: "Georgia Halloween promo monthly 9.99 GEL",
    metadata: {
      planKey: HALLOWEEN_PROMO_PLAN.key,
      countryCode: HALLOWEEN_PROMO_PLAN.countryCode,
      promo: "halloween_2026",
    },
  });

  console.log(
    `✓ Created Stripe price: ${created.id} (${created.lookup_key} → ₾9.99/month on product ${productId})`,
  );
  return created.id;
}

console.log("=== Halloween Low-Credit Win-Back Promo ===");
console.log(`Campaign slug : ${LOW_CREDIT_OFFER_CAMPAIGN_SLUG}`);
console.log(
  `Plan key      : ${HALLOWEEN_PROMO_PLAN.key} (₾${(HALLOWEEN_PROMO_PLAN.amountMinor / 100).toFixed(2)}/month)`,
);
console.log(
  `Credit gate   : <= ${LOW_CREDIT_OFFER_THRESHOLD} credits (spent & returned)`,
);
console.log(`Expires at    : ${LOW_CREDIT_OFFER_ENDS_AT.toISOString()}`);
console.log("");

await ensureStripePrice(ensureStripeFlag || executeFlag || Boolean(testEmail));

if (testEmail) {
  console.log(`\nSending test Halloween offer email to ${testEmail}...`);
  const ok = await sendLowCreditOfferTest(testEmail);
  console.log(
    ok
      ? `✓ Sent test email to ${testEmail} and unlocked /credits offer card.`
      : `✗ Test send skipped.`,
  );
  process.exit(ok ? 0 : 1);
}

if (!executeFlag) {
  const dry = await sendBulk({
    template: "low_credit_offer",
    dryRun: true,
  });
  console.log(
    `\nDry-run audience count: ${dry.audienceTotal} eligible recipients.`,
  );
  console.log(
    "Pass --test=you@example.com to send a test, or --execute to launch the campaign.",
  );
  process.exit(0);
}

const campaign = await ensureLowCreditOfferCampaign();
console.log(`\nLaunching campaign (${campaign.id})...`);
const result = await sendBulk({
  template: "low_credit_offer",
  campaignId: campaign.id,
});
console.log("\n=== Campaign Result ===");
console.log(JSON.stringify(result, null, 2));
process.exit(result.failed.length > 0 ? 1 : 0);
