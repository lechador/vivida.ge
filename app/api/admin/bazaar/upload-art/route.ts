import { NextResponse } from "next/server";

import { publicUrlFor, putObject } from "@/lib/r2";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * TEMPORARY single-use art uploader (deleted same day). Allows the Bazaar
 * cover set to land in R2 without R2 credentials ever leaving Vercel:
 * authed by UPLOAD_TOKEN (a random Vercel env var, removed right after),
 * restricted to image/webp under bazaar/ with a 2 MB cap.
 */
export async function POST(req: Request) {
  const token = process.env.UPLOAD_TOKEN;
  if (!token || req.headers.get("x-upload-token") !== token) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = (await req.json().catch(() => null)) as {
    key?: unknown;
    base64?: unknown;
  } | null;
  if (
    !body ||
    typeof body.key !== "string" ||
    !/^bazaar\/[a-z0-9-]+\.webp$/.test(body.key) ||
    typeof body.base64 !== "string" ||
    body.base64.length === 0 ||
    body.base64.length > 2_800_000
  ) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  await putObject({
    key: body.key,
    body: Buffer.from(body.base64, "base64"),
    contentType: "image/webp",
    cacheControl: "public, max-age=31536000, immutable",
  });
  return NextResponse.json(
    { ok: true, url: publicUrlFor(body.key) },
    { status: 201 },
  );
}
