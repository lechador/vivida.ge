import { db } from "@/db";
import { pwaInstallations } from "@/db/schema";
import { getClientIp } from "@/lib/api/security";
import { enforceRateLimit } from "@/lib/rate-limit";
import { trackingConsentFromCookieString } from "@/lib/tracking-consent";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PLATFORMS = new Set(["ios", "android", "desktop"]);

export async function POST(req: Request) {
  const origin = req.headers.get("origin");
  if (origin && origin !== new URL(req.url).origin) {
    return Response.json({ error: "invalid_origin" }, { status: 403 });
  }
  if (
    trackingConsentFromCookieString(req.headers.get("cookie") ?? "") !==
    "granted"
  ) {
    return Response.json({ error: "consent_required" }, { status: 403 });
  }

  const body = (await req.json().catch(() => null)) as {
    id?: unknown;
    platform?: unknown;
  } | null;
  if (
    !body ||
    typeof body.id !== "string" ||
    !UUID_RE.test(body.id) ||
    typeof body.platform !== "string" ||
    !PLATFORMS.has(body.platform)
  ) {
    return Response.json({ error: "invalid_input" }, { status: 400 });
  }

  try {
    await enforceRateLimit({
      bucket: "pwa_open_ip",
      identifier: getClientIp(req),
      limit: 300,
      windowMs: 24 * 60 * 60 * 1000,
    });
    await db
      .insert(pwaInstallations)
      .values({ id: body.id, platform: body.platform })
      .onConflictDoUpdate({
        target: pwaInstallations.id,
        set: { lastOpenedAt: new Date() },
      });
    return Response.json({ ok: true });
  } catch (error) {
    console.warn("[pwa-open] failed:", (error as Error).message);
    return Response.json({ error: "unavailable" }, { status: 503 });
  }
}
