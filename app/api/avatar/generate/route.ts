import { eq, inArray } from "drizzle-orm";

import { auth } from "@/auth";
import { db } from "@/db";
import { charts, profilePhotos } from "@/db/schema";
import { getCurrentPlan } from "@/lib/plan";
import { canUseFeature } from "@/lib/features";
import { enforceRateLimit } from "@/lib/rate-limit";
import { generateZodiacAvatar, isAvatarGenConfigured } from "@/lib/avatar-gen";
import {
  putObject,
  publicUrlFor,
  deleteObject,
  isR2Configured,
} from "@/lib/r2";
import { invalidateHeaderForUser } from "@/lib/header-cache";
import { signByIndex } from "@/lib/zodiac";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Image generation runs ~5-12s; give the handler headroom.
export const maxDuration = 60;

/**
 * Generate an AI zodiac avatar (Pro / trial only), store it in R2, and set
 * it as the user's main profile photo so it appears everywhere the avatar
 * shows. A daily per-user cap keeps the ~$0.04/image cost bounded.
 */
export async function POST() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return Response.json({ error: "unauthorized" }, { status: 401 });

  if (!canUseFeature("aiAvatar", await getCurrentPlan(userId))) {
    return Response.json({ error: "pro_required" }, { status: 403 });
  }

  if (!isAvatarGenConfigured() || !isR2Configured()) {
    return Response.json({ error: "unavailable" }, { status: 503 });
  }

  try {
    // Daily cap first: attempts past it throw before the monthly counter is
    // touched, so hammering the daily limit can't drain the monthly quota.
    await enforceRateLimit({
      bucket: "ai_avatar_user_day",
      identifier: userId,
      limit: 3,
      windowMs: 24 * 60 * 60 * 1000,
    });
    await enforceRateLimit({
      bucket: "ai_avatar_user_month",
      identifier: userId,
      limit: 10,
      windowMs: 30 * 24 * 60 * 60 * 1000,
    });
  } catch {
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }

  // Sun sign drives the motif — read it from the user's natal chart.
  const [chartRow] = await db
    .select({ data: charts.data })
    .from(charts)
    .where(eq(charts.userId, userId))
    .limit(1);
  const sunIndex = chartRow?.data.bodies?.sun?.signIndex;
  if (sunIndex == null) {
    return Response.json({ error: "no_chart" }, { status: 400 });
  }
  const sign = signByIndex(sunIndex);

  let bytes: Buffer | null;
  try {
    bytes = await generateZodiacAvatar(sign.key);
  } catch {
    return Response.json({ error: "generation_failed" }, { status: 502 });
  }
  if (!bytes) return Response.json({ error: "unavailable" }, { status: 503 });

  // AI avatars carry an `ai-` key prefix so we can recognize (and replace)
  // them on regenerate without touching the user's uploaded photos.
  const id = crypto.randomUUID();
  const key = `users/${userId}/ai-${id}.png`;
  await putObject({ key, body: bytes, contentType: "image/png" });
  const url = publicUrlFor(key);

  // Make it the displayed avatar: header + carousel pick the ready photo
  // with the lowest sortOrder, so insert just below the current minimum.
  const existing = await db
    .select({ id: profilePhotos.id, key: profilePhotos.key, s: profilePhotos.sortOrder })
    .from(profilePhotos)
    .where(eq(profilePhotos.userId, userId));
  const minSort = existing.length
    ? Math.min(...existing.map((r) => r.s))
    : 1;

  await db
    .insert(profilePhotos)
    .values({ id, userId, key, url, sortOrder: minSort - 1, ready: true });

  // Replace any previous AI avatar so regenerating doesn't pile emblems
  // into the carousel or orphan R2 objects. Uploaded photos are untouched.
  const priorAi = existing.filter((r) => r.key.includes("/ai-"));
  if (priorAi.length) {
    await db.delete(profilePhotos).where(
      inArray(
        profilePhotos.id,
        priorAi.map((r) => r.id)
      )
    );
    await Promise.all(
      priorAi.map((r) => deleteObject(r.key).catch(() => {}))
    );
  }

  // Bust the 30s header cache so the navbar avatar updates immediately.
  invalidateHeaderForUser(userId);

  return Response.json({ url, id, sign: sign.labelKa });
}
