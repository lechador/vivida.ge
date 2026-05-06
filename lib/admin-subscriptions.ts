import { eq } from "drizzle-orm";
import { Resend } from "resend";

import { db } from "@/db";
import { subscriptions, users, type Subscription } from "@/db/schema";
import {
  SubscriptionEmail,
  subjectFor,
  type SubscriptionEmailKind,
} from "@/lib/email-templates/subscription";

/**
 * Admin-side subscription mutations. Three actions:
 *   - grant_pro: set the user to trialing-Pro for N days. Overwrites any
 *     existing row (use with care — it WILL replace a paying subscription
 *     and clear Flitt linkage). The admin sees the current state in the
 *     panel before clicking, so we trust the call.
 *   - extend_pro: bump currentPeriodEnd forward by N days. Requires an
 *     existing pro row (no-op when free).
 *   - revoke_pro: flip to canceled/free. Keeps the row for audit.
 *
 * Each successful mutation fires a localized email to the user (best
 * effort — failure to email never rolls back the DB change).
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export type AdminSubAction =
  | { kind: "grant_pro"; days: number }
  | { kind: "extend_pro"; days: number }
  | { kind: "revoke_pro" };

export type AdminSubResult =
  | {
      ok: true;
      subscription: Subscription;
      email: { sent: boolean; reason?: string };
    }
  | { ok: false; error: string };

let _client: Resend | null = null;
function resendClient(): Resend | null {
  if (_client) return _client;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  _client = new Resend(key);
  return _client;
}

const FROM = process.env.RESEND_FROM ?? "Vivida <hello@vivida.ge>";
const ORIGIN = process.env.APP_ORIGIN ?? "http://localhost:3000";

function absUrl(path: string): string {
  return `${ORIGIN.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

const KA_MONTHS = [
  "იანვარი",
  "თებერვალი",
  "მარტი",
  "აპრილი",
  "მაისი",
  "ივნისი",
  "ივლისი",
  "აგვისტო",
  "სექტემბერი",
  "ოქტომბერი",
  "ნოემბერი",
  "დეკემბერი",
];

function formatGeorgianDate(d: Date | null | undefined): string | null {
  if (!d) return null;
  return `${d.getDate()} ${KA_MONTHS[d.getMonth()]}, ${d.getFullYear()}`;
}

function clampDays(n: unknown): number | null {
  const v = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(v)) return null;
  const i = Math.round(v);
  if (i < 1 || i > 3650) return null; // 1 day .. 10 years
  return i;
}

export async function applyAdminSubAction(
  userId: string,
  action: AdminSubAction
): Promise<AdminSubResult> {
  const [user] = await db
    .select({ id: users.id, email: users.email, name: users.name })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!user) return { ok: false, error: "user not found" };

  const [existing] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);

  let next: Subscription | null = null;
  let emailKind: SubscriptionEmailKind | null = null;
  let emailDays: number | null = null;

  if (action.kind === "grant_pro") {
    const days = clampDays(action.days);
    if (days == null) return { ok: false, error: "invalid days" };

    const now = new Date();
    const periodEnd = new Date(now.getTime() + days * MS_PER_DAY);
    const values = {
      userId,
      plan: "pro" as const,
      status: "trialing" as const,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: false,
      // Admin-granted gift — clear Flitt linkage so it isn't conflated
      // with a paid subscription in webhooks.
      flittOrderId: null,
      flittSubscriptionId: null,
      flittCustomerId: null,
      interval: null,
      priceCents: null,
      currency: "GEL" as const,
      updatedAt: now,
    };

    if (existing) {
      const [row] = await db
        .update(subscriptions)
        .set(values)
        .where(eq(subscriptions.userId, userId))
        .returning();
      next = row ?? null;
    } else {
      const [row] = await db
        .insert(subscriptions)
        .values(values)
        .returning();
      next = row ?? null;
    }
    emailKind = "granted";
    emailDays = days;
  } else if (action.kind === "extend_pro") {
    const days = clampDays(action.days);
    if (days == null) return { ok: false, error: "invalid days" };
    if (!existing || existing.plan !== "pro") {
      return { ok: false, error: "user has no Pro subscription to extend" };
    }

    // Extend from whichever is later: now, or current period end. If the
    // existing period already lapsed we don't want to add days into the
    // past — that would silently leave the user inactive.
    const baseline = existing.currentPeriodEnd
      ? Math.max(existing.currentPeriodEnd.getTime(), Date.now())
      : Date.now();
    const periodEnd = new Date(baseline + days * MS_PER_DAY);
    const now = new Date();

    const [row] = await db
      .update(subscriptions)
      .set({
        currentPeriodEnd: periodEnd,
        // If they were canceled/inactive but we're extending, restore
        // them to trialing so isProActive() picks them up.
        status:
          existing.status === "active" || existing.status === "trialing"
            ? existing.status
            : "trialing",
        cancelAtPeriodEnd: false,
        updatedAt: now,
      })
      .where(eq(subscriptions.userId, userId))
      .returning();
    next = row ?? null;
    emailKind = "extended";
    emailDays = days;
  } else if (action.kind === "revoke_pro") {
    if (!existing) {
      return { ok: false, error: "user is already on the free tier" };
    }
    const now = new Date();
    const [row] = await db
      .update(subscriptions)
      .set({
        plan: "free",
        status: "canceled",
        cancelAtPeriodEnd: false,
        currentPeriodEnd: now,
        updatedAt: now,
      })
      .where(eq(subscriptions.userId, userId))
      .returning();
    next = row ?? null;
    emailKind = "revoked";
    emailDays = null;
  } else {
    return { ok: false, error: "unknown action" };
  }

  if (!next) return { ok: false, error: "DB write returned no row" };

  // Email is best-effort. We never roll back the DB change if Resend
  // is down or the user has no email on file — the admin still sees
  // the resulting state in the panel.
  const email = await sendSubscriptionEmail({
    kind: emailKind,
    to: user.email,
    name: user.name,
    days: emailDays,
    periodEnd: next.currentPeriodEnd,
  });

  return { ok: true, subscription: next, email };
}

async function sendSubscriptionEmail({
  kind,
  to,
  name,
  days,
  periodEnd,
}: {
  kind: SubscriptionEmailKind;
  to: string | null;
  name: string | null;
  days: number | null;
  periodEnd: Date | null;
}): Promise<{ sent: boolean; reason?: string }> {
  if (!to) return { sent: false, reason: "no email on file" };
  const c = resendClient();
  if (!c) return { sent: false, reason: "RESEND_API_KEY not configured" };

  const ctaUrl = absUrl(kind === "revoked" ? "/pricing" : "/dashboard");
  const periodEndLabel =
    kind === "revoked" ? null : formatGeorgianDate(periodEnd);

  try {
    const result = await c.emails.send({
      from: FROM,
      to,
      subject: subjectFor(kind),
      react: SubscriptionEmail({
        kind,
        name,
        days,
        periodEndLabel,
        ctaUrl,
      }),
    });
    if (result.error) {
      console.warn("[admin-subscriptions] email send failed:", result.error);
      return { sent: false, reason: result.error.message ?? "send failed" };
    }
    return { sent: true };
  } catch (err) {
    console.warn(
      "[admin-subscriptions] email send threw:",
      (err as Error).message
    );
    return { sent: false, reason: (err as Error).message };
  }
}
