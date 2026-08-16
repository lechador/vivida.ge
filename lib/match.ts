/**
 * Read logic for the match deck and the matches list. Write logic (like /
 * pass / unmatch) lives in lib/match-core.ts.
 */

import {
  and,
  asc,
  desc,
  eq,
  inArray,
  isNotNull,
  isNull,
  ne,
  or,
  sql,
} from "drizzle-orm";

import { db } from "@/db";
import {
  charts,
  likes,
  matches,
  profilePhotos,
  profiles,
  users,
} from "@/db/schema";
import { getBlockedUserIds } from "./block";
import { getResidenceCountryCode, sameCountryFirst } from "./residence";
import { signByIndex, type ZodiacSign } from "./zodiac";
import { ageFromDob } from "./profile-utils";
import { computeSynastry } from "./synastry";

export type DeckCard = {
  userId: string;
  username: string;
  displayName: string;
  bio: string | null;
  image: string | null;
  /** All ready profile photos in display order — the card's photo carousel. */
  photos: string[];
  age: number | null;
  sunSign: ZodiacSign | null;
  /** Overall compatibility 0–100 vs the viewer; null if either lacks a chart. */
  compatibility: number | null;
};

export type MatchView = {
  userId: string;
  username: string;
  displayName: string;
  image: string | null;
  photoUrl: string | null;
  compatibility: number | null;
  matchedAt: string;
};

export type IncomingLikes = {
  /** How many people have liked the viewer and are awaiting a decision. */
  count: number;
  /** Kept for mobile response compatibility; always false. */
  locked: boolean;
  /** The likers' cards — empty when `locked` (identities are withheld
   *  server-side so a free client can't scrape them). */
  likers: MatchView[];
};

const DECK_LIMIT = 30;
/** Cap candidates scored per deck build so synastry cost stays bounded as the
 *  user base grows (mirrors the candidate cap in discover.ts). */
const CANDIDATE_LIMIT = 80;

/**
 * Build the set of user ids the viewer should never see in the deck:
 * themselves, anyone they've already liked/passed, anyone they've matched
 * (active or unmatched — don't resurface), and anyone blocked either way.
 */
async function deckExclusions(viewerId: string): Promise<Set<string>> {
  const [decided, matchRows, blockedIds] = await Promise.all([
    db
      .select({ id: likes.targetId })
      .from(likes)
      .where(eq(likes.likerId, viewerId)),
    db
      .select({ a: matches.userAId, b: matches.userBId })
      .from(matches)
      .where(or(eq(matches.userAId, viewerId), eq(matches.userBId, viewerId))),
    // Blocks live in `blocks`, not on friendship.status — blocking also
    // deletes the friendship row, so there is nothing to read there.
    getBlockedUserIds(viewerId),
  ]);

  const excluded = new Set<string>([viewerId]);
  for (const r of decided) excluded.add(r.id);
  for (const r of matchRows) excluded.add(r.a === viewerId ? r.b : r.a);
  for (const id of blockedIds) excluded.add(id);
  return excluded;
}

/**
 * The swipe deck — public-profile users the viewer hasn't decided on yet,
 * sorted by astrological compatibility (highest first). Friends are eligible
 * (you can match a friend); decided/matched/blocked users and anyone who
 * turned off discoverability are filtered.
 */
export async function getMatchDeck(viewerId: string): Promise<DeckCard[]> {
  const [viewerChart] = await db
    .select({ data: charts.data })
    .from(charts)
    .where(eq(charts.userId, viewerId))
    .limit(1);

  const excluded = await deckExclusions(viewerId);
  const viewerCountry = await getResidenceCountryCode(viewerId);

  // Resolve the include set explicitly (notInArray with large/empty sets is
  // awkward in drizzle; an inArray over candidates is reliable).
  const allCandidates = await db
    .selectDistinct({ id: profiles.userId })
    .from(profiles)
    .innerJoin(charts, eq(charts.userId, profiles.userId))
    .where(
      and(isNotNull(profiles.username), eq(profiles.discoverable, true))
    );
  const includeIds = allCandidates
    .map((r) => r.id)
    .filter((id) => !excluded.has(id));

  if (includeIds.length === 0) return [];

  const candidates = await db
    .select({ user: users, profile: profiles, chart: charts })
    .from(profiles)
    .innerJoin(users, eq(users.id, profiles.userId))
    .innerJoin(charts, eq(charts.userId, profiles.userId))
    .where(
      and(
        ne(users.id, viewerId),
        eq(profiles.discoverable, true),
        inArray(users.id, includeIds)
      )
    )
    // Country first, then a random sample within each bucket. Applied to the
    // sample rather than after it, for the same reason as discover.ts: this is
    // what gets scored, so a viewer in a market with few users would otherwise
    // never draw a local candidate into the deck at all.
    .orderBy(desc(sameCountryFirst(viewerCountry)), sql`random()`)
    .limit(CANDIDATE_LIMIT);

  // All ready photos per candidate, grouped in JS (one query).
  const candidateIds = candidates.map((c) => c.user.id);
  const photoRows = candidateIds.length
    ? await db
        .select({ userId: profilePhotos.userId, url: profilePhotos.url })
        .from(profilePhotos)
        .where(
          and(
            eq(profilePhotos.ready, true),
            inArray(profilePhotos.userId, candidateIds)
          )
        )
        .orderBy(asc(profilePhotos.sortOrder))
    : [];
  const photosByUser = new Map<string, string[]>();
  for (const p of photoRows) {
    const arr = photosByUser.get(p.userId);
    if (arr) arr.push(p.url);
    else photosByUser.set(p.userId, [p.url]);
  }

  const cards: DeckCard[] = candidates.map((c) => {
    const sunIndex = c.chart?.data?.bodies?.sun?.signIndex;
    const sunSign = typeof sunIndex === "number" ? signByIndex(sunIndex) : null;

    let compatibility: number | null = null;
    if (viewerChart?.data && c.chart?.data) {
      try {
        compatibility = computeSynastry(viewerChart.data, c.chart.data).overall;
      } catch {
        compatibility = null;
      }
    }

    return {
      userId: c.user.id,
      username: c.profile.username ?? "",
      displayName:
        c.profile.displayName ??
        c.user.name?.split(" ")[0] ??
        c.profile.username ??
        "user",
      bio: c.profile.bio,
      image: c.user.image,
      photos: photosByUser.get(c.user.id) ?? [],
      age: ageFromDob(c.profile.dateOfBirth),
      sunSign,
      compatibility,
    };
  });

  // Highest compatibility first; unknown scores sink to the bottom.
  cards.sort((a, b) => (b.compatibility ?? -1) - (a.compatibility ?? -1));
  return cards.slice(0, DECK_LIMIT);
}

/** A viewer's active matches, newest first, with the other person's card. */
export async function listMatches(viewerId: string): Promise<MatchView[]> {
  const rows = await db
    .select({ a: matches.userAId, b: matches.userBId, createdAt: matches.createdAt })
    .from(matches)
    .where(
      and(
        isNull(matches.unmatchedAt),
        or(eq(matches.userAId, viewerId), eq(matches.userBId, viewerId))
      )
    )
    .orderBy(desc(matches.createdAt));

  if (rows.length === 0) return [];

  const otherIds = rows.map((r) => (r.a === viewerId ? r.b : r.a));
  const matchedAtById = new Map<string, string>();
  for (const r of rows) {
    matchedAtById.set(r.a === viewerId ? r.b : r.a, r.createdAt.toISOString());
  }

  const [viewerChart] = await db
    .select({ data: charts.data })
    .from(charts)
    .where(eq(charts.userId, viewerId))
    .limit(1);

  const people = await db
    .select({ user: users, profile: profiles, chart: charts })
    .from(users)
    .innerJoin(profiles, eq(profiles.userId, users.id))
    .leftJoin(charts, eq(charts.userId, users.id))
    .where(inArray(users.id, otherIds));

  const firstPhotoRows = await db
    .select({ userId: profilePhotos.userId, url: profilePhotos.url })
    .from(profilePhotos)
    .where(
      and(eq(profilePhotos.ready, true), inArray(profilePhotos.userId, otherIds))
    )
    .orderBy(asc(profilePhotos.sortOrder));
  const firstPhoto = new Map<string, string>();
  for (const p of firstPhotoRows) {
    if (!firstPhoto.has(p.userId)) firstPhoto.set(p.userId, p.url);
  }

  const views: MatchView[] = people.map((p) => {
    let compatibility: number | null = null;
    if (viewerChart?.data && p.chart?.data) {
      try {
        compatibility = computeSynastry(viewerChart.data, p.chart.data).overall;
      } catch {
        compatibility = null;
      }
    }
    return {
      userId: p.user.id,
      username: p.profile.username ?? "",
      displayName:
        p.profile.displayName ??
        p.user.name?.split(" ")[0] ??
        p.profile.username ??
        "user",
      image: p.user.image,
      photoUrl: firstPhoto.get(p.user.id) ?? null,
      compatibility,
      matchedAt: matchedAtById.get(p.user.id) ?? "",
    };
  });

  // Preserve newest-match-first ordering (the join above doesn't guarantee it).
  views.sort((a, b) => b.matchedAt.localeCompare(a.matchedAt));
  return views;
}

/**
 * People who have liked the viewer and are still awaiting a decision (the
 * viewer hasn't liked or passed them back, and they're not blocked). This is
 * the "who liked you" surface. The retired Pro gate no longer hides liker
 * identities; authenticated users receive their pending likers directly.
 */
export async function listIncomingLikes(viewerId: string): Promise<IncomingLikes> {
  const [likedMe, iDecided, blockedIds] = await Promise.all([
    db
      .select({ id: likes.likerId })
      .from(likes)
      .where(and(eq(likes.targetId, viewerId), eq(likes.kind, "like"))),
    db.select({ id: likes.targetId }).from(likes).where(eq(likes.likerId, viewerId)),
    getBlockedUserIds(viewerId),
  ]);

  const decided = new Set(iDecided.map((r) => r.id));
  for (const id of blockedIds) decided.add(id);
  const pending = [...new Set(likedMe.map((r) => r.id))].filter(
    (id) => !decided.has(id)
  );

  const count = pending.length;
  if (count === 0) {
    return { count, locked: false, likers: [] };
  }

  const [viewerChart] = await db
    .select({ data: charts.data })
    .from(charts)
    .where(eq(charts.userId, viewerId))
    .limit(1);

  const people = await db
    .select({ user: users, profile: profiles, chart: charts })
    .from(users)
    .innerJoin(profiles, eq(profiles.userId, users.id))
    .leftJoin(charts, eq(charts.userId, users.id))
    .where(inArray(users.id, pending));

  const photoRows = await db
    .select({ userId: profilePhotos.userId, url: profilePhotos.url })
    .from(profilePhotos)
    .where(and(eq(profilePhotos.ready, true), inArray(profilePhotos.userId, pending)))
    .orderBy(asc(profilePhotos.sortOrder));
  const firstPhoto = new Map<string, string>();
  for (const p of photoRows) {
    if (!firstPhoto.has(p.userId)) firstPhoto.set(p.userId, p.url);
  }

  const likers: MatchView[] = people.map((p) => {
    let compatibility: number | null = null;
    if (viewerChart?.data && p.chart?.data) {
      try {
        compatibility = computeSynastry(viewerChart.data, p.chart.data).overall;
      } catch {
        compatibility = null;
      }
    }
    return {
      userId: p.user.id,
      username: p.profile.username ?? "",
      displayName:
        p.profile.displayName ??
        p.user.name?.split(" ")[0] ??
        p.profile.username ??
        "user",
      image: p.user.image,
      photoUrl: firstPhoto.get(p.user.id) ?? null,
      compatibility,
      matchedAt: "",
    };
  });

  likers.sort((a, b) => (b.compatibility ?? -1) - (a.compatibility ?? -1));
  return { count, locked: false, likers };
}

/** Whether two users have an active (non-unmatched) match. */
export async function areMatched(a: string, b: string): Promise<boolean> {
  const [x, y] = a < b ? [a, b] : [b, a];
  const [row] = await db
    .select({ userAId: matches.userAId })
    .from(matches)
    .where(
      and(
        eq(matches.userAId, x),
        eq(matches.userBId, y),
        isNull(matches.unmatchedAt)
      )
    )
    .limit(1);
  return !!row;
}
