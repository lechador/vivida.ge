import { and, eq, ilike, isNotNull, or, sql } from "drizzle-orm";

import { db } from "@/db";
import { profiles, users } from "@/db/schema";
import { resolveAvatar, firstReadyPhotoByUser } from "@/lib/avatars";
import { SEARCH_CATALOG, type SearchEntry } from "@/lib/search/catalog";

export type PageHit = SearchEntry & { score: number };
export type UserHit = {
  username: string;
  displayName: string | null;
  name: string | null;
  image: string | null;
};

/**
 * Rank catalog pages against `q`. Scoring favours, in order: exact title,
 * title prefix, title substring, then a token (term) prefix/substring. Shorter
 * titles win ties so "ლომი" beats "ლომის თავსებადობა" for the query "ლომი".
 */
export function searchPages(q: string, limit = 8): PageHit[] {
  const needle = q.trim().toLowerCase();
  if (needle.length < 2) return [];

  const hits: PageHit[] = [];
  for (const e of SEARCH_CATALOG) {
    const title = e.title.toLowerCase();
    let score = 0;
    if (title === needle) score = 100;
    else if (title.startsWith(needle)) score = 80;
    else if (title.includes(needle)) score = 60;
    else {
      for (const t of e.terms) {
        if (t === needle) {
          score = Math.max(score, 70);
          break;
        }
        if (t.startsWith(needle)) score = Math.max(score, 45);
        else if (t.includes(needle)) score = Math.max(score, 30);
      }
    }
    if (score > 0) {
      // Tie-breaker: shorter titles first (more specific match).
      score -= Math.min(title.length, 40) * 0.1;
      hits.push({ ...e, score });
    }
  }
  hits.sort((a, b) => b.score - a.score);
  return hits.slice(0, limit);
}

/**
 * Public-profile user search — only users who claimed a username AND opted
 * into discovery (`discoverable`). No viewer needed; safe for the signed-out
 * homepage since these profiles are public by the user's own choice.
 */
export async function searchPublicUsers(
  q: string,
  limit = 5
): Promise<UserHit[]> {
  const trimmed = q.trim();
  if (trimmed.length < 2) return [];
  const pattern = `%${trimmed.replace(/[%_\\]/g, (m) => `\\${m}`)}%`;

  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      image: users.image,
      username: profiles.username,
      displayName: profiles.displayName,
    })
    .from(profiles)
    .innerJoin(users, eq(users.id, profiles.userId))
    .where(
      and(
        isNotNull(profiles.username),
        // Usernames are assigned at signup, so they no longer imply an
        // onboarded profile — gate on birth data to keep registered-but-never-
        // onboarded accounts out of search results. Same rule as lib/people.ts.
        isNotNull(profiles.dateOfBirth),
        eq(profiles.discoverable, true),
        or(
          ilike(profiles.username, pattern),
          ilike(profiles.displayName, pattern),
          ilike(users.name, pattern)
        )
      )
    )
    // Prefix matches first (they're the intended target), then by activity.
    .orderBy(sql`(${profiles.username} ILIKE ${trimmed + "%"}) DESC`, sql`${users.lastLoginAt} DESC NULLS LAST`)
    .limit(limit);

  if (rows.length === 0) return [];

  // Resolve avatars (uploaded photo → OAuth image), same as the people
  // directory, so results look consistent.
  const photos = await firstReadyPhotoByUser(rows.map((r) => r.id));
  return rows.map((r) => ({
    username: r.username as string,
    displayName: r.displayName,
    name: r.name,
    image: resolveAvatar(r.id, r.image, photos),
  }));
}
