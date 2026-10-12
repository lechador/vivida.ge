import { eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import { charts, type NatalChartJson } from "@/db/schema";

import {
  CATEGORIES,
  computeSynastry,
  overallVerdict,
  type SynastryCategory,
} from "./synastry";
import type { FriendshipUser } from "./friendship";

export type FriendSynastry = {
  overall: number;
  topCategory: SynastryCategory;
  topScore: number;
  verdict: string;
};

export type FriendWithSynastry = FriendshipUser & {
  synastry: FriendSynastry | null;
};

export type FriendsWithSynastry = {
  /** Whether the viewer has a cached natal chart of their own. When false,
   *  no synastry can be computed regardless of which friend has a chart. */
  viewerHasChart: boolean;
  friends: FriendWithSynastry[];
};

/**
 * Enrich a friends list with each pair's synastry score.
 *
 * One batched DB read fetches the viewer's chart plus every friend's chart.
 * The synastry math itself is pure CPU per pair, sub-millisecond, so even
 * a friend list in the dozens stays cheap.
 *
 * Synastry is null for any pair where either side has no cached chart yet.
 * Callers can use `viewerHasChart` to decide between "no chart yet" UX
 * (their fault) and "friend hasn't filled it" UX (their friend's fault).
 */
export async function enrichFriendsWithSynastry(
  viewerId: string,
  friends: FriendshipUser[]
): Promise<FriendsWithSynastry> {
  if (friends.length === 0) {
    const [vc] = await db
      .select({ data: charts.data })
      .from(charts)
      .where(eq(charts.userId, viewerId))
      .limit(1);
    return { viewerHasChart: Boolean(vc?.data), friends: [] };
  }

  const ids = [viewerId, ...friends.map((f) => f.id)];
  const rows = await db
    .select({ userId: charts.userId, data: charts.data })
    .from(charts)
    .where(inArray(charts.userId, ids));

  const byId = new Map<string, NatalChartJson>();
  for (const r of rows) byId.set(r.userId, r.data);

  const viewer = byId.get(viewerId);
  if (!viewer) {
    return {
      viewerHasChart: false,
      friends: friends.map((f) => ({ ...f, synastry: null })),
    };
  }

  return {
    viewerHasChart: true,
    friends: friends.map((f) => {
      const fc = byId.get(f.id);
      if (!fc) return { ...f, synastry: null };
      const r = computeSynastry(viewer, fc);
      let topScore = -Infinity;
      let topCategory: SynastryCategory = "love";
      for (const cat of CATEGORIES) {
        const s = r.scores[cat];
        if (s > topScore) {
          topScore = s;
          topCategory = cat;
        }
      }
      return {
        ...f,
        synastry: {
          overall: r.overall,
          topCategory,
          topScore,
          verdict: overallVerdict(r.overall),
        },
      };
    }),
  };
}
