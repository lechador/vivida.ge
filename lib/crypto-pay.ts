import { randomBytes } from "node:crypto";
import { and, eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import { cryptoPurchases, type CryptoPurchase } from "@/db/schema";
import { grantPurchaseCredits } from "@/lib/credits";
import { USDC_PREMIUM_PASS, usdcCreditPack } from "@/lib/crypto-config";
import { type CheckoutTracking } from "@/lib/checkout-tracking";
import { sendMetaConversion } from "@/lib/meta-conversions";
import { getBillingIdentity, grantPremiumPassFromCrypto } from "@/lib/premium";
import { isPrivyConfigured } from "@/lib/privy";
import {
  USDC_MINT,
  base58Encode,
  isValidSolanaAddress,
  normalizeSignature,
  solanaRpcUrl,
  usdcCentsToBaseUnits,
  usdcDeltaForRecipient,
} from "@/lib/usdc-pure";

/**
 * Platform crypto rail (English site): credit packs and PRO passes paid in
 * USDC on Solana. The app never sends transactions — the buyer pays from
 * their own wallet (Privy embedded or external) and the server verifies the
 * on-chain transfer against the pending purchase row, then grants exactly
 * once (unique tx signature + idempotent grant).
 */

export const CRYPTO_PURCHASE_TTL_MS = 60 * 60 * 1000;

/** The platform wallet that receives USDC (env snapshot per purchase). */
export function receivingWallet(): string | null {
  const raw = process.env.SOLANA_WALLET?.trim();
  return raw && isValidSolanaAddress(raw) ? raw : null;
}

export function isCryptoPayConfigured(): boolean {
  return isPrivyConfigured() && receivingWallet() !== null;
}

/**
 * Per-purchase reference key: 32 random bytes as base58. It rides in the
 * Solana Pay URL and the transaction as a read-only account, so the server
 * can find the payment via getSignaturesForAddress without the buyer
 * pasting anything — and only THIS purchase's URL contains it.
 */
export function newPaymentReference(): string {
  return base58Encode(randomBytes(32));
}

export type CryptoPurchaseKind = "credits" | "premium_pass";

export async function createPendingCryptoPurchase(input: {
  userId: string;
  kind: CryptoPurchaseKind;
  packId?: unknown;
  product?: string | null;
  returnTo?: string | null;
}): Promise<CryptoPurchase> {
  const wallet = receivingWallet();
  if (!wallet) throw new Error("crypto rail is not configured");

  let packId: string | null = null;
  let credits: number | null = null;
  let days: number | null = null;
  let amountUsdcCents: number;

  if (input.kind === "credits") {
    const pack = usdcCreditPack(input.packId);
    if (!pack) throw new Error("bad_pack");
    packId = pack.id;
    credits = pack.credits;
    amountUsdcCents = pack.amountMinor;
  } else {
    days = USDC_PREMIUM_PASS.days;
    amountUsdcCents = USDC_PREMIUM_PASS.amountMinor;
  }

  const [row] = await db
    .insert(cryptoPurchases)
    .values({
      userId: input.userId,
      kind: input.kind,
      packId,
      credits,
      days,
      amountUsdcCents,
      recipientWallet: wallet,
      reference: newPaymentReference(),
      expiresAt: new Date(Date.now() + CRYPTO_PURCHASE_TTL_MS),
      product: input.product ?? null,
      returnTo: input.returnTo ?? null,
    })
    .returning();
  return row;
}

export async function getCryptoPurchase(
  id: string,
  userId: string,
): Promise<CryptoPurchase | null> {
  const [row] = await db
    .select()
    .from(cryptoPurchases)
    .where(and(eq(cryptoPurchases.id, id), eq(cryptoPurchases.userId, userId)))
    .limit(1);
  return row ?? null;
}

// ── On-chain verification ──────────────────────────────────────────────────

type RpcAccountKey = { pubkey?: unknown; signer?: unknown };

type RpcTxValue = {
  err: unknown;
  transaction?: {
    message?: { accountKeys?: RpcAccountKey[] };
  };
  meta?: {
    err?: unknown;
    preTokenBalances?: Array<{
      mint?: unknown;
      owner?: unknown;
      uiTokenAmount?: { amount?: unknown };
    }>;
    postTokenBalances?: Array<{
      mint?: unknown;
      owner?: unknown;
      uiTokenAmount?: { amount?: unknown };
    }>;
  } | null;
};

type TxFetchOutcome =
  | { kind: "ok"; value: RpcTxValue }
  | { kind: "not_found" }
  | { kind: "unavailable"; code?: number };

/**
 * `getTransaction` with `maxSupportedTransactionVersion: 255` — mainnet
 * already carries versioned transactions, and with a lower cap the RPC
 * answers HTTP 200 with a JSON-RPC error and no result, which must never be
 * collapsed into "paid" or into a permanent failure. A clean `result: null`
 * means the chain hasn't indexed the signature yet (normal for seconds after
 * a fresh payment) and stays a DISTINCT retryable outcome.
 */
export async function fetchConfirmedTransaction(
  signature: string,
): Promise<TxFetchOutcome> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);
  try {
    const res = await fetch(solanaRpcUrl(), {
      method: "POST",
      headers: { "content-type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getTransaction",
        params: [
          signature,
          { encoding: "jsonParsed", maxSupportedTransactionVersion: 255 },
        ],
      }),
    });
    if (!res.ok) return { kind: "unavailable" };
    const json = (await res.json().catch(() => null)) as {
      result?: RpcTxValue | null;
      error?: { code?: number; message?: unknown };
    } | null;
    if (!json) return { kind: "unavailable" };
    if (json.error) {
      // JSON-RPC error bodies are transient/retryable here (bad params for a
      // malformed signature never reach this call — normalizeSignature
      // rejects those first). Log the code; never claim a terminal failure.
      console.warn(
        "[crypto/verify] rpc error body:",
        JSON.stringify(json.error).slice(0, 200),
      );
      return { kind: "unavailable", code: json.error.code };
    }
    if (json.result == null) return { kind: "not_found" };
    return { kind: "ok", value: json.result };
  } catch {
    return { kind: "unavailable" };
  } finally {
    clearTimeout(timer);
  }
}

/** Newest confirmed (non-errored) signature that touched `reference`. */
export async function findReferenceSignature(
  reference: string,
): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);
  try {
    const res = await fetch(solanaRpcUrl(), {
      method: "POST",
      headers: { "content-type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getSignaturesForAddress",
        params: [reference, { limit: 5 }],
      }),
    });
    if (!res.ok) return null;
    const json = (await res.json().catch(() => null)) as {
      result?: Array<{ signature?: unknown; err?: unknown }> | null;
    } | null;
    const rows = json?.result ?? [];
    for (const row of rows) {
      if (typeof row?.signature === "string" && row.err == null) {
        return row.signature;
      }
    }
    return null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

type PaidCheck =
  | { ok: true }
  | {
      ok: false;
      reason: "failed" | "no_reference" | "underpaid";
      shortfallUsdcCents?: number;
    };

/**
 * The payment contract: a finalized, successful USDC credit to the
 * snapshotted recipient wallet for at least the snapshotted price, in a
 * transaction that carries this purchase's reference account. The reference
 * binding is what makes self-serve claims safe — a stranger's payment to the
 * same platform wallet can never be claimed against another purchase.
 */
export function checkPaidTransaction(
  tx: RpcTxValue,
  purchase: CryptoPurchase,
): PaidCheck {
  if (tx.err != null || tx.meta?.err != null) {
    return { ok: false, reason: "failed" };
  }
  const accountKeys = (tx.transaction?.message?.accountKeys ?? []).map((k) =>
    String(k?.pubkey ?? ""),
  );
  if (!accountKeys.includes(purchase.reference)) {
    return { ok: false, reason: "no_reference" };
  }
  const credited = usdcDeltaForRecipient(
    tx.meta?.preTokenBalances,
    tx.meta?.postTokenBalances,
    purchase.recipientWallet,
    USDC_MINT,
  );
  const expected = BigInt(usdcCentsToBaseUnits(purchase.amountUsdcCents));
  if (credited < expected) {
    const shortfallBaseUnits = expected - credited;
    const shortfallUsdcCents = Math.ceil(Number(shortfallBaseUnits) / 10_000);
    return { ok: false, reason: "underpaid", shortfallUsdcCents };
  }
  return { ok: true };
}

function firstSigner(tx: RpcTxValue): string | null {
  const signer = (tx.transaction?.message?.accountKeys ?? []).find(
    (k) => k?.signer === true,
  );
  const pubkey = signer?.pubkey;
  return typeof pubkey === "string" && isValidSolanaAddress(pubkey)
    ? pubkey
    : null;
}

function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    (err as { code?: unknown }).code === "23505"
  );
}

export type CryptoVerifyFailure =
  | "bad_signature"
  | "not_found"
  | "unavailable"
  | "underpaid"
  | "failed"
  | "no_reference"
  | "already_used";

export type CryptoConfirmOutcome =
  | { status: "confirmed"; purchase: CryptoPurchase; already: boolean }
  | { status: "pending" }
  | {
      status: "failed";
      reason: CryptoVerifyFailure;
      shortfallUsdcCents?: number;
    };

/**
 * Apply the purchase's grant. Runs on every confirmed read (not just the
 * first) on purpose: credit grants are idempotent on the tx signature, and
 * the premium pass elects a single grant runner via the row's grantedAt —
 * so a poll that races the original confirm can never double-credit.
 */
async function applyGrant(purchase: CryptoPurchase): Promise<void> {
  if (!purchase.txSignature) return;
  if (purchase.kind === "credits" && (purchase.credits ?? 0) > 0) {
    await grantPurchaseCredits(
      purchase.userId,
      purchase.credits as number,
      purchase.txSignature,
    );
    return;
  }
  if (purchase.kind === "premium_pass" && (purchase.days ?? 0) > 0) {
    await grantPremiumPassFromCrypto({
      purchaseId: purchase.id,
      userId: purchase.userId,
      days: purchase.days as number,
      amountMinor: purchase.amountUsdcCents,
      txSignature: purchase.txSignature,
    });
  }
}

/**
 * Verify + confirm one purchase.
 *
 * `signature` set → explicit submit (the wallet client just sent it, or the
 * buyer pasted it). `signature` null → auto-detect by scanning the
 * purchase's reference for a confirmed transfer (QR / deep-link payments).
 */
export async function confirmCryptoPurchase(input: {
  purchase: CryptoPurchase;
  signature?: string | null;
}): Promise<CryptoConfirmOutcome> {
  const purchase = input.purchase;

  // Already confirmed → idempotent; re-apply the (idempotent) grant so a
  // crash between claim and grant self-heals on the next poll.
  if (purchase.status === "confirmed") {
    await applyGrant(purchase);
    return { status: "confirmed", purchase, already: true };
  }

  let signature: string | null;
  if (input.signature != null) {
    signature = normalizeSignature(input.signature);
    if (!signature) return { status: "failed", reason: "bad_signature" };
  } else {
    signature = await findReferenceSignature(purchase.reference);
    if (!signature) return { status: "pending" };
  }

  // One signature funds one purchase. Pre-check, then catch the unique
  // constraint at claim time (a pre-check alone races under concurrency).
  const [claimedBy] = await db
    .select({ id: cryptoPurchases.id })
    .from(cryptoPurchases)
    .where(eq(cryptoPurchases.txSignature, signature))
    .limit(1);
  if (claimedBy && claimedBy.id !== purchase.id) {
    return { status: "failed", reason: "already_used" };
  }

  const fetched = await fetchConfirmedTransaction(signature);
  if (fetched.kind === "unavailable") {
    return { status: "failed", reason: "unavailable" };
  }
  if (fetched.kind === "not_found") {
    // Clean "not indexed yet" — retryable (normal seconds after payment).
    return { status: "failed", reason: "not_found" };
  }

  const check = checkPaidTransaction(fetched.value, purchase);
  if (!check.ok) {
    console.warn(
      `[crypto/verify] ${purchase.id} rejected: ${check.reason}` +
        (check.shortfallUsdcCents != null
          ? ` (short ${check.shortfallUsdcCents}¢)`
          : ""),
    );
    return {
      status: "failed",
      reason: check.reason,
      shortfallUsdcCents: check.shortfallUsdcCents,
    };
  }

  const payerWallet = firstSigner(fetched.value);

  // Claim: pending (or expired — on-chain money is the source of truth) →
  // confirmed, exactly once. A conditional UPDATE, not a blind write.
  let claimed: CryptoPurchase | null = null;
  try {
    const rows = await db
      .update(cryptoPurchases)
      .set({
        status: "confirmed",
        txSignature: signature,
        payerWallet,
        confirmedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(cryptoPurchases.id, purchase.id),
          inArray(cryptoPurchases.status, ["pending", "expired"]),
        ),
      )
      .returning();
    claimed = rows[0] ?? null;
  } catch (err) {
    if (isUniqueViolation(err)) {
      const current = await getCryptoPurchase(purchase.id, purchase.userId);
      if (current?.txSignature === signature) {
        await applyGrant(current);
        return { status: "confirmed", purchase: current, already: true };
      }
      return { status: "failed", reason: "already_used" };
    }
    throw err;
  }

  if (!claimed) {
    // Lost a simultaneous claim race (another tab/device verified) — answer
    // from a fresh read instead of 500ing.
    const current = await getCryptoPurchase(purchase.id, purchase.userId);
    if (current?.status === "confirmed") {
      await applyGrant(current);
      return { status: "confirmed", purchase: current, already: true };
    }
    return { status: "pending" };
  }

  await applyGrant(claimed);
  return { status: "confirmed", purchase: claimed, already: false };
}

/** Best-effort Meta CAPI Purchase for a freshly confirmed crypto purchase. */
export async function trackCryptoPurchaseCompletedBestEffort(input: {
  purchase: CryptoPurchase;
  tracking: CheckoutTracking;
}): Promise<void> {
  try {
    const tracking = input.tracking;
    if (!tracking.allowed) return;
    const identity = await getBillingIdentity(input.purchase.userId);
    await sendMetaConversion({
      eventName: "Purchase",
      eventId: `${input.purchase.txSignature}:purchase`,
      eventSourceUrl: tracking.sourceUrl,
      email: identity?.email,
      externalId: input.purchase.userId,
      countryCode: identity?.countryCode,
      clientIpAddress: tracking.clientIpAddress,
      clientUserAgent: tracking.clientUserAgent,
      fbp: tracking.fbp,
      fbc: tracking.fbc,
      value: input.purchase.amountUsdcCents / 100,
      currency: "USD",
      contentId:
        input.purchase.kind === "credits"
          ? `credits_${input.purchase.credits ?? "pack"}`
          : USDC_PREMIUM_PASS.key,
    });
  } catch (err) {
    console.warn(
      "[crypto/track] purchase event failed:",
      err instanceof Error ? err.message : String(err),
    );
  }
}
