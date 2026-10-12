import { NextResponse } from "next/server";
import { and, asc, eq, ilike, isNotNull, ne, notInArray, or, sql } from "drizzle-orm";

import { auth } from "@/auth";
import { db } from "@/db";
import { profiles, users } from "@/db/schema";
import { firstReadyPhotoByUser, resolveAvatar } from "@/lib/avatars";
import { getBlockedUserIds } from "@/lib/block";

const MIN_QUERY = 2;
const MAX_RESULTS = 8;

/**
 * GET /api/users/search?q=...
 * Returns up to 8 public-profile matches by username or display name.
 * Auth required so we don't expose the directory to scrapers.
 */
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();

  if (q.length < MIN_QUERY) {
    return NextResponse.json({ results: [] });
  }

  // ILIKE prefix-or-contains match on username, display_name, or user.name
  const pattern = `%${q.replace(/[%_]/g, (m) => `\\${m}`)}%`;
  const blockedIds = await getBlockedUserIds(session.user.id);

  const rows = await db
    .select({
      userId: users.id,
      name: users.name,
      image: users.image,
      username: profiles.username,
      displayName: profiles.displayName,
      bio: profiles.bio,
    })
    .from(profiles)
    .innerJoin(users, eq(users.id, profiles.userId))
    .where(
      and(
        ne(users.id, session.user.id),
        blockedIds.length ? notInArray(users.id, blockedIds) : undefined,
        // Hide users who haven't picked a username yet, their card would
        // link to a broken /u/ URL.
        isNotNull(profiles.username),
        // Usernames now come with the account, so they no longer imply an
        // onboarded profile, gate on birth data so @mention autocomplete only
        // offers real profiles. Same rule as lib/people.ts.
        isNotNull(profiles.dateOfBirth),
        // Respect the discovery opt-out: opted-out users aren't findable
        // via search either (existing friends are already in the friends
        // list / messenger, which don't go through this endpoint).
        eq(profiles.discoverable, true),
        or(
          ilike(profiles.username, pattern),
          ilike(profiles.displayName, pattern),
          ilike(users.name, pattern)
        )
      )
    )
    // Roughly: exact username matches first, then by username alphabetical
    .orderBy(
      sql`CASE WHEN ${profiles.username} ILIKE ${q.toLowerCase()} THEN 0 ELSE 1 END`,
      asc(profiles.username)
    )
    .limit(MAX_RESULTS);

  const photos = await firstReadyPhotoByUser(rows.map((r) => r.userId));

  return NextResponse.json({
    results: rows.map((r) => ({
      userId: r.userId,
      username: r.username,
      displayName: r.displayName ?? r.name?.split(" ")[0] ?? r.username,
      image: resolveAvatar(r.userId, r.image, photos),
      bio: r.bio,
    })),
  });
}
