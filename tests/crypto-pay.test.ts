import { afterEach, describe, expect, it, vi } from "vitest";

import { USDC_MINT } from "@/lib/usdc-pure";
import type { CryptoPurchase } from "@/db/schema";

/**
 * Pins the money-facing contract of the USDC purchase verification:
 *   not indexed yet → "not_found" (retryable)
 *   transport / JSON-RPC failure → "unavailable" (retryable, code logged)
 *   a matching reference + full credit → paid
 *   underpay / wrong recipient / missing reference / failed tx → rejected
 * Also pins the version-tolerant getTransaction call and the Solana Pay URL
 * builder (reference included, %20 not "+").
 *
 * lib/crypto-pay.ts transitively imports @/db, which throws when
 * DATABASE_URL is unset. The pool it builds is lazy and never connects here —
 * the tested helpers only talk to fetch — so a placeholder keeps this pin
 * running in a plain `vitest run`.
 */
process.env.DATABASE_URL ||= "postgres://vitest:***@localhost:5432/vitest";

// 32-byte base58 fixtures: all-1s is 32 zero bytes; "z"×43 decodes to 32
// bytes (a valid address); "z"×44 decodes to 33 bytes (regex-valid but
// unpayable — the case strict validation exists for).
const RECIPIENT = "1".repeat(32);
const REFERENCE = "z".repeat(43);
const OTHER_WALLET = "1".repeat(31) + "2";
const SIG = "5".repeat(88);

function rpcResponse(body: Record<string, unknown>): Response {
  return new Response(JSON.stringify({ jsonrpc: "2.0", id: 1, ...body }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

function txValue(overrides?: {
  amount?: string;
  owner?: string;
  includeReference?: boolean;
  err?: unknown;
}) {
  return {
    err: overrides?.err ?? null,
    transaction: {
      message: {
        accountKeys: [
          { pubkey: RECIPIENT, signer: true },
          ...(overrides?.includeReference === false
            ? []
            : [{ pubkey: REFERENCE, signer: false }]),
        ],
      },
    },
    meta: {
      err: null,
      preTokenBalances: [],
      postTokenBalances: [
        {
          mint: USDC_MINT,
          owner: overrides?.owner ?? RECIPIENT,
          uiTokenAmount: { amount: overrides?.amount ?? "9990000" },
        },
      ],
    },
  };
}

const PURCHASE = {
  reference: REFERENCE,
  recipientWallet: RECIPIENT,
  amountUsdcCents: 999,
} as unknown as CryptoPurchase;

describe("fetchConfirmedTransaction outcome mapping", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("asks for a version-tolerant getTransaction (255)", async () => {
    const fetchSpy = vi.fn(async () => rpcResponse({ result: txValue() }));
    vi.stubGlobal("fetch", fetchSpy);
    const { fetchConfirmedTransaction } = await import("@/lib/crypto-pay");
    await fetchConfirmedTransaction(SIG);
    const call = fetchSpy.mock.calls[0] as unknown as
      [unknown, { body: string }] | undefined;
    const body = JSON.parse(call?.[1]?.body ?? "{}") as { params: unknown[] };
    expect(body.params[1]).toMatchObject({
      maxSupportedTransactionVersion: 255,
    });
  });

  it("a clean null result is not_found (retryable), not unavailable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => rpcResponse({ result: null })),
    );
    const { fetchConfirmedTransaction } = await import("@/lib/crypto-pay");
    expect(await fetchConfirmedTransaction(SIG)).toEqual({ kind: "not_found" });
  });

  it("a JSON-RPC error body is unavailable with its code — never paid, never permanent", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        rpcResponse({
          error: { code: -32015, message: "unsupported version" },
        }),
      ),
    );
    const { fetchConfirmedTransaction } = await import("@/lib/crypto-pay");
    expect(await fetchConfirmedTransaction(SIG)).toEqual({
      kind: "unavailable",
      code: -32015,
    });
  });

  it("an HTTP failure is unavailable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("boom", { status: 500 })),
    );
    const { fetchConfirmedTransaction } = await import("@/lib/crypto-pay");
    expect(await fetchConfirmedTransaction(SIG)).toEqual({
      kind: "unavailable",
    });
  });

  it("a confirmed transaction comes back as ok", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => rpcResponse({ result: txValue() })),
    );
    const { fetchConfirmedTransaction } = await import("@/lib/crypto-pay");
    const outcome = await fetchConfirmedTransaction(SIG);
    expect(outcome.kind).toBe("ok");
  });
});

describe("checkPaidTransaction", () => {
  it("accepts an exact credit carrying the purchase reference", async () => {
    const { checkPaidTransaction } = await import("@/lib/crypto-pay");
    expect(checkPaidTransaction(txValue(), PURCHASE)).toEqual({ ok: true });
  });

  it("accepts overpay", async () => {
    const { checkPaidTransaction } = await import("@/lib/crypto-pay");
    expect(
      checkPaidTransaction(txValue({ amount: "20000000" }), PURCHASE),
    ).toEqual({ ok: true });
  });

  it("rejects underpay with the exact shortfall", async () => {
    const { checkPaidTransaction } = await import("@/lib/crypto-pay");
    // 0.10 USDC arrived; 9.99 was due → 989 cents short.
    expect(
      checkPaidTransaction(txValue({ amount: "100000" }), PURCHASE),
    ).toEqual({ ok: false, reason: "underpaid", shortfallUsdcCents: 989 });
  });

  it("rejects a credit to a different recipient", async () => {
    const { checkPaidTransaction } = await import("@/lib/crypto-pay");
    expect(
      checkPaidTransaction(txValue({ owner: OTHER_WALLET }), PURCHASE),
    ).toEqual({ ok: false, reason: "underpaid", shortfallUsdcCents: 999 });
  });

  it("rejects a transaction without the purchase reference", async () => {
    const { checkPaidTransaction } = await import("@/lib/crypto-pay");
    expect(
      checkPaidTransaction(txValue({ includeReference: false }), PURCHASE),
    ).toEqual({ ok: false, reason: "no_reference" });
  });

  it("rejects a failed transaction", async () => {
    const { checkPaidTransaction } = await import("@/lib/crypto-pay");
    expect(
      checkPaidTransaction(
        txValue({ err: { InstructionError: [0, 1] } }),
        PURCHASE,
      ),
    ).toEqual({ ok: false, reason: "failed" });
  });
});

describe("findReferenceSignature", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("picks the newest non-errored signature", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        rpcResponse({
          result: [
            { signature: "errsig", err: { some: "error" } },
            { signature: "goodsig", err: null },
          ],
        }),
      ),
    );
    const { findReferenceSignature } = await import("@/lib/crypto-pay");
    expect(await findReferenceSignature(REFERENCE)).toBe("goodsig");
  });

  it("returns null while the reference has no confirmed transactions", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => rpcResponse({ result: [] })),
    );
    const { findReferenceSignature } = await import("@/lib/crypto-pay");
    expect(await findReferenceSignature(REFERENCE)).toBe(null);
  });
});

describe("Solana Pay URL + address strictness", () => {
  it("carries the reference and encodes spaces as %20", async () => {
    const { buildSolanaPayUrl } = await import("@/lib/usdc-pure");
    const url = buildSolanaPayUrl({
      recipient: RECIPIENT,
      priceUsdcCents: 299,
      label: "Vivida",
      message: "30 Vivida credits",
      reference: REFERENCE,
    });
    expect(url).toBe(
      `solana:${RECIPIENT}?amount=2.99&spl-token=${USDC_MINT}&label=Vivida&message=30%20Vivida%20credits&reference=${REFERENCE}`,
    );
  });

  it("rejects 44-char base58 that decodes to 33 bytes", async () => {
    const { isValidSolanaAddress } = await import("@/lib/usdc-pure");
    expect(isValidSolanaAddress("z".repeat(44))).toBe(false);
    expect(isValidSolanaAddress("z".repeat(43))).toBe(true);
    expect(isValidSolanaAddress(RECIPIENT)).toBe(true);
  });
});
