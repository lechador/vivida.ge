import { and, asc, eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import { profilePhotos } from "@/db/schema";

/**
 * Look up the lowest-sortOrder ready profile photo for each user. Returns
 * a Map keyed by userId. Used to override `users.image` (the OAuth avatar)
 * with the user's chosen "main" photo whenever they appear in a list.
 *
 * One query for the whole batch, safe to call from list endpoints
 * (friends, search, messages) without N+1.
 */
export async function firstReadyPhotoByUser(
  userIds: string[]
): Promise<Map<string, string>> {
  if (userIds.length === 0) return new Map();
  const rows = await db
    .select({ userId: profilePhotos.userId, url: profilePhotos.url })
    .from(profilePhotos)
    .where(
      and(
        eq(profilePhotos.ready, true),
        inArray(profilePhotos.userId, userIds)
      )
    )
    .orderBy(asc(profilePhotos.sortOrder));

  const out = new Map<string, string>();
  for (const r of rows) {
    if (!out.has(r.userId)) out.set(r.userId, r.url);
  }
  return out;
}

/** Helper: pick the profile photo URL or fall back to the OAuth image. */
export function resolveAvatar(
  userId: string,
  oauthImage: string | null,
  photos: Map<string, string>
): string | null {
  return photos.get(userId) ?? oauthImage ?? null;
}
