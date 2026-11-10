import { Resend } from "resend";

import { auth } from "@/auth";
import { isAdminEmail } from "@/lib/admin-auth";
import {
  birthdayFallback,
  birthdaySubject,
  generateBirthdayCopy,
} from "@/lib/birthday";
import { normalizeUserLocale } from "@/lib/i18n/user-locale";
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
  const isPro =
    url.searchParams.get("pro") === "1" ||
    url.searchParams.get("pro") === "true";
  const locale = normalizeUserLocale(url.searchParams.get("locale"));
  if (!to) return Response.json({ error: "to required" }, { status: 400 });

  const key = process.env.RESEND_API_KEY;
  if (!key)
    return Response.json({ error: "resend not configured" }, { status: 503 });

  let paragraphs: string[];
  let source = "ai";
  try {
    paragraphs = await generateBirthdayCopy(name, sign, locale);
  } catch (err) {
    paragraphs = birthdayFallback(locale, !isPro);
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
    subject: `[TEST] ${birthdaySubject(locale)}`,
    react: BirthdayEmail({
      name,
      paragraphs,
      dashboardUrl: `${origin.replace(/\/$/, "")}/dashboard`,
      showGift: !isPro,
      locale,
    }),
  });

  if (result.error) {
    return Response.json(
      { error: result.error.message ?? "send failed" },
      { status: 502 },
    );
  }
  return Response.json({ ok: true, id: result.data?.id, source, paragraphs });
}
