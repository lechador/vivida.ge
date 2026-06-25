import { searchPlaces } from "@/lib/geocoding";
import { enforceRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/api/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Public, no-auth geocoder for the natal-chart calculator at /nataluri-ruka.
 * Backed by the free Open-Meteo geocoder (no key). IP rate-limited to keep
 * it from being scraped as a free geocoding proxy.
 */
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return Response.json({ results: [] });

  try {
    await enforceRateLimit({
      bucket: "public_geocode_ip",
      identifier: getClientIp(req),
      limit: 120,
      windowMs: 60 * 1000,
    });
  } catch {
    return Response.json({ results: [] }, { status: 429 });
  }

  const results = await searchPlaces(q).catch(() => []);
  return Response.json({ results });
}
