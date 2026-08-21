import { eq } from "drizzle-orm";
import { after } from "next/server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { recordVisit, shouldRecordVisit } from "@/lib/activity";

import { ApiError } from "./errors";
import { verifyAccessToken } from "./jwt";
import { toPublicUser, type PublicUser } from "./serialize";

/**
 * Bearer-token analog of the website's `requireUser()` (lib/auth-helpers).
 * Reads `Authorization: Bearer <access token>`, verifies it, and loads
 * the user — re-checking the row exists so a token can't outlive a
 * deleted account. Throws ApiError(401) on any failure; handle() turns
 * that into a clean 401 response.
 *
 * Every protected `/api/v1` route starts with:
 *   const user = await requireMobileUser(req);
 */
export async function requireMobileUser(req: Request): Promise<PublicUser> {
  const userId = await requireMobileUserId(req);

  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      image: users.image,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    throw new ApiError(401, "unauthorized", "Account no longer exists");
  }

  if (shouldRecordVisit(userId)) after(() => recordVisit(userId));

  return toPublicUser(user);
}

/**
 * Lightweight authentication for high-frequency read-only endpoints. Access
 * tokens expire after 15 minutes, so polling does not need another Neon query
 * merely to prove that the already-signed token's user row still exists.
 */
export async function requireMobileUserId(req: Request): Promise<string> {
  const header = req.headers.get("authorization") ?? "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    throw new ApiError(401, "unauthorized", "Missing bearer token");
  }

  let userId: string;
  try {
    userId = await verifyAccessToken(match[1]);
  } catch {
    throw new ApiError(401, "invalid_token", "Invalid or expired access token");
  }

  return userId;
}
