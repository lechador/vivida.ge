/**
 * Solana USDC payment primitives shared by every crypto rail (the Insight
 * Bazaar bookings and the platform credit / PRO-pass purchases).
 *
 * Zero `@/db` and zero node-only imports: vitest loads this without
 * DATABASE_URL, and the client bundle can import the mint/amount helpers.
 */

/** Solana mainnet USDC mint (6 decimals). */
export const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
export const USDC_DECIMALS = 6;

export function solanaRpcUrl(): string {
  return (
    process.env.SOLANA_RPC_URL?.trim() || "https://api.mainnet-beta.solana.com"
  );
}

const BASE58_ALPHABET =
  "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

/** Loose charset+bounds check; exact byte length is checked separately. */
const BASE58_SHAPE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

/**
 * Decoded byte length of a base58 string (big-endian; leading '1's are
 * leading zero bytes). -1 when the string contains non-base58 characters.
 */
function base58ByteLength(value: string): number {
  let leadingZeros = 0;
  for (const ch of value) {
    if (ch !== "1") break;
    leadingZeros += 1;
  }
  let n = BigInt(0);
  const base = BigInt(58);
  for (const ch of value) {
    const digit = BASE58_ALPHABET.indexOf(ch);
    if (digit === -1) return -1;
    n = n * base + BigInt(digit);
  }
  let bytes = leadingZeros;
  const byte = BigInt(256);
  while (n > BigInt(0)) {
    n = n / byte;
    bytes += 1;
  }
  return bytes;
}

/**
 * A Solana address is base58 for exactly 32 bytes. The 32–44-char shape is
 * not enough on its own: 44 valid base58 chars can decode to 33 bytes, which
 * no wallet can pay — validation must decode.
 */
export function isValidSolanaAddress(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (!BASE58_SHAPE.test(trimmed)) return false;
  return base58ByteLength(trimmed) === 32;
}

/** base58-encode raw bytes (payment references are generated server-side). */
export function base58Encode(bytes: Uint8Array): string {
  let n = BigInt(0);
  const base = BigInt(58);
  const byte = BigInt(256);
  for (const b of bytes) n = n * byte + BigInt(b);
  let out = "";
  while (n > BigInt(0)) {
    out = BASE58_ALPHABET[Number(n % base)] + out;
    n = n / base;
  }
  let leadingZeros = 0;
  for (const b of bytes) {
    if (b !== 0) break;
    leadingZeros += 1;
  }
  return "1".repeat(leadingZeros) + out;
}

/** USDC cents (999) → base units (9_990_000). MVP cents keep 2-decimal math. */
export function usdcCentsToBaseUnits(cents: number): number {
  return Math.round(cents) * 10_000;
}

/** Base units → display string, e.g. 9_990_000 → "9.99". */
export function formatUsdc(cents: number): string {
  return `${(cents / 100).toFixed(2)} USDC`;
}

/**
 * Signature check: bounds and charset stay lenient, but the string must
 * decode to exactly 64 bytes — a real signature's size. Charset alone is
 * not enough: 88 chars of valid base58 can decode to 65+ bytes, which the
 * RPC rejects as `WrongSize`, surfacing to the buyer as unrelated
 * "network trouble" instead of "that's not a signature".
 */
export function normalizeSignature(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!/^[1-9A-HJ-NP-Za-km-z]{80,128}$/.test(trimmed)) return null;
  return base58ByteLength(trimmed) === 64 ? trimmed : null;
}

// ── On-chain USDC payment parsing ──────────────────────────────────────────
// getTransaction(jsonParsed) reports SPL balances in
// meta.preTokenBalances / postTokenBalances: [{ mint, owner, uiTokenAmount:
// { amount: "<base units>" } }]. The buyer pays a plain wallet, so the
// credit lands in its associated token account with owner == wallet.
// Summing the owner's delta across all accounts handles that without ever
// touching ATA derivation.

type TokenBalance = {
  mint?: unknown;
  owner?: unknown;
  uiTokenAmount?: { amount?: unknown };
};

function balanceAmount(b: TokenBalance): bigint {
  const raw = b?.uiTokenAmount?.amount;
  if (typeof raw !== "string" || !/^\d+$/.test(raw)) return BigInt(0);
  try {
    return BigInt(raw);
  } catch {
    return BigInt(0);
  }
}

/**
 * Net USDC base-unit delta credited to `recipientWallet` in one confirmed
 * transaction. Returns 0n when the tx carries no USDC movement to them.
 */
export function usdcDeltaForRecipient(
  preTokenBalances: TokenBalance[] | null | undefined,
  postTokenBalances: TokenBalance[] | null | undefined,
  recipientWallet: string,
  mint: string = USDC_MINT,
): bigint {
  const sum = (rows: TokenBalance[] | null | undefined): bigint =>
    (rows ?? []).reduce(
      (acc, b) =>
        b?.mint === mint && b?.owner === recipientWallet
          ? acc + balanceAmount(b)
          : acc,
      BigInt(0),
    );
  return sum(postTokenBalances) - sum(preTokenBalances);
}

/**
 * Solana Pay transfer URL for one fixed-price USDC payment. Opens the
 * buyer's wallet with recipient + exact amount prefilled — scan or tap.
 * `reference` (optional) rides along so the server can auto-detect the
 * payment via getSignaturesForAddress.
 *
 * Built with `encodeURIComponent`, NOT URLSearchParams: wallets render the
 * `+` that URLSearchParams emits for spaces literally.
 */
export function buildSolanaPayUrl(input: {
  recipient: string;
  priceUsdcCents: number;
  label?: string;
  message?: string;
  reference?: string;
}): string | null {
  const to = typeof input.recipient === "string" ? input.recipient.trim() : "";
  const cents = Math.round(Number(input.priceUsdcCents));
  if (!isValidSolanaAddress(to) || !Number.isInteger(cents) || cents <= 0) {
    return null;
  }
  const parts = [
    `amount=${(cents / 100).toFixed(2)}`,
    `spl-token=${USDC_MINT}`,
  ];
  if (input.label) parts.push(`label=${encodeURIComponent(input.label)}`);
  if (input.message) parts.push(`message=${encodeURIComponent(input.message)}`);
  if (input.reference && isValidSolanaAddress(input.reference)) {
    parts.push(`reference=${input.reference}`);
  }
  return `solana:${to}?${parts.join("&")}`;
}
