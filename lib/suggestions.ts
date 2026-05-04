import { getDiscoveryFeed, type DiscoverCard } from "./discover";

/**
 * Top-N highest-compatibility candidates for the dashboard rail. Reuses the
 * /discover feed and flattens it: the spotlight is already the global best
 * scorer, and each group is sorted desc by compatibility, so an ordered
 * concat preserves the "most compatible first" ranking we want.
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

  return unique.slice(0, limit);
}
