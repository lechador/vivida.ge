/**
 * People-you-may-know feed for /discover.
 *
 * Candidates are public-profile users the viewer hasn't connected with yet,
 * grouped by elemental compatibility:
 *   - "tribe": same element as viewer's Sun
 *   - "magic": classically compatible element (Fire↔Air, Earth↔Water)
 *   - "other": all the rest
 */

import { and, asc, eq, inArray, ne, or } from "drizzle-orm";

import { db } from "@/db";
import {
  charts,
  friendships,
  profilePhotos,
  profiles,
  users,
} from "@/db/schema";
import { signByIndex, type ZodiacSign } from "./zodiac";
import { computeSynastry, type SynastryResult } from "./synastry";

export type Element = ZodiacSign["element"];

export type DiscoverCard = {
  userId: string;
  username: string;
  displayName: string;
  bio: string | null;
  image: string | null;
  /** First profile photo, if any. Used as the card hero. */
  photoUrl: string | null;
  sunSign: ZodiacSign;
  sunElement: Element;
  /** Overall compatibility 0–100 vs the viewer; null if viewer has no chart. */
  compatibility: number | null;
};

export type SpotlightMatch = {
  card: DiscoverCard;
  /** Full synastry result so the spotlight can show per-category breakdowns. */
  synastry: SynastryResult;
};

export type DiscoverFeed = {
  /** Viewer's own sun element — null if no chart yet. */
  viewerElement: Element | null;
  /** Highest-compatibility candidate, surfaced above the grouped sections. */
  spotlight: SpotlightMatch | null;
  tribe: DiscoverCard[];
  magic: DiscoverCard[];
  other: DiscoverCard[];
};

/** Classical "complementary" element pairings (Fire↔Air, Earth↔Water). */
const COMPLEMENTARY: Record<Element, Element> = {
  ცეცხლი: "ჰაერი",
  ჰაერი: "ცეცხლი",
  მიწა: "წყალი",
  წყალი: "მიწა",
};

const PER_GROUP = 12;
const CANDIDATE_LIMIT = 60;

export async function getDiscoveryFeed(
  viewerId: string
): Promise<DiscoverFeed> {
  // 1. Viewer's sun element (so we can categorise others against it)
  const [viewerChart] = await db
    .select({ data: charts.data })
    .from(charts)
    .where(eq(charts.userId, viewerId))
    .limit(1);

  const viewerSunIndex = viewerChart?.data?.bodies?.sun?.signIndex;
  const viewerElement: Element | null =
    typeof viewerSunIndex === "number"
      ? signByIndex(viewerSunIndex).element
      : null;

  // 2. Build the exclusion set — self + anyone we already have a row with
  //    (friends, pending, blocked).
  const friendRows = await db
    .select({
      a: friendships.requesterId,
      b: friendships.recipientId,
    })
    .from(friendships)
    .where(
      or(
        eq(friendships.requesterId, viewerId),
        eq(friendships.recipientId, viewerId)
      )
    );

  const excluded = new Set<string>([viewerId]);
  for (const r of friendRows) {
    excluded.add(r.a === viewerId ? r.b : r.a);
  }
  const excludedList = [...excluded];

  // 3. Pull public-profile candidates with their charts
  const candidates = await db
    .select({
      user: users,
      profile: profiles,
      chart: charts,
    })
    .from(profiles)
    .innerJoin(users, eq(users.id, profiles.userId))
    .innerJoin(charts, eq(charts.userId, profiles.userId))
    .where(
      and(
        eq(profiles.isPublic, true),
        ne(users.id, viewerId),
        excludedList.length > 1
          ? inArray(users.id, await pickIncluded(excludedList, viewerId))
          : eq(profiles.isPublic, true) // tautology when only viewer excluded
      )
    )
    .limit(CANDIDATE_LIMIT);

  // 4. First photo per candidate (one query, group in JS)
  const candidateIds = candidates.map((c) => c.user.id);
  const photos = candidateIds.length
    ? await db
        .select({
          userId: profilePhotos.userId,
          url: profilePhotos.url,
        })
        .from(profilePhotos)
        .where(
          and(
            eq(profilePhotos.ready, true),
            inArray(profilePhotos.userId, candidateIds)
          )
        )
        .orderBy(asc(profilePhotos.sortOrder))
    : [];

  const firstPhoto = new Map<string, string>();
  for (const p of photos) {
    if (!firstPhoto.has(p.userId)) firstPhoto.set(p.userId, p.url);
  }

  // 5. Categorise + score synastry against viewer's chart. We hold on to
  //    the full synastry result alongside each card so we can lift the
  //    top scorer out as the spotlight (with per-category breakdown) at
  //    the end.
  type Scored = { card: DiscoverCard; synastry: SynastryResult | null };
  const tribe: Scored[] = [];
  const magic: Scored[] = [];
  const other: Scored[] = [];

  for (const c of candidates) {
    const sunIndex = c.chart?.data?.bodies?.sun?.signIndex;
    if (typeof sunIndex !== "number") continue;
    const sign = signByIndex(sunIndex);

    let synastry: SynastryResult | null = null;
    if (viewerChart?.data) {
      try {
        synastry = computeSynastry(viewerChart.data, c.chart.data);
      } catch {
        synastry = null;
      }
    }

    const card: DiscoverCard = {
      userId: c.user.id,
      username: c.profile.username ?? "",
      displayName:
        c.profile.displayName ??
        c.user.name?.split(" ")[0] ??
        c.profile.username ??
        "user",
      bio: c.profile.bio,
      image: c.user.image,
      photoUrl: firstPhoto.get(c.user.id) ?? null,
      sunSign: sign,
      sunElement: sign.element,
      compatibility: synastry?.overall ?? null,
    };

    const entry: Scored = { card, synastry };
    if (!viewerElement) {
      other.push(entry);
      continue;
    }
    if (sign.element === viewerElement) {
      tribe.push(entry);
    } else if (COMPLEMENTARY[viewerElement] === sign.element) {
      magic.push(entry);
    } else {
      other.push(entry);
    }
  }

  // 6. Pick the spotlight — the highest-compat candidate across all groups.
  const allScored = [...tribe, ...magic, ...other].filter(
    (s) => s.synastry !== null
  );
  let spotlight: SpotlightMatch | null = null;
  if (allScored.length > 0) {
    allScored.sort(
      (a, b) => (b.synastry?.overall ?? 0) - (a.synastry?.overall ?? 0)
    );
    const top = allScored[0];
    spotlight = { card: top.card, synastry: top.synastry! };
  }

  // 7. Sort each group desc by score, dedupe spotlight, then cap.
  const sorter = (a: Scored, b: Scored): number => {
    if (a.card.compatibility != null && b.card.compatibility != null) {
      return b.card.compatibility - a.card.compatibility;
    }
    return Math.random() - 0.5;
  };
  const dedupe = (arr: Scored[]): DiscoverCard[] =>
    arr
      .filter((s) => s.card.userId !== spotlight?.card.userId)
      .sort(sorter)
      .slice(0, PER_GROUP)
      .map((s) => s.card);

  return {
    viewerElement,
    spotlight,
    tribe: dedupe(tribe),
    magic: dedupe(magic),
    other: dedupe(other),
  };
}

/** When excludedList only has the viewer, drizzle's notInArray was awkward.
 *  Helper: return the include set as everything-not-excluded. We don't
 *  actually call this; this is here to leave the code self-explanatory. */
async function pickIncluded(
  excluded: string[],
  _viewerId: string
): Promise<string[]> {
  // Pull candidate IDs explicitly so we can use inArray (more reliable than
  // notInArray + nullable lists). Keep the return small via select-distinct.
  const rows = await db
    .selectDistinct({ id: users.id })
    .from(users)
    .innerJoin(profiles, eq(profiles.userId, users.id))
    .where(eq(profiles.isPublic, true));
  const set = new Set(excluded);
  return rows.filter((r) => !set.has(r.id)).map((r) => r.id);
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Locale-friendly element label + accent colour for UI sections. */
export const ELEMENT_ACCENT: Record<Element, string> = {
  ცეცხლი: "oklch(0.7 0.22 30)",
  მიწა: "oklch(0.65 0.13 130)",
  ჰაერი: "oklch(0.75 0.16 220)",
  წყალი: "oklch(0.6 0.2 280)",
};

export const ELEMENT_GLYPH: Record<Element, string> = {
  ცეცხლი: "△",
  მიწა: "▽",
  ჰაერი: "△",
  წყალი: "▽",
};
