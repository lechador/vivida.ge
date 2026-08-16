import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { createPhotoUpload } from "@/lib/photos-core";

const CODE_STATUS: Record<string, number> = {
  storage_not_configured: 503,
  bad_request: 400,
  invalid_type: 400,
  too_large: 400,
  empty: 400,
  limit_reached: 400,
};

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const body = (await req.json().catch(() => null)) as {
      contentType?: unknown;
      contentLength?: unknown;
    } | null;

    const result = await createPhotoUpload(session.user.id, body ?? {});
    if (!result.ok) {
      return NextResponse.json(
        { error: result.code },
        { status: CODE_STATUS[result.code] ?? 400 }
      );
    }
    return NextResponse.json({
      photoId: result.photoId,
      uploadUrl: result.uploadUrl,
      publicUrl: result.publicUrl,
    });
  } catch (err) {
    const detail = describeError(err);
    console.error("[photos/upload-url] failed", {
      detail,
      stack: (err as Error)?.stack?.split("\n").slice(0, 6).join("\n"),
    });
    // Detail stays in the server log only — the SDK's cause chain leaks
    // bucket/endpoint/credential state to the client.
    return NextResponse.json({ error: "presign_failed" }, { status: 500 });
  }
}

function describeError(err: unknown): string {
  const parts: string[] = [];
  let cur: unknown = err;
  let depth = 0;
  while (cur && depth < 4) {
    const e = cur as {
      name?: string;
      message?: string;
      code?: string;
      cause?: unknown;
    };
    const name = e.name ?? "Error";
    const code = e.code ? ` [${e.code}]` : "";
    const msg = e.message ?? "";
    parts.push(`${name}${code}: ${msg}`);
    cur = e.cause;
    depth += 1;
  }
  return parts.join(" · cause: ");
}
