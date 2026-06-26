import { and, eq } from "drizzle-orm";

import { auth } from "@/auth";
import { db } from "@/db";
import { dailyHoroscopes, profiles, users } from "@/db/schema";
import { localDateString } from "@/lib/transits";
import {
  DEFAULT_VOICE_SLUG,
  generateSpeech,
  isElevenLabsConfigured,
  isValidVoiceSlug,
  voiceBySlug,
} from "@/lib/elevenlabs";
import {
  objectExists,
  presignedDownloadUrl,
  putObject,
} from "@/lib/r2";
import { enforceRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

/**
 * Generate (or fetch cached) audio for the user's today horoscope.
 * Free while we test. The MP3 is cached in R2 keyed by (user, date, voice),
 * so each (user, day, voice) is synthesized at most once. Body: { voice? }.
 */
export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!isElevenLabsConfigured()) {
    return Response.json({ error: "audio_unavailable" }, { status: 503 });
  }

  // Cap cost — a few generations per user per hour is plenty.
  try {
    await enforceRateLimit({
      bucket: "horoscope_audio_user",
      identifier: userId,
      limit: 20,
      windowMs: 60 * 60 * 1000,
    });
  } catch {
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }

  const body = (await req.json().catch(() => ({}))) as { voice?: unknown };
  const requested =
    typeof body.voice === "string" && isValidVoiceSlug(body.voice)
      ? body.voice
      : null;

  // Resolve the voice: explicit request wins (and we persist it as the
  // preference); otherwise fall back to the saved preference / default.
  const [profile] = await db
    .select({ timezone: profiles.timezone })
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1);
  if (!profile?.timezone) {
    return Response.json({ error: "no_profile" }, { status: 400 });
  }

  const [userRow] = await db
    .select({ saved: users.horoscopeVoice })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const voiceSlug = requested ?? userRow?.saved ?? DEFAULT_VOICE_SLUG;
  const voice = voiceBySlug(voiceSlug);

  // Persist the preference when explicitly chosen and changed.
  if (requested && requested !== userRow?.saved) {
    await db
      .update(users)
      .set({ horoscopeVoice: requested })
      .where(eq(users.id, userId));
  }

  const today = localDateString(new Date(), profile.timezone);
  const [horoscope] = await db
    .select()
    .from(dailyHoroscopes)
    .where(
      and(eq(dailyHoroscopes.userId, userId), eq(dailyHoroscopes.date, today))
    )
    .limit(1);
  if (!horoscope) {
    return Response.json({ error: "no_horoscope" }, { status: 404 });
  }

  const key = `horoscope-audio/${userId}/${today}/${voice.slug}.mp3`;

  // Cached? Serve a fresh signed URL.
  if (await objectExists(key)) {
    const url = await presignedDownloadUrl({ key, expiresIn: 60 * 60 });
    return Response.json({ url, voice: voice.slug, cached: true });
  }

  // Generate, store, serve.
  try {
    const text = `${horoscope.headline}\n\n${horoscope.body}`;
    const mp3 = await generateSpeech(text, voice.voiceId);
    await putObject({ key, body: mp3, contentType: "audio/mpeg" });
    const url = await presignedDownloadUrl({ key, expiresIn: 60 * 60 });
    return Response.json({ url, voice: voice.slug, cached: false });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[horoscope/audio] generation failed:", msg);
    return Response.json({ error: "generation_failed" }, { status: 502 });
  }
}
