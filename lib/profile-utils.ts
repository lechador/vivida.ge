/**
 * Mkhedruli → Latin, following the Georgian national transliteration. Most of
 * our users write their name in Georgian, and without this every one of them
 * slugs to the empty string and falls back to a meaningless `user_1234`.
 *
 * A few letters share a Latin form (თ/ტ → t, ქ/კ → k, ც/წ → ts, ჩ/ჭ → ch,
 * ფ/პ → p) — fine here, since the point is a readable handle, not a reversible
 * transcription, and the random suffix keeps handles distinct anyway.
 */
const KA_TO_LATIN: Record<string, string> = {
  ა: "a", ბ: "b", გ: "g", დ: "d", ე: "e", ვ: "v", ზ: "z", თ: "t",
  ი: "i", კ: "k", ლ: "l", მ: "m", ნ: "n", ო: "o", პ: "p", ჟ: "zh",
  რ: "r", ს: "s", ტ: "t", უ: "u", ფ: "p", ქ: "k", ღ: "gh", ყ: "q",
  შ: "sh", ჩ: "ch", ც: "ts", ძ: "dz", წ: "ts", ჭ: "ch", ხ: "kh",
  ჯ: "j", ჰ: "h",
};

/** Replace Georgian letters with their Latin equivalents; leave the rest. */
export function transliterateGeorgian(input: string): string {
  return input.replace(/[ა-ჺ]/g, (ch) => KA_TO_LATIN[ch] ?? "");
}

/**
 * Slug-friendly username from a free-form name. Used as a starting
 * suggestion when the user first toggles their profile to public, and as the
 * handle assigned at signup by lib/username.ts.
 */
export function suggestUsername(name: string | null | undefined): string {
  const ascii = transliterateGeorgian(name ?? "user")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip diacritics
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 14)
    .replace(/_+$/, ""); // slice() may have cut mid-separator
  const safe = ascii || "user";
  const suffix = Math.floor(Math.random() * 9000 + 1000); // 4 digits
  return `${safe}_${suffix}`;
}

export const USERNAME_PATTERN = /^[a-z0-9_]{3,24}$/;

/**
 * Age in completed years from a YYYY-MM-DD birth date string. Returns
 * null for missing or unparseable input. Computed against UTC so a
 * single-day TZ drift around the birthday doesn't bump the number.
 */
export function ageFromDob(dob: string | null | undefined): number | null {
  if (!dob || dob.length < 10) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(dob);
  if (!m) return null;
  const y = parseInt(m[1], 10);
  const mo = parseInt(m[2], 10);
  const d = parseInt(m[3], 10);
  if (!y || !mo || !d) return null;
  const now = new Date();
  let age = now.getUTCFullYear() - y;
  const beforeBirthday =
    now.getUTCMonth() + 1 < mo ||
    (now.getUTCMonth() + 1 === mo && now.getUTCDate() < d);
  if (beforeBirthday) age -= 1;
  return age >= 0 && age < 130 ? age : null;
}
