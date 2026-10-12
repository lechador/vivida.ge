/**
 * Create the US / CA / AU / NZ PRO prices in Stripe.
 *
 * `priceForPlan()` in lib/stripe.ts looks each price up by lookup key and
 * throws if it is missing or disagrees with the catalogue, so PRO checkout in
 * these markets stays broken until this has been run against the live account
 * once. (Credit packs need nothing, they are inline `price_data`.)
 *
 * Idempotent per market: re-running finds the existing price and verifies it
 * instead of creating a duplicate.
 *
 * Usage:
 *   node scripts/create-dollar-market-stripe-prices.mjs            # dry run
 *   node scripts/create-dollar-market-stripe-prices.mjs --apply    # create
 *   node scripts/create-dollar-market-stripe-prices.mjs --apply --checkout-smoke
 *     # also creates + expires a live PRO Checkout Session per market
 */

import { config } from "dotenv";
import Stripe from "stripe";

config({ path: ".env.local" });

/**
 * Must stay in step with PREMIUM_PLANS_BY_COUNTRY in lib/billing-config.ts.
 * All four are standard two-decimal Stripe currencies, plain cents.
 *
 * This account keeps ONE PRODUCT PER MARKET, "Vivida PRO Georgia",
 * "Vivida PRO UK", "Vivida PRO Armenia", not one product carrying several
 * currency prices. Follow that when adding the next market.
 */
const PLANS = [
  {
    key: "premium_us_monthly",
    countryCode: "US",
    amountMinor: 999,
    currency: "usd",
    interval: "month",
    lookupKey: "vivida_premium_us_monthly_999_v1",
    productName: "Vivida PRO USA",
    priceNickname: "USA monthly unlimited plan",
  },
  {
    key: "premium_ca_monthly",
    countryCode: "CA",
    amountMinor: 1399,
    currency: "cad",
    interval: "month",
    lookupKey: "vivida_premium_ca_monthly_1399_v1",
    productName: "Vivida PRO Canada",
    priceNickname: "Canada monthly unlimited plan",
  },
  {
    key: "premium_au_monthly",
    countryCode: "AU",
    amountMinor: 1499,
    currency: "aud",
    interval: "month",
    lookupKey: "vivida_premium_au_monthly_1499_v1",
    productName: "Vivida PRO Australia",
    priceNickname: "Australia monthly unlimited plan",
  },
  {
    key: "premium_nz_monthly",
    countryCode: "NZ",
    amountMinor: 1699,
    currency: "nzd",
    interval: "month",
    lookupKey: "vivida_premium_nz_monthly_1699_v1",
    productName: "Vivida PRO New Zealand",
    priceNickname: "New Zealand monthly unlimited plan",
  },
];

const PRODUCT_DESCRIPTION =
  "Unlimited access to Vivida features, including verified profile badge. Billed monthly.";
// Same tax code as the Georgian, UK, and Armenian products; without it the
// product is "Needs info" for Managed Payments rather than "Eligible".
const TAX_CODE = "txcd_10103100";

const apply = process.argv.includes("--apply");
const checkoutSmoke = process.argv.includes("--checkout-smoke");
const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error("STRIPE_SECRET_KEY is not set in .env.local, aborting.");
  process.exit(1);
}

const stripe = new Stripe(key);
console.log(`Mode     ${key.startsWith("sk_live") ? "LIVE" : "test"}`);

async function runCheckoutSmoke(plan, price) {
  const marker = `${plan.countryCode.toLowerCase()}_launch_qa_${Date.now()}`;
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    client_reference_id: marker,
    metadata: {
      kind: "premium",
      userId: marker,
      planKey: plan.key,
      countryCode: plan.countryCode,
      qa: "true",
    },
    subscription_data: {
      metadata: {
        kind: "premium",
        userId: marker,
        planKey: plan.key,
        countryCode: plan.countryCode,
        qa: "true",
      },
      description: `Vivida PRO · ${plan.countryCode} launch QA`,
    },
    line_items: [{ price: price.id, quantity: 1 }],
    allow_promotion_codes: true,
    billing_address_collection: "auto",
    success_url:
      "https://www.vividaastro.com/subscription?status=success&session_id={CHECKOUT_SESSION_ID}",
    cancel_url: "https://www.vividaastro.com/subscription?status=canceled",
  });
  if (
    session.mode !== "subscription" ||
    session.currency !== plan.currency ||
    session.amount_total !== plan.amountMinor ||
    session.status !== "open" ||
    !session.url?.startsWith("https://checkout.stripe.com/")
  ) {
    throw new Error(
      `${plan.countryCode} Checkout mismatch: mode=${session.mode}, ` +
        `currency=${session.currency}, amount=${session.amount_total}, ` +
        `status=${session.status}`,
    );
  }
  console.log(`  ${plan.countryCode} Checkout verified: ${session.id}`);
  const expired = await stripe.checkout.sessions.expire(session.id);
  if (expired.status !== "expired") {
    throw new Error(
      `${plan.countryCode} Checkout session did not expire cleanly`,
    );
  }
  console.log(`  ${plan.countryCode} Checkout expired after QA.`);
}

let failures = 0;

for (const plan of PLANS) {
  console.log(`\nPlan     ${plan.key}`);
  console.log(
    `Price    ${plan.amountMinor / 100} ${plan.currency} (${plan.amountMinor} minor units)`,
  );
  console.log(`Lookup   ${plan.lookupKey}`);

  const existing = await stripe.prices.list({
    active: true,
    lookup_keys: [plan.lookupKey],
    limit: 1,
  });

  let price = existing.data[0] ?? null;
  if (price) {
    const matches =
      price.currency === plan.currency &&
      price.unit_amount === plan.amountMinor &&
      price.recurring?.interval === plan.interval &&
      (price.recurring?.interval_count ?? 1) === 1;
    console.log(`  Price already exists: ${price.id}`);
    if (!matches) {
      console.error(
        "  It does NOT match the catalogue, checkout will throw. Archive it " +
          "in Stripe and re-run, or correct lib/billing-config.ts.",
      );
      failures += 1;
      continue;
    }
    console.log("  It matches the catalogue. Nothing to do.");
  } else if (!apply) {
    console.log(
      "  Dry run, nothing created. Re-run with --apply to create it.",
    );
    continue;
  } else {
    // Reuse the market's product if it is already there, so a re-run after a
    // half-finished attempt does not leave duplicate products.
    const products = await stripe.products.search({
      query: `active:'true' AND name:'${plan.productName}'`,
      limit: 1,
    });
    const product =
      products.data[0] ??
      (await stripe.products.create({
        name: plan.productName,
        description: PRODUCT_DESCRIPTION,
        tax_code: TAX_CODE,
      }));

    price = await stripe.prices.create({
      product: product.id,
      currency: plan.currency,
      unit_amount: plan.amountMinor,
      recurring: { interval: plan.interval },
      lookup_key: plan.lookupKey,
      nickname: plan.priceNickname,
      metadata: { planKey: plan.key, countryCode: plan.countryCode },
    });
    console.log(`  Created price ${price.id} on product ${product.id}.`);
  }

  if (checkoutSmoke && price) await runCheckoutSmoke(plan, price);
}

if (failures > 0) {
  console.error(`\n${failures} market(s) need attention, see above.`);
  process.exit(1);
}
console.log("\nDone.");
