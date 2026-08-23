import { auth } from "@/auth";
import { isAdminEmail } from "@/lib/admin-auth";
import { isR2Configured, putObject, publicUrlFor } from "@/lib/r2";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_BYTES = 12 * 1024 * 1024;
const CONTENT_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/avif", "avif"],
]);

function safeName(value: string | null): string {
  return (value ?? "article-cover")
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) || "article-cover";
}

export async function POST(request: Request) {
  const session = await auth();
  const sharedToken = process.env.ADMIN_API_TOKEN;
  const panelAuthorized = Boolean(
    sharedToken && request.headers.get("x-admin-token") === sharedToken,
  );
  if (!panelAuthorized && !isAdminEmail(session?.user?.email)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!isR2Configured()) {
    return Response.json({ error: "r2_unavailable" }, { status: 503 });
  }

  const contentType = request.headers.get("content-type")?.split(";")[0] ?? "";
  const extension = CONTENT_TYPES.get(contentType);
  if (!extension) {
    return Response.json({ error: "unsupported_image_type" }, { status: 415 });
  }

  const body = Buffer.from(await request.arrayBuffer());
  if (body.byteLength === 0 || body.byteLength > MAX_BYTES) {
    return Response.json({ error: "invalid_image_size" }, { status: 400 });
  }

  const stem = safeName(request.headers.get("x-file-name"));
  const key = `articles/${stem}-${crypto.randomUUID().slice(0, 8)}.${extension}`;
  await putObject({
    key,
    body,
    contentType,
    cacheControl: "public, max-age=31536000, immutable",
  });
  return Response.json({ ok: true, key, url: publicUrlFor(key) }, { status: 201 });
}
