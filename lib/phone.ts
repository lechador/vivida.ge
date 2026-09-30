/**
 * Georgian mobile-number helpers (pure — no DB, safe to unit-test).
 *
 * Storage format is E.164 (`+995XXXXXXXXX`); sender.ge wants the 9-digit
 * national form (`5XXXXXXXX`) as its `destination` parameter. Only Georgian
 * mobile numbers are supported: national mobile codes all start with `5`
 * (number portability makes per-operator prefix checks unreliable, so we
 * deliberately don't enumerate operator ranges).
 */

/** Normalize any common Georgian input to E.164, or null when invalid.
 *  Accepts `555123456`, `0555123456`, `995555123456`, `+995 555 123 456`
 *  (spaces, dashes, parentheses and dots are ignored). */
export function normalizeGeorgianMobile(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  let national: string | null = null;
  if (/^\d{9}$/.test(digits)) {
    national = digits;
  } else if (/^0\d{9}$/.test(digits)) {
    national = digits.slice(1);
  } else if (/^995\d{9}$/.test(digits)) {
    national = digits.slice(3);
  }
  if (!national || !isNationalMobile(national)) return null;
  return `+995${national}`;
}

/** True for the 9-digit national form of a Georgian mobile (5XXXXXXXX). */
export function isNationalMobile(national: string): boolean {
  return /^5\d{8}$/.test(national);
}

export function isValidGeorgianMobile(raw: string): boolean {
  return normalizeGeorgianMobile(raw) !== null;
}

/** 9-digit national form (`5XXXXXXXX`) — sender.ge's `destination` value. */
export function nationalDigits(e164: string): string | null {
  const match = /^\+995(\d{9})$/.exec(e164.trim());
  if (!match || !isNationalMobile(match[1])) return null;
  return match[1];
}

/** Display format: `+995 5XX XXX XXX`. */
export function formatGeorgianMobile(e164: string): string {
  const national = nationalDigits(e164);
  if (!national) return e164;
  return `+995 ${national.slice(0, 3)} ${national.slice(3, 6)} ${national.slice(6)}`;
}

/** Log-safe mask — keeps the country code and the first/last digit pair. */
export function maskGeorgianMobile(e164: string): string {
  const national = nationalDigits(e164);
  if (!national) return "…";
  return `+995 ${national.slice(0, 2)}•••••${national.slice(7)}`;
}
