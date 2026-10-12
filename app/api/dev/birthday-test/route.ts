import { Resend } from "resend";

import { auth } from "@/auth";
import { isAdminEmail } from "@/lib/admin-auth";
import {
  BIRTHDAY_SUBJECT,
  FALLBACK_PARAGRAPHS,
  generateBirthdayCopy,
} from "@/lib/birthday";
import { BirthdayEmail } from "@/lib/email-templates/birthday";

/**
 * Admin-only birthday-email preview: sends the REAL template with freshly
 * AI-generated copy to a given address, WITHOUT gifting a month or writing
 * the once-a-year log row. Usage (local dev, or logged in as admin):
 *   GET /api/dev/birthday-test?to=you@example.com&name=გივი&sign=მორიელი
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function GET(req: Request) {
  const isDev = process.env.NODE_ENV !== "production";
  if (!isDev) {
    const session = await auth();
    if (!isAdminEmail(session?.user?.email)) {
      return Response.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const url = new URL(req.url);
  const to = url.searchParams.get("to");
  const name = url.searchParams.get("name") || null;
  const sign = url.searchParams.get("sign") || null;
  if (!to) return Response.json({ error: "to required" }, { status: 400 });

  const key = process.env.RESEND_API_KEY;
  if (!key) return Response.json({ error: "resend not configured" }, { status: 503 });

  let paragraphs: string[];
  let source = "ai";
  try {
    paragraphs = await generateBirthdayCopy(name, sign);
  } catch (err) {
    paragraphs = FALLBACK_PARAGRAPHS;
    source = `fallback (${(err as Error).message})`;
  }

  const origin = process.env.APP_ORIGIN ?? "https://www.vivida.ge";
  const resend = new Resend(key);
  // RESEND_FROM may be a bare address or a full "Name <email>" string,
  // normalize so the sender always shows "Vivida", never a raw mailbox name.
  const envFrom = process.env.RESEND_FROM;
  const from = envFrom
    ? envFrom.includes("<")
      ? envFrom
      : `Vivida <${envFrom}>`
    : "Vivida <onboarding@resend.dev>";
  const result = await resend.emails.send({
    from,
    to,
    subject: `[TEST] ${BIRTHDAY_SUBJECT}`,
    react: BirthdayEmail({
      name,
      paragraphs,
      dashboardUrl: `${origin.replace(/\/$/, "")}/dashboard`,
    }),
  });

  if (result.error) {
    return Response.json(
      { error: result.error.message ?? "send failed" },
      { status: 502 }
    );
  }
  return Response.json({ ok: true, id: result.data?.id, source, paragraphs });
}
