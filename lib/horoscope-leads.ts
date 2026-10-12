import { Resend } from "resend";
import { and, eq, isNull, ne, or } from "drizzle-orm";

import { db } from "@/db";
import { horoscopeLeads, type HoroscopeLead } from "@/db/schema";
import { acquireResendSlot } from "@/lib/resend-throttle";
import { MarketingEmail } from "@/lib/email-templates/marketing";
import { ensureSignHoroscope } from "@/actions/sign-horoscope";
import { signByIndex } from "@/lib/zodiac";
import { slugByLabelKa } from "@/lib/seo/zodiac-content";

/**
 * Anonymous "daily horoscope by email" leads, a lower-friction return hook
 * captured from the free natal calculator. This owns a lean parallel to the
 * registered-user daily blast (lib/email-marketing.ts): same Resend transport
 * and throttle, but keyed on an email + sun sign instead of a user account,
 * and using the pre-warmed per-sign daily horoscope (no AI cost in the send
 * loop). Every email carries a strong "create a free account" CTA so the lead
 * converts into a real user over time.
 */

let _client: Resend | null = null;
function client(): Resend | null {
  if (_client) return _client;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  _client = new Resend(key);
  return _client;
}

function resolveFrom(envVal: string | undefined, fallback: string): string {
  if (!envVal) return fallback;
  return envVal.includes("<") ? envVal : `Vivida <${envVal}>`;
}
const FROM = resolveFrom(process.env.RESEND_FROM, "Vivida <hello@vivida.ge>");
const ORIGIN = process.env.EMAIL_ORIGIN ?? "https://vivida.ge";
function absUrl(path: string): string {
  return `${ORIGIN.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BIG_RE = /^\d{1,2}\.\d{1,2}\.\d{1,2}$/;

export type SubscribeResult =
  | { ok: true; isNew: boolean }
  | { ok: false; error: string };

/**
 * Upsert a lead. Idempotent on email: a repeat subscribe reactivates a
 * previously-unsubscribed row and refreshes the sun sign, never duplicating.
 */
export async function subscribeHoroscopeLead(input: {
  email: string;
  sunSign: number;
  big?: string | null;
}): Promise<SubscribeResult> {
  const email = input.email.trim().toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return { ok: false, error: "შეიყვანე სწორი ელფოსტა" };
  }
  if (
    !Number.isInteger(input.sunSign) ||
    input.sunSign < 0 ||
    input.sunSign > 11
  ) {
    return { ok: false, error: "ნიშანი ვერ დადგინდა" };
  }
  const big = input.big && BIG_RE.test(input.big) ? input.big : null;

  const [existing] = await db
    .select({ id: horoscopeLeads.id })
    .from(horoscopeLeads)
    .where(eq(horoscopeLeads.email, email))
    .limit(1);

  if (existing) {
    await db
      .update(horoscopeLeads)
      .set({ sunSign: input.sunSign, big, unsubscribedAt: null })
      .where(eq(horoscopeLeads.id, existing.id));
    return { ok: true, isNew: false };
  }

  await db
    .insert(horoscopeLeads)
    .values({ email, sunSign: input.sunSign, big });
  return { ok: true, isNew: true };
}

/**
 * Send today's per-sign horoscope to one lead. Returns true when a mail was
 * actually dispatched, false when we deliberately skip (unsubscribed, mailer
 * not configured, or no content for their sign yet). Throws on a hard send
 * failure so the caller can leave the row for a retry.
 */
async function sendToLead(
  lead: HoroscopeLead,
  opts?: { welcome?: boolean; idempotencyKey?: string }
): Promise<boolean> {
  const c = client();
  if (!c || lead.unsubscribedAt) return false;

  const sign = signByIndex(lead.sunSign);
  const slug = slugByLabelKa(sign.labelKa);
  if (!slug) return false;
  const row = await ensureSignHoroscope(slug, "day");
  if (!row) return false;

  const unsubUrl = absUrl(
    `/unsubscribe?token=${lead.unsubscribeToken}&type=lead`
  );
  const signupUrl = absUrl("/signup");

  const heading = opts?.welcome
    ? `🌙 გამოწერა დადასტურდა, ${sign.labelKa}`
    : `${sign.symbol} ${sign.labelKa}, ${row.headline}`;

  const body = opts?.welcome
    ? `გილოცავ, გამოწერე დღიური ჰოროსკოპი! ყოველ დილით მიიღებ ${sign.labelKa}-ის ჰოროსკოპს ელფოსტაზე.\n\nდღეს: ${row.summary}\n\nგინდა შენს ნატალურ რუკაზე მორგებული, პერსონალური ჰოროსკოპი, AI ანალიზი და მეტი? შექმენი უფასო ანგარიში.`
    : `${row.summary}\n\n${row.body ?? ""}`;

  await acquireResendSlot();
  const result = await c.emails.send(
    {
      from: FROM,
      to: lead.email,
      subject: opts?.welcome
        ? `გამოწერა დადასტურდა, ${sign.labelKa}-ის დღიური ჰოროსკოპი`
        : row.headline?.trim() || `${sign.labelKa}, დღევანდელი ჰოროსკოპი`,
      react: MarketingEmail({
        name: null,
        heading,
        body,
        ctaLabel: "შექმენი უფასო ანგარიში",
        ctaUrl: signupUrl,
        unsubscribeUrl: unsubUrl,
      }),
      headers: {
        "List-Unsubscribe": `<${unsubUrl}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    },
    opts?.idempotencyKey ? { idempotencyKey: opts.idempotencyKey } : undefined
  );
  if (result.error) throw new Error(result.error.message ?? "send failed");
  return true;
}

/**
 * Immediate welcome + today's horoscope, fired right after subscribe. Best-
 * effort: never throws to the caller (runs in an `after()` background task).
 */
export async function sendLeadWelcome(email: string): Promise<void> {
  try {
    const [lead] = await db
      .select()
      .from(horoscopeLeads)
      .where(eq(horoscopeLeads.email, email.trim().toLowerCase()))
      .limit(1);
    if (!lead) return;
    await sendToLead(lead, {
      welcome: true,
      idempotencyKey: `lead-welcome:${lead.id}`,
    });
  } catch (err) {
    console.warn(
      "[horoscope-leads] welcome send failed:",
      (err as Error).message
    );
  }
}

export type LeadBlastResult = {
  audience: number;
  sent: number;
  skipped: number;
  failed: number;
};

/**
 * Daily send to every active lead who hasn't been mailed yet today.
 * Idempotent per day via `lastSentDate` plus a per-lead Resend idempotency
 * key. Best-effort per lead: a throw leaves `lastSentDate` unset so the next
 * cron tick retries; a deliberate skip still marks the day to avoid churn.
 */
export async function sendDailyHoroscopeToLeads(opts: {
  sendDate: string;
}): Promise<LeadBlastResult> {
  const c = client();
  const leads = await db
    .select()
    .from(horoscopeLeads)
    .where(
      and(
        isNull(horoscopeLeads.unsubscribedAt),
        or(
          isNull(horoscopeLeads.lastSentDate),
          ne(horoscopeLeads.lastSentDate, opts.sendDate)
        )
      )
    );

  if (!c || leads.length === 0) {
    return { audience: leads.length, sent: 0, skipped: 0, failed: 0 };
  }

  let sent = 0;
  let skipped = 0;
  let failed = 0;

  // Serial loop, acquireResendSlot() already paces the actual sends under the
  // account rate limit, and lead volume is small relative to the user blast.
  for (const lead of leads) {
    try {
      const ok = await sendToLead(lead, {
        idempotencyKey: `lead-daily:${lead.id}:${opts.sendDate}`,
      });
      await db
        .update(horoscopeLeads)
        .set({ lastSentDate: opts.sendDate })
        .where(eq(horoscopeLeads.id, lead.id));
      if (ok) sent++;
      else skipped++;
    } catch (err) {
      console.warn(
        "[horoscope-leads] daily send failed:",
        (err as Error).message
      );
      failed++;
    }
  }

  return { audience: leads.length, sent, skipped, failed };
}

/**
 * One-click unsubscribe by token (from the email's List-Unsubscribe link).
 * Returns { email } on success, null when the token matches no lead.
 */
export async function unsubscribeLeadByToken(
  token: string
): Promise<{ email: string } | null> {
  if (!token) return null;
  const [row] = await db
    .select({ id: horoscopeLeads.id, email: horoscopeLeads.email })
    .from(horoscopeLeads)
    .where(eq(horoscopeLeads.unsubscribeToken, token))
    .limit(1);
  if (!row) return null;
  await db
    .update(horoscopeLeads)
    .set({ unsubscribedAt: new Date() })
    .where(eq(horoscopeLeads.id, row.id));
  return { email: row.email };
}
