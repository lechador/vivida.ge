import { after } from "next/server";

import { enforceRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/api/security";
import type { UserLocale } from "@/lib/i18n/user-locale";
import { isEnglishHost } from "@/lib/seo/locales";
import { subscribeHoroscopeLead, sendLeadWelcome } from "@/lib/horoscope-leads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Public, no-auth "get the daily horoscope by email" capture for the free
 * natal calculator, in Georgian, English or Polish. A lower-friction alternative to full signup: stores an
 * anonymous lead (email + sun sign) and fires an immediate welcome email in
 * the background so the user sees instant success. IP rate-limited.
 */
export async function POST(req: Request) {
  try {
    await enforceRateLimit({
      bucket: "horoscope_subscribe_ip",
      identifier: getClientIp(req),
      limit: 10,
      windowMs: 60 * 60 * 1000,
    });
  } catch {
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }

  const body = (await req.json().catch(() => null)) as {
    email?: unknown;
    sunSign?: unknown;
    big?: unknown;
    locale?: unknown;
  } | null;
  if (!body) return Response.json({ error: "bad_request" }, { status: 400 });

  const email = typeof body.email === "string" ? body.email : "";
  const sunSign = typeof body.sunSign === "number" ? body.sunSign : NaN;
  const big = typeof body.big === "string" ? body.big : null;

  // The host decides between Georgian and international; on the international
  // site the form says which of English/Polish the reader was looking at.
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  const locale: UserLocale = !isEnglishHost(host)
    ? "ka"
    : body.locale === "pl" || req.headers.get("x-vivida-locale") === "pl"
      ? "pl"
      : "en";

  const res = await subscribeHoroscopeLead({ email, sunSign, big, locale });
  if (!res.ok) return Response.json({ error: res.error }, { status: 400 });

  // Send the welcome after the response so the button flips to success
  // instantly instead of waiting on the mail round-trip.
  after(() => sendLeadWelcome(email));

  return Response.json({ ok: true, isNew: res.isNew });
}
