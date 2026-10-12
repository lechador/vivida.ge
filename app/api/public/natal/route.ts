import { computeChart } from "@/lib/astrology";
import { enforceRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/api/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;

/**
 * Public, no-auth natal chart computation for /nataluri-ruka. Returns PURE
 * chart data (positions, houses, aspects), no AI interpretation, nothing
 * persisted. Computation is local + deterministic (Swiss Ephemeris in-process).
 */
export async function POST(req: Request) {
  try {
    await enforceRateLimit({
      bucket: "public_natal_ip",
      identifier: getClientIp(req),
      limit: 40,
      windowMs: 60 * 60 * 1000,
    });
  } catch {
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }

  const body = (await req.json().catch(() => null)) as {
    date?: unknown;
    time?: unknown;
    latitude?: unknown;
    longitude?: unknown;
    timezone?: unknown;
  } | null;
  if (!body) return Response.json({ error: "bad_request" }, { status: 400 });

  const { date, time, latitude, longitude, timezone } = body;

  if (typeof date !== "string" || !DATE_RE.test(date)) {
    return Response.json({ error: "invalid_date" }, { status: 400 });
  }
  const timeStr = time == null || time === "" ? null : time;
  if (timeStr != null && (typeof timeStr !== "string" || !TIME_RE.test(timeStr))) {
    return Response.json({ error: "invalid_time" }, { status: 400 });
  }
  if (
    typeof latitude !== "number" ||
    !Number.isFinite(latitude) ||
    Math.abs(latitude) > 90 ||
    typeof longitude !== "number" ||
    !Number.isFinite(longitude) ||
    Math.abs(longitude) > 180
  ) {
    return Response.json({ error: "invalid_location" }, { status: 400 });
  }
  if (typeof timezone !== "string" || timezone.length === 0) {
    return Response.json({ error: "invalid_timezone" }, { status: 400 });
  }
  // Guard against absurd years (the local ephemeris is sane within history).
  const year = Number(date.slice(0, 4));
  if (year < 1800 || year > 2200) {
    return Response.json({ error: "invalid_date" }, { status: 400 });
  }

  try {
    const { data } = await computeChart({
      date,
      time: timeStr,
      latitude,
      longitude,
      timezone,
    });
    return Response.json({ chart: data });
  } catch (err) {
    console.error("[public/natal] compute failed:", err);
    return Response.json({ error: "compute_failed" }, { status: 500 });
  }
}
