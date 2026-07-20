import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  getTestVisibility,
  setTestVisibility,
  type TestKind,
} from "@/lib/test-results";

/**
 * GET  /api/test-visibility → { mbti, iq, eq } for the signed-in user (204 if anon).
 * POST /api/test-visibility { kind, visible } → set one test's profile opt-in.
 * Backs the "show my result on my public profile" toggle on the result pages.
 */
export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return new NextResponse(null, { status: 204 });
  return NextResponse.json(await getTestVisibility(userId));
}

export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ ok: false }, { status: 401 });

  const body = (await req.json().catch(() => null)) as {
    kind?: unknown;
    visible?: unknown;
  } | null;
  const kind =
    body?.kind === "mbti" ||
    body?.kind === "iq" ||
    body?.kind === "eq" ||
    body?.kind === "big-five"
      ? body.kind
      : null;
  if (!kind || typeof body?.visible !== "boolean") {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  await setTestVisibility(userId, kind as TestKind, body.visible);
  return NextResponse.json({ ok: true });
}
