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
