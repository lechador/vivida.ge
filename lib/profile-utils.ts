/**
 * Slug-friendly username from a free-form name. Used as a starting
 * suggestion when the user first toggles their profile to public.
 */
export function suggestUsername(name: string | null | undefined): string {
  const ascii = (name ?? "user")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip diacritics
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 14);
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
