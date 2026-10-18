import { afterEach, describe, expect, it, vi } from "vitest";

import { USDC_MINT } from "@/lib/bazaar-pure";

/**
 * Pins the server-side mapping of Solana RPC answers to payment reasons,
 * the money-facing contract of the verify-payment route:
 *   not indexed yet → "not_found"  (route → 202, buyer retries)
 *   transport/RPC failure → "unavailable" (route → 503)
 * These once collapsed into one reason, so buyers who verified seconds
 * after paying were told their payment "couldn't be matched".
 *
 * lib/bazaar.ts transitively imports @/db, which throws when DATABASE_URL
 * is unset (vitest has no DB env). The pool it builds is lazy and never
 * connects here, verifyBookingPayment only talks to fetch, so a
 * placeholder URL keeps this pin running in a plain `vitest run`.
 */
process.env.DATABASE_URL ||= "postgres://vitest:vitest@localhost:5432/vitest";

const WALLET = "11111111111111111111111111111111";
const OTHER_WALLET = "22222222222222222222222222222222";
const SIG = "5".repeat(88);

function rpcResponse(result: unknown): Response {
  return new Response(JSON.stringify({ jsonrpc: "2.0", id: 1, result }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

function txValue(overrides?: {
  amount?: string;
  owner?: string;
  signer?: boolean;
  signerPubkey?: string;
}) {
  const owner = overrides?.owner ?? WALLET;
  return {
    err: null,
    transaction: {
      message: {
        accountKeys: [
          {
            pubkey: overrides?.signerPubkey ?? WALLET,
            signer: overrides?.signer ?? true,
          },
        ],
      },
    },
    meta: {
      err: null,
      preTokenBalances: [],
      postTokenBalances: [
        {
          mint: USDC_MINT,
          owner,
          uiTokenAmount: { amount: overrides?.amount ?? "9990000" },
        },
      ],
    },
  };
}

async function verify(overrides?: { signer?: string }) {
  const { verifyBookingPayment } = await import("@/lib/bazaar");
  return verifyBookingPayment({
    signature: SIG,
    expectedProviderWallet: WALLET,
    expectedPriceCents: 999,
    alreadyUsed: false,
    expectedSigner: overrides?.signer ?? WALLET,
  });
}

describe("verifyBookingPayment outcome mapping", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("a clean null result is not_found (retryable), not unavailable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => rpcResponse(null)),
    );
    expect(await verify()).toEqual({ ok: false, reason: "not_found" });
  });

  it("an RPC failure is unavailable, never not_found", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("boom", { status: 500 })),
    );
    expect(await verify()).toEqual({ ok: false, reason: "unavailable" });
  });

  it("accepts an exact USDC credit with signer proof", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => rpcResponse(txValue())),
    );
    expect(await verify()).toEqual({ ok: true });
  });

  it("accepts overpay on the same recipient", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => rpcResponse(txValue({ amount: "20000000" }))),
    );
    expect(await verify()).toEqual({ ok: true });
  });

  it("rejects underpay even when the signer is right", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => rpcResponse(txValue({ amount: "100000" }))),
    );
    expect(await verify()).toEqual({ ok: false, reason: "underpaid" });
  });

  it("rejects a credit to a different recipient", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => rpcResponse(txValue({ owner: OTHER_WALLET }))),
    );
    expect(await verify()).toEqual({ ok: false, reason: "underpaid" });
  });

  it("rejects when the claimed payer is not a signer", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => rpcResponse(txValue({ signer: false }))),
    );
    expect(await verify()).toEqual({ ok: false, reason: "not_signer" });
  });

  it("already_used short-circuits before any network call", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const { verifyBookingPayment } = await import("@/lib/bazaar");
    const r = await verifyBookingPayment({
      signature: SIG,
      expectedProviderWallet: WALLET,
      expectedPriceCents: 999,
      alreadyUsed: true,
      expectedSigner: WALLET,
    });
    expect(r).toEqual({ ok: false, reason: "already_used" });
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
