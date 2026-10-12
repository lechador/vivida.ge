import { and, avg, count, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  bazaarBookings,
  bazaarProviders,
  bazaarReviews,
  bazaarServices,
} from "@/db/schema";
import {
  normalizeSignature,
  solanaRpcUrl,
  usdcCentsToBaseUnits,
  usdcDeltaForRecipient,
  USDC_MINT,
} from "./bazaar-pure";

/**
 * Insight Bazaar data access. Public list/detail shapes deliberately OMIT
 * buyerNote / deliveryText / payerWallet, private reading content only
 * leaves the DB through the booking-scoped getters below.
 */

export type PublicService = {
  id: string;
  title: string;
  description: string;
  category: string;
  priceUsdcCents: number;
  deliveryPromise: string;
  imageUrl: string | null;
  provider: {
    id: string;
    displayName: string;
    headline: string;
    bio: string;
    specialties: string[];
    avgRating100: number | null;
    reviewCount: number;
    avatarUrl: string | null;
  };
};

export function specialtiesOf(row: { specialties: string }): string[] {
  return row.specialties
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function listActiveServices(): Promise<PublicService[]> {
  const rows = await db
    .select({
      service: bazaarServices,
      provider: bazaarProviders,
    })
    .from(bazaarServices)
    .innerJoin(
      bazaarProviders,
      eq(bazaarServices.providerId, bazaarProviders.id),
    )
    .where(
      and(
        eq(bazaarServices.status, "active"),
        eq(bazaarProviders.status, "approved"),
      ),
    )
    .orderBy(desc(bazaarServices.createdAt))
    .limit(100);
  return rows.map(({ service, provider }) => ({
    id: service.id,
    title: service.title,
    description: service.description,
    category: service.category,
    priceUsdcCents: service.priceUsdcCents,
    deliveryPromise: service.deliveryPromise,
    imageUrl: service.imageUrl,
    provider: {
      id: provider.id,
      displayName: provider.displayName,
      headline: provider.headline,
      bio: provider.bio,
      specialties: specialtiesOf(provider),
      avgRating100: provider.avgRating100,
      reviewCount: provider.reviewCount,
      avatarUrl: provider.avatarUrl,
    },
  }));
}

export async function getPublicProvider(providerId: string) {
  const rows = await db
    .select()
    .from(bazaarProviders)
    .where(eq(bazaarProviders.id, providerId))
    .limit(1);
  const provider = rows[0];
  if (!provider || provider.status !== "approved") return null;
  const services = await db
    .select()
    .from(bazaarServices)
    .where(
      and(
        eq(bazaarServices.providerId, provider.id),
        eq(bazaarServices.status, "active"),
      ),
    )
    .orderBy(desc(bazaarServices.createdAt));
  const reviews = await db
    .select()
    .from(bazaarReviews)
    .where(eq(bazaarReviews.providerId, provider.id))
    .orderBy(desc(bazaarReviews.createdAt))
    .limit(20);
  return {
    id: provider.id,
    displayName: provider.displayName,
    headline: provider.headline,
    bio: provider.bio,
    specialties: specialtiesOf(provider),
    avgRating100: provider.avgRating100,
    reviewCount: provider.reviewCount,
    avatarUrl: provider.avatarUrl,
    services: services.map((s) => ({
      id: s.id,
      title: s.title,
      description: s.description,
      category: s.category,
      priceUsdcCents: s.priceUsdcCents,
      deliveryPromise: s.deliveryPromise,
      imageUrl: s.imageUrl,
    })),
    // Public review shape: no buyer ids, no booking linkage.
    reviews: reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt.toISOString(),
    })),
  };
}

export async function getPublicService(serviceId: string) {
  const rows = await db
    .select({
      service: bazaarServices,
      provider: bazaarProviders,
    })
    .from(bazaarServices)
    .innerJoin(
      bazaarProviders,
      eq(bazaarServices.providerId, bazaarProviders.id),
    )
    .where(eq(bazaarServices.id, serviceId))
    .limit(1);
  const row = rows[0];
  if (
    !row ||
    row.service.status !== "active" ||
    row.provider.status !== "approved"
  ) {
    return null;
  }
  return {
    id: row.service.id,
    title: row.service.title,
    description: row.service.description,
    category: row.service.category,
    priceUsdcCents: row.service.priceUsdcCents,
    deliveryPromise: row.service.deliveryPromise,
    imageUrl: row.service.imageUrl,
    // The buyer pays THIS address from their own wallet app.
    providerWallet: row.provider.solanaWallet,
    provider: {
      id: row.provider.id,
      displayName: row.provider.displayName,
      headline: row.provider.headline,
      bio: row.provider.bio,
      specialties: specialtiesOf(row.provider),
      avgRating100: row.provider.avgRating100,
      reviewCount: row.provider.reviewCount,
      avatarUrl: row.provider.avatarUrl,
    },
  };
}

export async function getProviderByUser(userId: string) {
  const rows = await db
    .select()
    .from(bazaarProviders)
    .where(eq(bazaarProviders.userId, userId))
    .limit(1);
  return rows[0] ?? null;
}

/** Service + provider when the viewer owns the provider profile, else null. */
export async function getOwnedService(serviceId: string, userId: string) {
  const rows = await db
    .select({
      service: bazaarServices,
      provider: bazaarProviders,
    })
    .from(bazaarServices)
    .innerJoin(
      bazaarProviders,
      eq(bazaarServices.providerId, bazaarProviders.id),
    )
    .where(eq(bazaarServices.id, serviceId))
    .limit(1);
  const row = rows[0];
  if (!row || row.provider.userId !== userId) return null;
  return row;
}

/** Owner user id of a service's provider (self-booking guard). */
export async function getServiceOwnerUserId(
  serviceId: string,
): Promise<string | null> {
  const rows = await db
    .select({ userId: bazaarProviders.userId })
    .from(bazaarServices)
    .innerJoin(
      bazaarProviders,
      eq(bazaarServices.providerId, bazaarProviders.id),
    )
    .where(eq(bazaarServices.id, serviceId))
    .limit(1);
  return rows[0]?.userId ?? null;
}

/** All services of the viewer's own provider profile (any status). */
export async function listOwnServices(userId: string) {
  const provider = await getProviderByUser(userId);
  if (!provider) return { provider: null, services: [] };
  const services = await db
    .select()
    .from(bazaarServices)
    .where(eq(bazaarServices.providerId, provider.id))
    .orderBy(desc(bazaarServices.createdAt));
  return { provider, services };
}

export async function getBookingForViewer(bookingId: string, userId: string) {
  const rows = await db
    .select({
      booking: bazaarBookings,
      service: bazaarServices,
      provider: bazaarProviders,
    })
    .from(bazaarBookings)
    .innerJoin(bazaarServices, eq(bazaarBookings.serviceId, bazaarServices.id))
    .innerJoin(
      bazaarProviders,
      eq(bazaarBookings.providerId, bazaarProviders.id),
    )
    .where(eq(bazaarBookings.id, bookingId))
    .limit(1);
  const row = rows[0];
  if (!row) return null;
  const isBuyer = row.booking.buyerUserId === userId;
  const isProvider = row.provider.userId === userId;
  if (!isBuyer && !isProvider) return null;
  return {
    ...row.booking,
    serviceTitle: row.service.title,
    providerDisplayName: row.provider.displayName,
    viewerRole: isBuyer ? ("buyer" as const) : ("provider" as const),
  };
}

export async function listBookingsForUser(userId: string) {
  const asBuyer = await db
    .select({
      booking: bazaarBookings,
      service: bazaarServices,
      provider: bazaarProviders,
    })
    .from(bazaarBookings)
    .innerJoin(bazaarServices, eq(bazaarBookings.serviceId, bazaarServices.id))
    .innerJoin(
      bazaarProviders,
      eq(bazaarBookings.providerId, bazaarProviders.id),
    )
    .where(eq(bazaarBookings.buyerUserId, userId))
    .orderBy(desc(bazaarBookings.createdAt))
    .limit(50);
  const ownProvider = await getProviderByUser(userId);
  const asProvider = ownProvider
    ? await db
        .select({
          booking: bazaarBookings,
          service: bazaarServices,
        })
        .from(bazaarBookings)
        .innerJoin(
          bazaarServices,
          eq(bazaarBookings.serviceId, bazaarServices.id),
        )
        .where(eq(bazaarBookings.providerId, ownProvider.id))
        .orderBy(desc(bazaarBookings.createdAt))
        .limit(50)
    : [];
  return {
    asBuyer: asBuyer.map((r) => ({
      id: r.booking.id,
      status: r.booking.status,
      priceUsdcCents: r.booking.priceUsdcCents,
      providerWallet: r.booking.providerWallet,
      deliveryText: r.booking.deliveryText,
      txSignature: r.booking.txSignature,
      createdAt: r.booking.createdAt.toISOString(),
      serviceId: r.service.id,
      serviceTitle: r.service.title,
      providerDisplayName: r.provider.displayName,
      providerId: r.provider.id,
    })),
    asProvider: asProvider.map((r) => ({
      id: r.booking.id,
      status: r.booking.status,
      priceUsdcCents: r.booking.priceUsdcCents,
      buyerNote: r.booking.buyerNote,
      deliveryText: r.booking.deliveryText,
      txSignature: r.booking.txSignature,
      createdAt: r.booking.createdAt.toISOString(),
      serviceId: r.service.id,
      serviceTitle: r.service.title,
    })),
    ownProvider: ownProvider
      ? {
          id: ownProvider.id,
          status: ownProvider.status,
          displayName: ownProvider.displayName,
          solanaWallet: ownProvider.solanaWallet,
        }
      : null,
  };
}

/** Recompute the denormalized rating after a new review lands. */
export async function refreshProviderRating(providerId: string) {
  const rows = await db
    .select({ n: count(), avg: avg(bazaarReviews.rating) })
    .from(bazaarReviews)
    .where(eq(bazaarReviews.providerId, providerId));
  const n = Number(rows[0]?.n ?? 0);
  const avgValue = rows[0]?.avg == null ? null : Number(rows[0].avg);
  await db
    .update(bazaarProviders)
    .set({
      reviewCount: n,
      avgRating100: avgValue == null ? null : Math.round(avgValue * 100),
      updatedAt: new Date(),
    })
    .where(eq(bazaarProviders.id, providerId));
}

// ── On-chain USDC verification ─────────────────────────────────────────────
// The app never sends transactions. The buyer pays from their own wallet and
// pastes the signature; this confirms a mainnet USDC credit to the exact
// provider wallet snapshot stored on the booking, then the booking flips to
// paid exactly once (status guard + unique tx_signature).

export type PaymentCheck =
  | { ok: true }
  | {
      ok: false;
      reason:
        | "not_found"
        | "failed"
        | "underpaid"
        | "unavailable"
        | "already_used"
        | "not_signer";
    };

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

/**
 * Outcomes stay distinct on purpose: `not_found` means the RPC answered
 * cleanly and the chain hasn't indexed this signature yet (normal for
 * seconds after a fresh payment, the caller maps it to a retryable 202);
 * `unavailable` means we never got an answer (timeout/HTTP/RPC error).
 * Collapsing the two once surfaced "no matching payment" to buyers who had
 * simply verified inside the indexing window.
 */
type TxFetchOutcome =
  | { kind: "ok"; value: RpcTxValue }
  | { kind: "not_found" }
  | { kind: "unavailable" };

async function fetchConfirmedTransaction(
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
          { encoding: "jsonParsed", maxSupportedTransactionVersion: 0 },
        ],
      }),
    });
    if (!res.ok) return { kind: "unavailable" };
    const json = (await res.json().catch(() => null)) as {
      result?: RpcTxValue | null;
    } | null;
    if (!json || !("result" in json)) return { kind: "unavailable" };
    // JSON-RPC answered: a null result = the signature is unknown to the
    // chain (typically just-sent txs the RPC hasn't indexed yet).
    if (json.result == null) return { kind: "not_found" };
    return { kind: "ok", value: json.result };
  } catch {
    return { kind: "unavailable" };
  } finally {
    clearTimeout(timer);
  }
}

export async function verifyBookingPayment(input: {
  signature: string;
  expectedProviderWallet: string;
  expectedPriceCents: number;
  alreadyUsed: boolean;
  /**
   * Claimed payer wallet. When present it MUST appear as a signer on the
   * transaction, otherwise anyone could claim a stranger's payment to the
   * same provider as their own and get a free reading.
   */
  expectedSigner?: string | null;
}): Promise<PaymentCheck> {
  const signature = normalizeSignature(input.signature);
  if (!signature) return { ok: false, reason: "not_found" };
  if (input.alreadyUsed) return { ok: false, reason: "already_used" };
  const fetched = await fetchConfirmedTransaction(signature);
  if (fetched.kind === "unavailable")
    return { ok: false, reason: "unavailable" };
  if (fetched.kind === "not_found") return { ok: false, reason: "not_found" };
  const tx = fetched.value;
  if (tx.err != null || tx.meta?.err != null) {
    return { ok: false, reason: "failed" };
  }
  const credited = usdcDeltaForRecipient(
    tx.meta?.preTokenBalances,
    tx.meta?.postTokenBalances,
    input.expectedProviderWallet,
    USDC_MINT,
  );
  const expected = BigInt(usdcCentsToBaseUnits(input.expectedPriceCents));
  if (credited < expected) return { ok: false, reason: "underpaid" };
  if (input.expectedSigner) {
    const signers = (tx.transaction?.message?.accountKeys ?? [])
      .filter((k) => k?.signer === true)
      .map((k) => String(k?.pubkey ?? ""));
    if (!signers.includes(input.expectedSigner)) {
      return { ok: false, reason: "not_signer" };
    }
  }
  return { ok: true };
}

/** True when no other booking already claimed this signature. */
export async function isSignatureUnused(
  signature: string,
  exceptBookingId: string,
): Promise<boolean> {
  const rows = await db
    .select({ id: bazaarBookings.id })
    .from(bazaarBookings)
    .where(eq(bazaarBookings.txSignature, signature))
    .limit(5);
  return rows.every((r) => r.id === exceptBookingId);
}
