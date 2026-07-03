/**
 * Birthday gifts — the daily cron calls `sendBirthdayGifts()` which, for
 * every user whose birthday is today (Tbilisi time):
 *
 *   1. claims an email_send_log row (kind='birthday') — the once-a-year guard
 *   2. extends their Pro access by one month (trial users and paying
 *      subscribers alike get +30 days on current_period_end; lapsed/free
 *      users get a fresh 30-day trialing period)
 *   3. sends a short, warm AI-written email (Gemini via OpenRouter) with the
 *      gift announcement; a curated fallback body means the send never
 *      depends on the AI call succeeding
 *
 * The gift is applied before the send, so even an email failure never costs
 * the user their present — the log row records 'failed' for the admin panel.
 */

import { Resend } from "resend";
import { and, eq, gt, sql as dsql } from "drizzle-orm";

import { db } from "@/db";
import { emailSendLog, profiles, subscriptions, users } from "@/db/schema";
import { BirthdayEmail } from "@/lib/email-templates/birthday";
import { signByIndex } from "@/lib/zodiac";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
// Same high-quality model as the interpretation library — volume is a few
// emails a day, so we spend the good model on warmth.
const BIRTHDAY_MODEL = "google/gemini-3.1-pro-preview";

// Same resolution as lib/email.ts so all mail shows a consistent sender.
const FROM = process.env.RESEND_FROM ?? "Vivida <onboarding@resend.dev>";
const ORIGIN = process.env.APP_ORIGIN ?? "https://www.vivida.ge";

const GIFT_DAYS = 30;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const SUBJECT = "გილოცავ დაბადების დღეს! 🎂 საჩუქარი გელოდება";

/** Curated fallback body — used whenever the AI call fails or is unset. */
const FALLBACK_PARAGRAPHS = [
  "დღეს შენი დღეა — და მთელი ცა შენკენ იყურება. გვინდა ვივიდას გუნდიდან გულით მოგილოცოთ დაბადების დღე: იყოს ეს წელი შენთვის ნათელი, თბილი და სავსე იმ რამით, რაც ნამდვილად გახარებს.",
  "ვარსკვლავები დღეს შენს პატივსაცემად ანათებენ — ჩვენ კი პატარა საჩუქარი მოგიმზადეთ. ❤️",
];

type BirthdayUser = {
  userId: string;
  email: string | null;
  name: string | null;
  sunSignIndex: number | null;
};

/**
 * Users whose birthday is "today" in Tbilisi. Feb-29 birthdays celebrate on
 * Feb-28 in non-leap years so they're never skipped.
 */
async function findBirthdayUsers(): Promise<BirthdayUser[]> {
  const rows = await db.execute<{
    user_id: string;
    email: string | null;
    name: string | null;
    sun_idx: number | null;
  }>(dsql`
    SELECT u.id AS user_id, u.email, u.name,
           (c.data->'bodies'->'sun'->>'signIndex')::int AS sun_idx
    FROM profile p
    JOIN "user" u ON u.id = p.user_id
    LEFT JOIN chart c ON c.user_id = u.id
    WHERE p.date_of_birth IS NOT NULL
      AND (
        to_char(p.date_of_birth::date, 'MM-DD')
          = to_char(now() AT TIME ZONE 'Asia/Tbilisi', 'MM-DD')
        OR (
          -- Feb-29 birthday, non-leap year → celebrate on Feb-28
          to_char(p.date_of_birth::date, 'MM-DD') = '02-29'
          AND to_char(now() AT TIME ZONE 'Asia/Tbilisi', 'MM-DD') = '02-28'
          AND extract(year FROM now() AT TIME ZONE 'Asia/Tbilisi')::int % 4 <> 0
        )
      )
  `);
  const list = Array.isArray(rows) ? rows : (rows as { rows: unknown[] }).rows;
  return (list as Array<Record<string, unknown>>).map((r) => ({
    userId: String(r.user_id),
    email: (r.email as string) ?? null,
    name: (r.name as string) ?? null,
    sunSignIndex: r.sun_idx == null ? null : Number(r.sun_idx),
  }));
}

/** Already gifted within the past 300 days? (Once per birthday-year guard.) */
async function alreadyGiftedThisYear(userId: string): Promise<boolean> {
  const cutoff = new Date(Date.now() - 300 * MS_PER_DAY);
  const [row] = await db
    .select({ id: emailSendLog.id })
    .from(emailSendLog)
    .where(
      and(
        eq(emailSendLog.userId, userId),
        eq(emailSendLog.kind, "birthday"),
        gt(emailSendLog.sentAt, cutoff)
      )
    )
    .limit(1);
  return !!row;
}

/**
 * +30 days of Pro. Active/trialing subs extend from whichever is later —
 * now or their current period end (so time already paid/gifted isn't lost).
 * Lapsed or missing subs get a fresh trialing month.
 *
 * NOTE for Stripe-billed subscribers: this extends access in OUR db; Stripe
 * still bills on its own cycle and a webhook may overwrite currentPeriodEnd.
 * With the current all-trial user base that's fine — revisit with a Stripe
 * coupon/pause flow once real paid subscriptions exist.
 */
async function giftOneMonth(userId: string): Promise<void> {
  const now = new Date();
  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);

  const isLive =
    sub &&
    sub.plan === "pro" &&
    (sub.status === "active" || sub.status === "trialing") &&
    (!sub.currentPeriodEnd || sub.currentPeriodEnd.getTime() > now.getTime());

  if (isLive && sub) {
    const base =
      sub.currentPeriodEnd && sub.currentPeriodEnd.getTime() > now.getTime()
        ? sub.currentPeriodEnd
        : now;
    await db
      .update(subscriptions)
      .set({
        currentPeriodEnd: new Date(base.getTime() + GIFT_DAYS * MS_PER_DAY),
      })
      .where(eq(subscriptions.userId, userId));
    return;
  }

  // Lapsed or never had a row → fresh gifted month (trialing semantics).
  await db
    .insert(subscriptions)
    .values({
      userId,
      plan: "pro",
      status: "trialing",
      currentPeriodStart: now,
      currentPeriodEnd: new Date(now.getTime() + GIFT_DAYS * MS_PER_DAY),
      cancelAtPeriodEnd: false,
    })
    .onConflictDoUpdate({
      target: subscriptions.userId,
      set: {
        plan: "pro",
        status: "trialing",
        currentPeriodStart: now,
        currentPeriodEnd: new Date(now.getTime() + GIFT_DAYS * MS_PER_DAY),
      },
    });
}

interface OpenRouterJson {
  choices?: Array<{ message?: { content?: string } }>;
  error?: { message: string };
}

/**
 * Two short, warm Georgian paragraphs from Gemini. Personalized with the
 * name and (when known) sun sign. Throws on failure — caller falls back.
 */
async function generateBirthdayCopy(
  name: string | null,
  sunSignKa: string | null
): Promise<string[]> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY missing");

  const system =
    "შენ ხარ Vivida-ს (ქართული ასტროლოგიური პლატფორმის) გუნდის თბილი ხმა. " +
    "წერ გულწრფელ, ადამიანურ ქართულს — არა ოფიციალურს, არა გადამეტებულად " +
    'პათეტიკურს. კლიშეების გარეშე ("ბედნიერების ოკეანე"). მოკლედ და გულთბილად.';
  const user =
    `დაწერე დაბადების დღის მისალოცი ${name ? `სახელად ${name}-სთვის` : "ჩვენი მომხმარებლისთვის"}` +
    (sunSignKa ? ` (ზოდიაქო: ${sunSignKa})` : "") +
    `. ზუსტად 2 მოკლე აბზაცი (თითო 2-3 წინადადება): პირველი — თბილი, პირადი მილოცვა` +
    (sunSignKa ? ` მისი ნიშნის ენერგიის მსუბუქი ხსენებით` : "") +
    `; მეორე — გულთბილი სურვილი ახალი წლისთვის ვარსკვლავურ ნოტაზე. საჩუქარს ნუ ახსენებ — ის ცალკეა. ` +
    `დააბრუნე JSON: { "p1": string, "p2": string }`;

  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": "https://vivida.ge",
      "X-Title": "Vivida birthday",
    },
    body: JSON.stringify({
      model: BIRTHDAY_MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
      temperature: 0.9,
      // Reasoning model — leave headroom beyond the thinking budget.
      max_tokens: 8000,
    }),
  });
  if (!res.ok) throw new Error(`OpenRouter ${res.status}`);
  const json = (await res.json()) as OpenRouterJson;
  if (json.error) throw new Error(json.error.message);
  const raw = json.choices?.[0]?.message?.content ?? "";
  const stripped = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
  const parsed = JSON.parse(stripped) as { p1?: string; p2?: string };
  const out = [parsed.p1, parsed.p2].filter(
    (p): p is string => typeof p === "string" && p.trim().length > 0
  );
  if (out.length === 0) throw new Error("empty birthday copy");
  return out;
}

export type BirthdayResult = {
  birthdays: number;
  gifted: number;
  emailed: number;
  failed: number;
};

/** Cron entrypoint — gift + email everyone whose birthday is today. */
export async function sendBirthdayGifts(): Promise<BirthdayResult> {
  const found = await findBirthdayUsers();
  const result: BirthdayResult = {
    birthdays: found.length,
    gifted: 0,
    emailed: 0,
    failed: 0,
  };
  if (found.length === 0) return result;

  const resendKey = process.env.RESEND_API_KEY;
  const resend = resendKey ? new Resend(resendKey) : null;
  const year = new Date().getUTCFullYear();

  for (const u of found) {
    try {
      if (await alreadyGiftedThisYear(u.userId)) continue;

      // Claim the year's slot first — the guard row — so a concurrent cron
      // tick can't double-gift.
      const [claim] = await db
        .insert(emailSendLog)
        .values({
          userId: u.userId,
          kind: "birthday",
          email: u.email,
          subject: SUBJECT,
          status: "pending",
        })
        .returning({ id: emailSendLog.id });

      await giftOneMonth(u.userId);
      result.gifted++;

      if (!resend || !u.email) {
        // Gift applied but no way to email — mark so admin can see it.
        await db
          .update(emailSendLog)
          .set({ status: "failed", error: resend ? "no email address" : "resend not configured" })
          .where(eq(emailSendLog.id, claim.id));
        result.failed++;
        continue;
      }

      const firstName = u.name?.split(" ")[0] ?? null;
      const sunSignKa =
        u.sunSignIndex == null ? null : signByIndex(u.sunSignIndex).labelKa;

      let paragraphs: string[];
      try {
        paragraphs = await generateBirthdayCopy(firstName, sunSignKa);
      } catch (err) {
        console.warn(
          "[birthday] AI copy failed, using fallback:",
          (err as Error).message
        );
        paragraphs = FALLBACK_PARAGRAPHS;
      }

      const send = await resend.emails.send(
        {
          from: FROM,
          to: u.email,
          subject: SUBJECT,
          react: BirthdayEmail({
            name: firstName,
            paragraphs,
            dashboardUrl: `${ORIGIN.replace(/\/$/, "")}/dashboard`,
          }),
        },
        { idempotencyKey: `birthday:${u.userId}:${year}` }
      );

      if (send.error) {
        await db
          .update(emailSendLog)
          .set({ status: "failed", error: send.error.message ?? "send failed" })
          .where(eq(emailSendLog.id, claim.id));
        result.failed++;
      } else {
        await db
          .update(emailSendLog)
          .set({ status: "sent" })
          .where(eq(emailSendLog.id, claim.id));
        result.emailed++;
      }
    } catch (err) {
      result.failed++;
      console.warn(
        `[birthday] failed for ${u.userId}:`,
        (err as Error).message
      );
    }
  }
  return result;
}
