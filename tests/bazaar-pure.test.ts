import { describe, expect, it } from "vitest";

import {
  formatUsdc,
  buildSolanaPayUrl,
  isValidSolanaAddress,
  normalizeCategory,
  normalizeSignature,
  usdcCentsToBaseUnits,
  usdcDeltaForRecipient,
  USDC_MINT,
  validateProviderInput,
  validateRating,
  validateServiceInput,
} from "@/lib/bazaar-pure";

const PROVIDER = "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU";
const BUYER_ATA = "9xQeWvG816bUx9EPjFWdd5AufqSSqeM2qN1xzybapC8G4wE";

function balances(owner: string, pre: string, post: string) {
  const row = (amount: string) => ({
    mint: USDC_MINT,
    owner,
    uiTokenAmount: { amount },
  });
  return { pre: [row(pre)], post: [row(post)] };
}

describe("bazaar-pure", () => {
  it("validates Solana addresses", () => {
    expect(isValidSolanaAddress(PROVIDER)).toBe(true);
    expect(isValidSolanaAddress(USDC_MINT)).toBe(true);
    expect(isValidSolanaAddress("not an address!!")).toBe(false);
    expect(isValidSolanaAddress("0x1234")).toBe(false);
    expect(isValidSolanaAddress(null)).toBe(false);
  });

  it("converts cents to USDC base units", () => {
    expect(usdcCentsToBaseUnits(999)).toBe(9_990_000);
    expect(usdcCentsToBaseUnits(100)).toBe(1_000_000);
    expect(formatUsdc(999)).toBe("9.99 USDC");
  });

  it("sums the recipient USDC delta across token accounts", () => {
    // 9.99 USDC arriving from zero.
    const { pre, post } = balances(PROVIDER, "0", "9990000");
    expect(usdcDeltaForRecipient(pre, post, PROVIDER)).toBe(BigInt(9_990_000));
    // Unrelated mints and owners are ignored.
    expect(
      usdcDeltaForRecipient(
        [
          {
            mint: "OtherMint",
            owner: PROVIDER,
            uiTokenAmount: { amount: "5" },
          },
        ],
        [
          {
            mint: "OtherMint",
            owner: PROVIDER,
            uiTokenAmount: { amount: "5000000" },
          },
        ],
        PROVIDER,
      ),
    ).toBe(BigInt(0));
    // No movement → zero.
    const flat = balances(PROVIDER, "1000000", "1000000");
    expect(usdcDeltaForRecipient(flat.pre, flat.post, PROVIDER)).toBe(
      BigInt(0),
    );
  });

  it("normalizes signatures and rejects explorer URLs", () => {
    const sig = "5".repeat(88);
    expect(normalizeSignature(sig)).toBe(sig);
    expect(normalizeSignature(`https://solscan.io/tx/${sig}`)).toBe(null);
    expect(normalizeSignature("short")).toBe(null);
    expect(normalizeSignature("0".repeat(88))).toBe(null); // 0 is not base58
  });

  it("rejects base58 strings that don't decode to 64 bytes", () => {
    // 88 valid base58 chars but 65 bytes, the RPC's `WrongSize` case.
    expect(normalizeSignature("z".repeat(88))).toBe(null);
    // 87 chars decoding to exactly 64 bytes stays accepted.
    const sig = "a".repeat(87);
    expect(normalizeSignature(sig)).toBe(sig);
  });

  it("validates provider applications", () => {
    const good = validateProviderInput({
      displayName: "Maya",
      headline: "Tarot reader",
      bio: "Ten years of readings.",
      specialties: ["tarot", "bogus"],
      solanaWallet: PROVIDER,
    });
    expect(good.ok).toBe(true);
    if (good.ok) {
      expect(good.value.specialties).toEqual(["tarot", "other"]);
      expect(good.value.solanaWallet).toBe(PROVIDER);
    }
    expect(
      validateProviderInput({
        displayName: "Maya",
        headline: "Tarot",
        bio: "Bio",
        solanaWallet: "nope",
      }).ok,
    ).toBe(false);
    expect(
      validateProviderInput({
        displayName: "",
        headline: "Tarot",
        bio: "Bio",
        solanaWallet: PROVIDER,
      }).ok,
    ).toBe(false);
    void BUYER_ATA;
  });

  it("validates services with a price floor and cap", () => {
    expect(
      validateServiceInput({
        title: "Celtic cross",
        description: "A full ten-card spread.",
        category: "tarot",
        priceUsdcCents: 1500,
        deliveryPromise: "within 24h",
      }).ok,
    ).toBe(true);
    expect(
      validateServiceInput({
        title: "x",
        description: "y",
        priceUsdcCents: 50, // under the $1 floor
      }).ok,
    ).toBe(false);
    expect(
      validateServiceInput({
        title: "x",
        description: "y",
        priceUsdcCents: 99999999,
      }).ok,
    ).toBe(false);
    expect(normalizeCategory("natal")).toBe("natal");
    expect(normalizeCategory("everything")).toBe("other");
  });

  it("validates ratings 1–5", () => {
    expect(validateRating(5)).toBe(5);
    expect(validateRating(0)).toBe(null);
    expect(validateRating(6)).toBe(null);
    expect(validateRating("4")).toBe(4);
  });

  it("builds Solana Pay URLs for exact-amount checkout", () => {
    const url = buildSolanaPayUrl({
      recipient: PROVIDER,
      priceUsdcCents: 1999,
      label: "Vivida",
      message: "Reading",
    });
    expect(url).toBe(
      `solana:${PROVIDER}?amount=19.99&spl-token=${USDC_MINT}&label=Vivida&message=Reading`,
    );
    expect(buildSolanaPayUrl({ recipient: "nope", priceUsdcCents: 1999 })).toBe(
      null,
    );
    expect(buildSolanaPayUrl({ recipient: PROVIDER, priceUsdcCents: 0 })).toBe(
      null,
    );
  });
});

describe("serviceCover", () => {
  it("prefers the service image, else the category cover", async () => {
    const { serviceCover } = await import("@/lib/bazaar-pure");
    expect(serviceCover("https://x.test/a.webp", "tarot")).toBe(
      "https://x.test/a.webp",
    );
    expect(serviceCover(null, "natal")).toContain("r2.dev/bazaar/");
    expect(serviceCover(null, "bogus")).toContain("saturn-return");
  });
});
