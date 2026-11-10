/**
 * Dunning: one email (and best-effort push) when a subscription renewal
 * invoice fails, sent from the Stripe `invoice.payment_failed` webhook.
 *
 * A billing notice is transactional, so like the trial-ending reminder it is
 * not gated by the nudge unsubscribe preference or the lifecycle frequency
 * cap. Idempotent per invoice: Stripe fires this event on every retry
 * attempt, so a claim row in `email_send_log` with kind
 * `payment_failed:<invoice id>` (the column is free text and there is no
 * reference column) is inserted before sending, and Resend also gets a
 * per-invoice Idempotency-Key.
 */
import { Resend } from "resend";
import { and, eq, inArray } from "drizzle-orm";
import type Stripe from "stripe";

import { db } from "@/db";
import { emailSendLog, users } from "@/db/schema";
import { formatBillingAmount } from "@/lib/billing-config";
import { PaymentFailedEmail } from "@/lib/email-templates/payment-failed";
import { normalizeUserLocale, type UserLocale } from "@/lib/i18n/user-locale";
import { isPushConfigured, sendPushToUser } from "@/lib/push";
import { acquireResendSlot } from "@/lib/resend-throttle";
import { ENGLISH_SITE_URL } from "@/lib/seo/locales";
import { getOrCreateUnsubscribeToken } from "@/lib/unsubscribe";

export const PAYMENT_FAILED_KIND_PREFIX = "payment_failed:";

const ORIGIN = process.env.APP_ORIGIN ?? "https://www.vivida.ge";

function resolveFrom(envVal: string | undefined, fallback: string): string {
  if (!envVal) return fallback;
  return envVal.includes("<") ? envVal : `Vivida <${envVal}>`;
}
const FROM = resolveFrom(
  process.env.RESEND_FROM,
  "Vivida <onboarding@resend.dev>",
);

function subjectFor(locale: UserLocale): string {
  if (locale === "pl")
    return "Nie udało się pobrać płatności za Vivida PRO — zaktualizuj kartę";
  if (locale === "en")
    return "Your Vivida PRO payment did not go through — please update your card";
  return "Vivida PRO-ს გადახდა ვერ განხორციელდა — განაახლე ბარათი";
}

function pushFor(locale: UserLocale): { title: string; body: string } {
  if (locale === "pl")
    return {
      title: "Płatność za Vivida PRO nie przeszła",
      body: "Zaktualizuj kartę, aby PRO działało bez przerwy.",
    };
  if (locale === "en")
    return {
      title: "Your Vivida PRO payment failed",
      body: "Update your card to keep PRO running without interruption.",
    };
  return {
    title: "Vivida PRO-ს გადახდა ვერ განხორციელდა",
    body: "განაახლე ბარათი, რომ PRO შეფერხების გარეშე გაგრძელდეს.",
  };
}

export type PaymentFailedResult = "sent" | "duplicate" | "skipped" | "failed";

function subscriptionIdOf(invoice: Stripe.Invoice): string | null {
  const ref = invoice.parent?.subscription_details?.subscription ?? null;
  return typeof ref === "string" ? ref : (ref?.id ?? null);
}

export async function sendPaymentFailedNotice(input: {
  invoice: Stripe.Invoice;
  /** Resolved by the webhook from the (re-fetched) subscription. */
  userId: string;
}): Promise<PaymentFailedResult> {
  const { invoice, userId } = input;
  if (!invoice.id || !subscriptionIdOf(invoice)) return "skipped";
  // The very first invoice failing happens inside Checkout, where the buyer
  // is already looking at Stripe's own error; there is nothing to "update".
  if (invoice.billing_reason === "subscription_create") return "skipped";

  const kind = `${PAYMENT_FAILED_KIND_PREFIX}${invoice.id}`;

  const [user] = await db
    .select({
      email: users.email,
      name: users.name,
      locale: users.interfaceLanguage,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!user?.email) return "skipped";

  const existing = await db
    .select({ id: emailSendLog.id })
    .from(emailSendLog)
    .where(
      and(
        eq(emailSendLog.userId, userId),
        eq(emailSendLog.kind, kind),
        inArray(emailSendLog.status, ["sent", "pending"]),
      ),
    )
    .limit(1);
  if (existing.length > 0) return "duplicate";

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.warn("[payment-failed] RESEND_API_KEY missing, cannot send");
    return "skipped";
  }

  const locale = normalizeUserLocale(user.locale);
  const origin = locale === "en" ? ENGLISH_SITE_URL : ORIGIN;
  const subject = subjectFor(locale);
  const amountLabel =
    invoice.amount_due > 0
      ? formatBillingAmount(invoice.amount_due, invoice.currency, locale)
      : null;

  // Claim first: a crashed or redelivered run cannot double-send.
  const [claim] = await db
    .insert(emailSendLog)
    .values({ userId, kind, email: user.email, subject, status: "pending" })
    .returning({ id: emailSendLog.id });

  try {
    const token = await getOrCreateUnsubscribeToken(userId);
    const unsubUrl = `${origin}/unsubscribe?token=${token}&type=nudges`;
    // /api/subscription/portal is POST-only, so land on the subscription
    // page (behind login), whose manage button opens the Stripe portal.
    const manageUrl = `${origin}/login?next=${encodeURIComponent("/subscription")}`;

    await acquireResendSlot();
    const sendResult = await new Resend(resendKey).emails.send(
      {
        from: FROM,
        to: user.email,
        subject,
        react: PaymentFailedEmail({
          name: user.name?.split(" ")[0] ?? null,
          amountLabel,
          manageUrl,
          unsubscribeUrl: unsubUrl,
          locale,
        }),
        headers: {
          "List-Unsubscribe": `<${unsubUrl}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
      },
      { idempotencyKey: kind },
    );
    if (sendResult.error) {
      await db
        .update(emailSendLog)
        .set({ status: "failed", error: sendResult.error.message })
        .where(eq(emailSendLog.id, claim.id));
      return "failed";
    }
    await db
      .update(emailSendLog)
      .set({ status: "sent" })
      .where(eq(emailSendLog.id, claim.id));
  } catch (err) {
    console.warn(
      `[payment-failed] email failed for ${userId}:`,
      (err as Error).message,
    );
    try {
      await db
        .update(emailSendLog)
        .set({ status: "failed", error: (err as Error).message })
        .where(eq(emailSendLog.id, claim.id));
    } catch {
      /* claim row ages out; the send itself already failed */
    }
    return "failed";
  }

  if (isPushConfigured()) {
    try {
      const copy = pushFor(locale);
      await sendPushToUser(
        userId,
        { ...copy, url: "/subscription", tag: "payment-failed" },
        { bypassDailyCap: true },
      );
    } catch (err) {
      console.warn("[payment-failed] push failed:", (err as Error).message);
    }
  }
  return "sent";
}
