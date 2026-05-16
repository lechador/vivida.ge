import { eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import { profiles, users } from "@/db/schema";

/**
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
 * may still resolve to no actual user; callers should run
 * `resolveMentions` to filter to real profiles before notifying.
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

export type ResolvedMention = {
  userId: string;
  username: string;
};

/**
 * Look up which extracted tokens correspond to real users. Returns
 * at most one row per handle (usernames are unique). Empty array when
 * the input has no tokens — saves a roundtrip.
 *
 * Excludes a list of user ids so callers can skip self-mentions and
 * the author of the surrounding post/comment in one place.
 */
export async function resolveMentions(
  body: string,
  options: { excludeUserIds?: string[]; cap?: number } = {}
): Promise<ResolvedMention[]> {
  const handles = extractMentionTokens(body);
  if (handles.length === 0) return [];
  const cap = Math.max(1, Math.min(options.cap ?? 8, 16));

  const rows = await db
    .select({ userId: users.id, username: profiles.username })
    .from(profiles)
    .innerJoin(users, eq(users.id, profiles.userId))
    .where(inArray(profiles.username, handles));

  const exclude = new Set(options.excludeUserIds ?? []);
  const out: ResolvedMention[] = [];
  for (const row of rows) {
    if (!row.username || exclude.has(row.userId)) continue;
    out.push({ userId: row.userId, username: row.username });
    if (out.length >= cap) break;
  }
  return out;
}
