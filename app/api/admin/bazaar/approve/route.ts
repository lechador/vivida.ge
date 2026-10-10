import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { auth } from "@/auth";
import { db } from "@/db";
import { bazaarProviders, bazaarServices } from "@/db/schema";
import { isAdminEmail } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/admin/bazaar/approve — approve / suspend a reader, or
 * pause / reactivate one of their services. Consumed by the separate
 * vivida-admin app (x-admin-token) and by founder sessions (admin email).
 *
 * { providerId, action: "approve" | "suspend" }
 * { providerId, action: "pause_services" | "unpause_services" }
 */
export async function POST(req: Request) {
  const session = await auth();
  const sharedToken = process.env.ADMIN_API_TOKEN;
  const panelAuthorized = Boolean(
    sharedToken && req.headers.get("x-admin-token") === sharedToken,
  );
  if (!panelAuthorized && !isAdminEmail(session?.user?.email)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as {
    providerId?: unknown;
    action?: unknown;
  } | null;
  if (!body || typeof body.providerId !== "string" || !body.providerId) {
    return NextResponse.json({ error: "missing_provider" }, { status: 400 });
  }
  const action = body.action;
  if (
    action !== "approve" &&
    action !== "suspend" &&
    action !== "pause_services" &&
    action !== "unpause_services"
  ) {
    return NextResponse.json({ error: "invalid_action" }, { status: 400 });
  }

  if (action === "approve" || action === "suspend") {
    const status = action === "approve" ? "approved" : "suspended";
    await db
      .update(bazaarProviders)
      .set({ status, updatedAt: new Date() })
      .where(eq(bazaarProviders.id, body.providerId));
    if (status === "suspended") {
      await db
        .update(bazaarServices)
        .set({ status: "paused", updatedAt: new Date() })
        .where(eq(bazaarServices.providerId, body.providerId));
    }
    return NextResponse.json({ ok: true, status });
  }

  const status = action === "pause_services" ? "paused" : "active";
  await db
    .update(bazaarServices)
    .set({ status, updatedAt: new Date() })
    .where(eq(bazaarServices.providerId, body.providerId));
  return NextResponse.json({ ok: true, services: status });
}
