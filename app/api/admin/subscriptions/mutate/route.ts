import { NextRequest, NextResponse } from "next/server";

import {
  applyAdminSubAction,
  type AdminSubAction,
} from "@/lib/admin-subscriptions";

/**
 * Admin-only subscription mutation endpoint. Auth is the shared
 * `ADMIN_API_TOKEN` header — same scheme as /api/admin/emails/send.
 *
 * Body:
 *   {
 *     userId: string,
 *     action: "grant_pro" | "extend_pro" | "revoke_pro",
 *     days?: number   // required for grant_pro and extend_pro
 *   }
 *
 * Response on success:
 *   {
 *     ok: true,
 *     subscription: { plan, status, currentPeriodEnd, ... },
 *     email: { sent: boolean, reason?: string }
 *   }
 */
export const dynamic = "force-dynamic";

const ACTIONS = new Set(["grant_pro", "extend_pro", "revoke_pro"]);

function authed(req: NextRequest): boolean {
  const token = process.env.ADMIN_API_TOKEN;
  if (!token) return false;
  const provided = req.headers.get("x-admin-token");
  return !!provided && provided === token;
}

export async function POST(req: NextRequest) {
  if (!authed(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as {
    userId?: string;
    action?: string;
    days?: number;
  } | null;

  if (!body || typeof body.userId !== "string" || !body.userId.trim()) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }
  if (!body.action || !ACTIONS.has(body.action)) {
    return NextResponse.json({ error: "invalid action" }, { status: 400 });
  }

  let action: AdminSubAction;
  if (body.action === "grant_pro" || body.action === "extend_pro") {
    const days = typeof body.days === "number" ? body.days : Number(body.days);
    if (!Number.isFinite(days) || days < 1) {
      return NextResponse.json(
        { error: "days must be a positive number" },
        { status: 400 }
      );
    }
    action = { kind: body.action, days };
  } else {
    action = { kind: "revoke_pro" };
  }

  const result = await applyAdminSubAction(body.userId, action);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({
    ok: true,
    subscription: result.subscription,
    email: result.email,
  });
}
