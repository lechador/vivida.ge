import { getDiscoveryFeed, shuffle, type DiscoverCard } from "./discover";

/**
 * Suggested-people picks for the dashboard/feed rails.
 *
 * Quality + rotation, not a fixed leaderboard: taking the top-N by
 * compatibility verbatim meant the exact same faces in the exact same order
 * on every load. Instead we pool the strongest candidates (3× the requested
 * limit, compatibility-ranked, the discovery feed itself samples candidates
 * randomly, so pool membership rotates too) and shuffle the pool, so every
 * visit surfaces a fresh mix that still skews compatible.
 */
export async function getDashboardSuggestions(
  viewerId: string,
  limit = 8
): Promise<DiscoverCard[]> {
  const feed = await getDiscoveryFeed(viewerId);
  const flat: DiscoverCard[] = [];
  if (feed.spotlight) flat.push(feed.spotlight.card);
  flat.push(...feed.tribe, ...feed.magic, ...feed.other);

  // Belt-and-suspenders dedupe in case spotlight slipped into a group
  const seen = new Set<string>();
  const unique = flat.filter((c) => {
    if (seen.has(c.userId)) return false;
    seen.add(c.userId);
    return true;
  });

  const pool = unique
    .sort((a, b) => (b.compatibility ?? 0) - (a.compatibility ?? 0))
    .slice(0, Math.max(limit * 3, limit));

  return shuffle(pool).slice(0, limit);
}
