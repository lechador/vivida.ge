import { auth } from "@/auth";
import { isAdminEmail } from "@/lib/admin-auth";
import { FAMOUS_ZODIAC_ASSETS } from "@/lib/zodiac-famous-assets";
import { isR2Configured, objectExists, putObject, publicUrlFor } from "@/lib/r2";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * One-time (and safe-to-repeat) R2 seed for the reviewed celebrity images.
 * The admin browser downloads the fixed Commons files, then this protected
 * endpoint accepts their bytes. That avoids rate-limiting Wikimedia from a
 * shared Vercel server IP while keeping the R2 credentials server-only.
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

  const assetId = request.headers.get("x-quiz-asset-id");
  if (assetId) {
    const asset = FAMOUS_ZODIAC_ASSETS.find((item) => item.id === assetId);
    const contentType = request.headers.get("content-type")?.split(";")[0];
    if (!asset || !contentType?.startsWith("image/")) {
      return Response.json({ error: "invalid_asset" }, { status: 400 });
    }
    const body = Buffer.from(await request.arrayBuffer());
    if (body.byteLength === 0 || body.byteLength > 12 * 1024 * 1024) {
      return Response.json({ error: "invalid_asset_size" }, { status: 400 });
    }
    await putObject({ key: asset.key, body, contentType });
    return Response.json({ id: asset.id, url: publicUrlFor(asset.key), status: "uploaded" });
  }

  const availability = await Promise.all(
    FAMOUS_ZODIAC_ASSETS.map(async (asset) => ({
      asset,
      present: await objectExists(asset.key),
    }))
  );
  return Response.json({
    ready: availability.filter((item) => item.present).map(({ asset }) => ({ id: asset.id, url: publicUrlFor(asset.key), status: "already_present" })),
    assets: availability.filter((item) => !item.present).map(({ asset }) => ({ id: asset.id, sourceUrl: asset.sourceUrl })),
  });
}
