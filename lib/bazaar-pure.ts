/**
 * Insight Bazaar pure helpers, zero `@/db` imports so vitest loads this
 * without DATABASE_URL. DB access lives in `lib/bazaar.ts`.
 *
 * The USDC / Solana payment primitives moved to `lib/usdc-pure.ts` (shared
 * with the platform crypto rail) and are re-exported here so existing
 * bazaar imports keep working unchanged.
 */

import { isValidSolanaAddress } from "./usdc-pure";

export {
  USDC_MINT,
  USDC_DECIMALS,
  solanaRpcUrl,
  isValidSolanaAddress,
  base58Encode,
  usdcCentsToBaseUnits,
  formatUsdc,
  normalizeSignature,
  usdcDeltaForRecipient,
  buildSolanaPayUrl,
} from "./usdc-pure";

export const BAZAAR_CATEGORIES = [
  "tarot",
  "natal",
  "compatibility",
  "other",
] as const;
export type BazaarCategory = (typeof BAZAAR_CATEGORIES)[number];

/**
 * Editorial cover art for services without their own image. Same R2 bucket
 * as reader-uploaded covers; if the bucket's public base ever moves, these
 * four constants move with it.
 */
const BAZAAR_ART_BASE =
  "https://pub-7559ca5914024ba3a9e93e5f87debf06.r2.dev/bazaar";

const CATEGORY_COVERS: Record<string, string> = {
  tarot: `${BAZAAR_ART_BASE}/celtic-cross.webp`,
  natal: `${BAZAAR_ART_BASE}/natal-blueprint.webp`,
  compatibility: `${BAZAAR_ART_BASE}/compatibility-spread.webp`,
  other: `${BAZAAR_ART_BASE}/saturn-return.webp`,
};

/** Service cover: its own R2 image, else the category editorial cover. */
export function serviceCover(
  imageUrl: string | null | undefined,
  category: string,
): string {
  if (typeof imageUrl === "string" && imageUrl.startsWith("https://")) {
    return imageUrl;
  }
  return CATEGORY_COVERS[category] ?? CATEGORY_COVERS.other;
}

export function normalizeCategory(value: unknown): BazaarCategory {
  return typeof value === "string" &&
    (BAZAAR_CATEGORIES as readonly string[]).includes(value)
    ? (value as BazaarCategory)
    : "other";
}

export const PROVIDER_STATUSES = ["pending", "approved", "suspended"] as const;
export const SERVICE_STATUSES = ["active", "paused"] as const;
export const BOOKING_STATUSES = [
  "pending_payment",
  "paid",
  "delivered",
  "cancelled",
] as const;

export const PRICE_MIN_CENTS = 100; // $1 floor, dust payments aren't worth verifying
export const PRICE_MAX_CENTS = 500_00; // $500 cap for the no-escrow MVP

const MAX = {
  displayName: 60,
  headline: 120,
  bio: 2000,
  title: 90,
  description: 4000,
  deliveryPromise: 120,
  buyerNote: 4000,
  deliveryText: 20000,
  comment: 2000,
} as const;

function clean(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > max) return null;
  return trimmed;
}

export const limits = MAX;

export type ProviderInput = {
  displayName: string;
  headline: string;
  bio: string;
  specialties: BazaarCategory[];
  solanaWallet: string;
};

export function validateProviderInput(body: {
  displayName?: unknown;
  headline?: unknown;
  bio?: unknown;
  specialties?: unknown;
  solanaWallet?: unknown;
}): { ok: true; value: ProviderInput } | { ok: false; error: string } {
  const displayName = clean(body.displayName, MAX.displayName);
  const headline = clean(body.headline, MAX.headline);
  const bio = clean(body.bio, MAX.bio);
  if (!displayName || !headline || !bio) {
    return { ok: false, error: "invalid_profile_fields" };
  }
  const wallet =
    typeof body.solanaWallet === "string" ? body.solanaWallet.trim() : "";
  if (!isValidSolanaAddress(wallet)) {
    return { ok: false, error: "invalid_solana_wallet" };
  }
  const specialties = Array.isArray(body.specialties)
    ? body.specialties
        .filter((s): s is string => typeof s === "string")
        .map((s) => normalizeCategory(s.trim().toLowerCase()))
        .filter((s, i, arr) => arr.indexOf(s) === i)
        .slice(0, 4)
    : [];
  return {
    ok: true,
    value: { displayName, headline, bio, specialties, solanaWallet: wallet },
  };
}

export type ServiceInput = {
  title: string;
  description: string;
  category: BazaarCategory;
  priceUsdcCents: number;
  deliveryPromise: string;
};

export function validateServiceInput(body: {
  title?: unknown;
  description?: unknown;
  category?: unknown;
  priceUsdcCents?: unknown;
  deliveryPromise?: unknown;
}): { ok: true; value: ServiceInput } | { ok: false; error: string } {
  const title = clean(body.title, MAX.title);
  const description = clean(body.description, MAX.description);
  if (!title || !description) {
    return { ok: false, error: "invalid_service_fields" };
  }
  const price =
    typeof body.priceUsdcCents === "number"
      ? Math.round(body.priceUsdcCents)
      : Number.isInteger(Number(body.priceUsdcCents))
        ? Number(body.priceUsdcCents)
        : NaN;
  if (
    !Number.isInteger(price) ||
    price < PRICE_MIN_CENTS ||
    price > PRICE_MAX_CENTS
  ) {
    return { ok: false, error: "invalid_price" };
  }
  const deliveryPromise =
    typeof body.deliveryPromise === "string" &&
    body.deliveryPromise.trim().length <= MAX.deliveryPromise
      ? body.deliveryPromise.trim()
      : "";
  return {
    ok: true,
    value: {
      title,
      description,
      category: normalizeCategory(body.category),
      priceUsdcCents: price,
      deliveryPromise,
    },
  };
}

export function validateRating(value: unknown): number | null {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isInteger(n) && n >= 1 && n <= 5 ? n : null;
}
