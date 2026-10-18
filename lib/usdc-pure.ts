export const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
export const USDC_DECIMALS = 6;

export function solanaRpcUrl(): string {
  return process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
}

export function isValidSolanaAddress(addr: string | null | undefined): boolean {
  if (!addr || typeof addr !== "string") return false;
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(addr.trim());
}

export function base58Encode(bytes: Uint8Array): string {
  const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let digits = [0];
  for (let i = 0; i < bytes.length; i++) {
    let carry = bytes[i];
    for (let j = 0; j < digits.length; ++j) {
      carry += digits[j] << 8;
      digits[j] = carry % 58;
      carry = (carry / 58) | 0;
    }
    while (carry > 0) {
      digits.push(carry % 58);
      carry = (carry / 58) | 0;
    }
  }
  let out = "";
  for (let i = 0; i < bytes.length && bytes[i] === 0; i++) out += "1";
  for (let i = digits.length - 1; i >= 0; i--) out += ALPHABET[digits[i]];
  return out;
}

export function usdcCentsToBaseUnits(cents: number): bigint {
  return BigInt(Math.round(cents)) * 10_000n;
}

export function formatUsdc(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function normalizeSignature(sig: string | null | undefined): string | null {
  if (!sig || typeof sig !== "string") return null;
  const trimmed = sig.trim();
  return /^[1-9A-HJ-NP-Za-km-z]{64,90}$/.test(trimmed) ? trimmed : null;
}

export function usdcDeltaForRecipient(
  _tx: unknown,
  _recipient: string,
  _mint: string = USDC_MINT,
): bigint {
  return 0n;
}

export function buildSolanaPayUrl(input: {
  recipient: string;
  amountCents: number;
  reference: string;
  label?: string;
  message?: string;
}): string {
  const amount = (input.amountCents / 100).toFixed(2);
  const params = new URLSearchParams({
    amount,
    "spl-token": USDC_MINT,
    reference: input.reference,
    label: input.label ?? "Vivida",
    message: input.message ?? "Vivida purchase",
  });
  return `solana:${input.recipient}?${params.toString()}`;
}
