import { auth } from "@/auth";
import { isAdminEmail } from "@/lib/admin-auth";
import { FAMOUS_ZODIAC_ASSETS } from "@/lib/zodiac-famous-assets";
import { isR2Configured, objectExists, putObject, publicUrlFor } from "@/lib/r2";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

/**
 * One-time (and safe-to-repeat) R2 seed for the reviewed celebrity images.
 * It only fetches the hard-coded Commons URLs in `zodiac-famous-assets.ts`.
 * Use this after deployment while signed in as an admin.
 */
export async function POST(request: Request) {
  const session = await auth();
  const sharedToken = process.env.ADMIN_API_TOKEN;
  const panelAuthorized = Boolean(
    sharedToken && request.headers.get("x-admin-token") === sharedToken
  );
  if (!panelAuthorized && !isAdminEmail(session?.user?.email)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!isR2Configured()) {
    return Response.json({ error: "r2_unavailable" }, { status: 503 });
  }

  const ready: { id: string; url: string; status: "uploaded" | "already_present" }[] = [];
  const failed: { id: string; error: string }[] = [];

  for (const asset of FAMOUS_ZODIAC_ASSETS) {
    try {
      // A retry should only request missing files. This avoids repeatedly
      // downloading the already-seeded images and respects Commons' limits.
      if (await objectExists(asset.key)) {
        ready.push({ id: asset.id, url: publicUrlFor(asset.key), status: "already_present" });
        continue;
      }
      const response = await fetch(asset.sourceUrl, {
        headers: { "user-agent": "VividaQuizAssets/1.0" },
        signal: AbortSignal.timeout(20_000),
      });
      const contentType = response.headers.get("content-type")?.split(";")[0];
      const size = Number(response.headers.get("content-length") ?? 0);
      if (!response.ok || !contentType?.startsWith("image/") || size > 12 * 1024 * 1024) {
        throw new Error(`source rejected (status ${response.status})`);
      }
      const body = Buffer.from(await response.arrayBuffer());
      if (body.byteLength === 0 || body.byteLength > 12 * 1024 * 1024) {
        throw new Error("invalid source size");
      }
      await putObject({ key: asset.key, body, contentType });
      ready.push({ id: asset.id, url: publicUrlFor(asset.key), status: "uploaded" });
      // Commons is a shared public service. Keep the fixed asset seed gentle
      // instead of issuing a burst of image downloads from the Vercel worker.
      await new Promise((resolve) => setTimeout(resolve, 1_100));
    } catch (error) {
      failed.push({ id: asset.id, error: error instanceof Error ? error.message : "upload_failed" });
    }
  }

  return Response.json({ ready, failed });
}
