import { NextRequest, NextResponse } from "next/server";

import {
  audienceCount,
  sendBulk,
  type EmailTemplateKind,
} from "@/lib/email-marketing";

/**
 * Admin-only bulk email send endpoint. Expected to be called from the
 * vivida_admin panel (which runs locally) — auth is a single shared
 * secret in `ADMIN_API_TOKEN`. The token never lives in the browser:
 * the admin panel forwards from its server side.
 *
 * Body:
 *   {
 *     template: "daily_horoscope" | "profile_incomplete" | "marketing",
 *     subject?: string,         // marketing only
 *     body?: string,            // marketing only (paragraphs split on \n\n)
 *     ctaLabel?: string,
 *     ctaUrl?: string,
 *     dryRun?: boolean          // when true, only resolves audience size
 *   }
 *
 * Response: { audienceTotal, sent, skipped, failed: [...] }
 */
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const VALID_TEMPLATES: ReadonlySet<EmailTemplateKind> = new Set([
  "daily_horoscope",
  "profile_incomplete",
  "marketing",
]);

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
    template?: string;
    subject?: string;
    body?: string;
    ctaLabel?: string;
    ctaUrl?: string;
    dryRun?: boolean;
  } | null;

  if (!body || typeof body.template !== "string") {
    return NextResponse.json({ error: "template required" }, { status: 400 });
  }
  if (!VALID_TEMPLATES.has(body.template as EmailTemplateKind)) {
    return NextResponse.json({ error: "invalid template" }, { status: 400 });
  }
  const template = body.template as EmailTemplateKind;

  // Cheap dry-run path — admin clicks "preview audience" without firing.
  // Marketing skips the content check here; we want audience-counting to
  // work before the admin has typed the subject/body.
  if (body.dryRun === true) {
    const total = await audienceCount(template);
    return NextResponse.json({
      audienceTotal: total,
      sent: 0,
      skipped: total,
      failed: [],
    });
  }

  if (template === "marketing") {
    if (!body.subject?.trim() || !body.body?.trim()) {
      return NextResponse.json(
        { error: "marketing requires subject and body" },
        { status: 400 }
      );
    }
  }

  const result = await sendBulk({
    template,
    subject: body.subject,
    body: body.body,
    ctaLabel: body.ctaLabel ?? null,
    ctaUrl: body.ctaUrl ?? null,
  });
  return NextResponse.json(result);
}
