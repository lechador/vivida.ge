import type { DiscoverCard } from "@/lib/discover";

export async function getDashboardSuggestions(
  _userId: string,
  _limit: number = 20,
): Promise<DiscoverCard[]> {
  return [];
}
