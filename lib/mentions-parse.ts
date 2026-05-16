/**
 * Pure (no-DB, no-`server-only`) mention parsing — safe to import from
 * client components. The DB-backed resolver lives in `./mentions` and
 * must NEVER be imported into client code.
 *
 * Username rules — must match the validation used when creating a
 * profile (see actions/profile.ts). Lowercase letters/digits/_-, length
 * 3..24. Anchored so partial matches inside longer @runs (like an email
 * address) don't trigger a false mention.
 */
const USERNAME_TOKEN = /(?:^|[^a-zA-Z0-9_@])@([a-z0-9_-]{3,24})/g;

/**
 * Extract the candidate @handles from a piece of body text. Returns
 * lowercased, deduped strings — order is preserved (first occurrence
 * wins) so the order matches how a reader would scan them.
 *
 * NOT a DB lookup — this only validates the syntactic shape. A token
 * may still resolve to no actual user; callers needing real users
 * should run `resolveMentions` from `./mentions` (server-only).
 */
export function extractMentionTokens(body: string): string[] {
  if (!body) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const m of body.matchAll(USERNAME_TOKEN)) {
    const handle = m[1]?.toLowerCase();
    if (!handle || seen.has(handle)) continue;
    seen.add(handle);
    out.push(handle);
  }
  return out;
}
