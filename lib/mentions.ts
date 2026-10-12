import { eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import { profiles, users } from "@/db/schema";

import { extractMentionTokens } from "./mentions-parse";

export { extractMentionTokens };

export type ResolvedMention = {
  userId: string;
  username: string;
};

/**
 * Look up which extracted tokens correspond to real users. Returns
 * at most one row per handle (usernames are unique). Empty array when
 * the input has no tokens, saves a roundtrip.
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
