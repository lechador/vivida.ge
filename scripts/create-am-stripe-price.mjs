/**
 * Create the Armenian PRO price in Stripe.
 *
 * `priceForPlan()` in lib/stripe.ts looks the price up by lookup key and throws
 * if it is missing or disagrees with the catalogue, so Armenian checkout stays
 * broken until this has been run against the live account once.
 *
 * Idempotent: re-running finds the existing price and verifies it instead of
 * creating a duplicate.
 *
 * Usage:
 *   node scripts/create-am-stripe-price.mjs            # dry run, prints the plan
 *   node scripts/create-am-stripe-price.mjs --apply    # actually creates it
 *   node scripts/create-am-stripe-price.mjs --checkout-smoke
 *     # creates live PRO + credit Checkout Sessions, validates AMD, then expires them
 */

import { config } from "dotenv";
import Stripe from "stripe";

config({ path: ".env.local" });

/**
 * Must stay in step with PREMIUM_PLANS_BY_COUNTRY.AM in lib/billing-config.ts.
 *
 * amountMinor is in luma: Stripe treats AMD as a two-decimal currency, so
 * ֏2,990/month is 299_000, not 2_990.
 */
const PLAN = {
  key: "premium_am_monthly",
  countryCode: "AM",
  amountMinor: 299_000,
  currency: "amd",
  interval: "month",
  lookupKey: "vivida_premium_am_monthly_299000_v1",
  // This account keeps ONE PRODUCT PER MARKET — "Vivida PRO Georgia",
  // "Vivida PRO UK", "Vivida PRO Armenia" — not one product carrying several
  // currency prices. Follow that when adding the next market.
  productName: "Vivida PRO Armenia",
  priceNickname: "Armenia monthly unlimited plan",
  productDescription:
    "Unlimited access to Vivida features, including verified profile badge. Billed monthly.",
  // Same tax code as the Georgian and UK products; without it the product is
  // "Needs info" for Managed Payments rather than "Eligible".
  taxCode: "txcd_10103100",
};

const apply = process.argv.includes("--apply");
const checkoutSmoke = process.argv.includes("--checkout-smoke");
const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error("STRIPE_SECRET_KEY is not set in .env.local — aborting.");
  process.exit(1);
}

const stripe = new Stripe(key);
const display = `֏${(PLAN.amountMinor / 100).toLocaleString("en-GB")}/month`;

async function expireCheckedSession(session, label, expectedAmount) {
  try {
    if (
      session.mode !== (label === "PRO" ? "subscription" : "payment") ||
      session.currency !== PLAN.currency ||
      session.amount_total !== expectedAmount ||
      session.status !== "open" ||
      !session.url?.startsWith("https://checkout.stripe.com/")
    ) {
      throw new Error(
        `${label} Checkout mismatch: mode=${session.mode}, currency=${session.currency}, ` +
        `amount=${session.amount_total}, status=${session.status}`,
      );
    }
    console.log(`${label} Checkout verified: ${session.id}`);
  } finally {
    if (session.status === "open") {
      const expired = await stripe.checkout.sessions.expire(session.id);
      if (expired.status !== "expired") {
        throw new Error(`${label} Checkout session did not expire cleanly`);
      }
      console.log(`${label} Checkout expired after QA.`);
    }
  }
}

async function runCheckoutSmoke(price) {
  const marker = `armenian_launch_qa_${Date.now()}`;
  const successUrl =
    "https://www.vividaastro.com/subscription?status=success&session_id={CHECKOUT_SESSION_ID}";

  const premium = await stripe.checkout.sessions.create({
    mode: "subscription",
    client_reference_id: marker,
    metadata: { kind: "premium", userId: marker, planKey: PLAN.key, countryCode: "AM", qa: "true" },
    subscription_data: {
      metadata: { kind: "premium", userId: marker, planKey: PLAN.key, countryCode: "AM", qa: "true" },
      description: "Vivida PRO · Armenian launch QA",
    },
    line_items: [{ price: price.id, quantity: 1 }],
    allow_promotion_codes: true,
    billing_address_collection: "auto",
    success_url: successUrl,
    cancel_url: "https://www.vividaastro.com/subscription?status=canceled",
  });
  await expireCheckedSession(premium, "PRO", PLAN.amountMinor);

  const creditAmount = 99_000;
  const credits = await stripe.checkout.sessions.create({
    mode: "payment",
    metadata: { userId: marker, kind: "credits", credits: "30", qa: "true" },
    payment_intent_data: {
      metadata: { userId: marker, kind: "credits", credits: "30", qa: "true" },
    },
    line_items: [{
      quantity: 1,
      price_data: {
        currency: PLAN.currency,
        unit_amount: creditAmount,
        product_data: {
          name: "30 Vivida կրեդիտ",
          description: "Vivida · 990 ֏ — 30 կրեդիտ",
        },
      },
    }],
    success_url:
      "https://www.vividaastro.com/credits?status=success&session_id={CHECKOUT_SESSION_ID}",
    cancel_url: "https://www.vividaastro.com/credits?status=canceled",
  });
  await expireCheckedSession(credits, "Credits", creditAmount);
}

console.log(`Plan     ${PLAN.key}`);
console.log(`Price    ${display}  (${PLAN.amountMinor} ${PLAN.currency} minor units)`);
console.log(`Lookup   ${PLAN.lookupKey}`);
console.log(`Mode     ${key.startsWith("sk_live") ? "LIVE" : "test"}`);

const existing = await stripe.prices.list({
  active: true,
  lookup_keys: [PLAN.lookupKey],
  limit: 1,
});

if (existing.data[0]) {
  const price = existing.data[0];
  const matches =
    price.currency === PLAN.currency &&
    price.unit_amount === PLAN.amountMinor &&
    price.recurring?.interval === PLAN.interval;
  console.log(`\nPrice already exists: ${price.id}`);
  if (!matches) {
    console.error(
      "It does NOT match the catalogue — checkout will throw. Archive it in " +
        "Stripe and re-run, or correct lib/billing-config.ts.",
    );
    process.exit(1);
  }
  console.log("It matches the catalogue. Nothing to do.");
  if (checkoutSmoke) await runCheckoutSmoke(price);
  process.exit(0);
}

if (!apply) {
  console.log("\nDry run — nothing created. Re-run with --apply to create it.");
  process.exit(0);
}

// Reuse the market's product if it is already there, so a re-run after a
// half-finished attempt does not leave two "Vivida PRO Armenia" products.
const products = await stripe.products.search({
  query: `active:'true' AND name:'${PLAN.productName}'`,
  limit: 1,
});
const product =
  products.data[0] ??
  (await stripe.products.create({
    name: PLAN.productName,
    description: PLAN.productDescription,
    tax_code: PLAN.taxCode,
  }));

const price = await stripe.prices.create({
  product: product.id,
  currency: PLAN.currency,
  unit_amount: PLAN.amountMinor,
  recurring: { interval: PLAN.interval },
  lookup_key: PLAN.lookupKey,
  nickname: PLAN.priceNickname,
  metadata: { planKey: PLAN.key, countryCode: PLAN.countryCode },
});

console.log(`\nCreated price ${price.id} on product ${product.id}.`);
console.log("Armenian PRO checkout is now live.");
if (checkoutSmoke) await runCheckoutSmoke(price);
