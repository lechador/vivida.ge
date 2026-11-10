/**
 * Birthday gifts, the daily cron calls `sendBirthdayGifts()` which, for
 * every user whose birthday is today (Tbilisi time):
 *
 *   1. claims an email_send_log row (kind='birthday'), the once-a-year guard
 *   2. gifts them BIRTHDAY_CREDITS credits (fires the usual credit notification)
 *   3. sends a short, warm AI-written email (Gemini via OpenRouter) with the
 *      gift announcement; a curated fallback body means the send never
 *      depends on the AI call succeeding
 *
 * The gift is applied before the send, so even an email failure never costs
 * the user their present, the log row records 'failed' for the admin panel.
 */

import { Resend } from "resend";
import { and, eq, gt, sql as dsql } from "drizzle-orm";

import { db } from "@/db";
import { emailSendLog } from "@/db/schema";
import { grantCredits } from "@/lib/credits";
import { BIRTHDAY_CREDITS } from "@/lib/credits-config";
import { BirthdayEmail } from "@/lib/email-templates/birthday";
import { normalizeUserLocale, type UserLocale } from "@/lib/i18n/user-locale";
import { isPremiumUser } from "@/lib/premium";
import { acquireResendSlot } from "@/lib/resend-throttle";
import { ENGLISH_SITE_URL } from "@/lib/seo/locales";
import { signByIndex } from "@/lib/zodiac";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
// Same high-quality model as the interpretation library, volume is a few
// emails a day, so we spend the good model on warmth.
const BIRTHDAY_MODEL = "google/gemini-3.8-flash";

// RESEND_FROM may be a bare address or a full "Name <email>" string,
// normalize so the sender always shows "Vivida", never a raw mailbox name.
function resolveFrom(envVal: string | undefined, fallback: string): string {
  if (!envVal) return fallback;
  return envVal.includes("<") ? envVal : `Vivida <${envVal}>`;
}

const FROM = resolveFrom(
  process.env.RESEND_FROM,
  "Vivida <onboarding@resend.dev>",
);
const ORIGIN = process.env.APP_ORIGIN ?? "https://www.vivida.ge";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Credits gifted on a user's birthday (covers one full tarot reading). */
export { BIRTHDAY_CREDITS };

// Celebration-first subject, deliberately no gift mention (the gift is a
// P.S. inside, not the reason for the email).
export const BIRTHDAY_SUBJECT = "დღეს შენი დღეა ✨ გილოცავ დაბადების დღეს!";
const BIRTHDAY_SUBJECT_EN = "Today is your day ✨ Happy birthday!";
const BIRTHDAY_SUBJECT_PL = "Dziś jest Twój dzień ✨ Wszystkiego najlepszego!";

export function birthdaySubject(locale: UserLocale): string {
  if (locale === "pl") return BIRTHDAY_SUBJECT_PL;
  if (locale === "en") return BIRTHDAY_SUBJECT_EN;
  return BIRTHDAY_SUBJECT;
}

/** Curated fallback body, used whenever the AI call fails or is unset. */
export const FALLBACK_PARAGRAPHS = [
  "დღეს შენი დღეა, და მთელი ცა შენკენ იყურება. გვინდა ვივიდას გუნდიდან გულით მოგილოცოთ დაბადების დღე: იყოს ეს წელი შენთვის ნათელი, თბილი და სავსე იმ რამით, რაც ნამდვილად გახარებს.",
  "ვარსკვლავები დღეს შენს პატივსაცემად ანათებენ, ჩვენ კი პატარა საჩუქარი მოგიმზადეთ. ❤️",
];

/** Curated fallback body for PRO users (no credit gift mention). */
export const FALLBACK_PARAGRAPHS_PRO = [
  "დღეს შენი დღეა, და მთელი ცა შენკენ იყურება. გვინდა ვივიდას გუნდიდან გულით მოგილოცოთ დაბადების დღე: იყოს ეს წელი შენთვის ნათელი, თბილი და სავსე იმ რამით, რაც ნამდვილად გახარებს.",
  "ვარსკვლავები დღეს შენს პატივსაცემად ანათებენ — წინ საუკეთესო პირადი წელი გელოდება. ❤️",
];

const FALLBACK_PARAGRAPHS_EN = [
  "Today is your day, and the whole sky is turned your way. From all of us at Vivida, a heartfelt happy birthday: may this year be bright, warm and full of what truly makes you happy.",
  "The stars are shining in your honour today, and we have a small gift waiting for you. ❤️",
];
const FALLBACK_PARAGRAPHS_PRO_EN = [
  FALLBACK_PARAGRAPHS_EN[0],
  "The stars are shining in your honour today, and your best personal year lies ahead. ❤️",
];
const FALLBACK_PARAGRAPHS_PL = [
  "Dziś jest Twój dzień, a całe niebo zwraca się w Twoją stronę. Cały zespół Vivida składa Ci najserdeczniejsze życzenia urodzinowe: niech ten rok będzie jasny, ciepły i pełen tego, co naprawdę Cię cieszy.",
  "Gwiazdy świecą dziś na Twoją cześć, a my przygotowaliśmy dla Ciebie mały prezent. ❤️",
];
const FALLBACK_PARAGRAPHS_PRO_PL = [
  FALLBACK_PARAGRAPHS_PL[0],
  "Gwiazdy świecą dziś na Twoją cześć, a przed Tobą najlepszy osobisty rok. ❤️",
];

/** Curated fallback body in the reader's language. */
export function birthdayFallback(
  locale: UserLocale,
  gifted: boolean,
): string[] {
  if (locale === "pl")
    return gifted ? FALLBACK_PARAGRAPHS_PL : FALLBACK_PARAGRAPHS_PRO_PL;
  if (locale === "en")
    return gifted ? FALLBACK_PARAGRAPHS_EN : FALLBACK_PARAGRAPHS_PRO_EN;
  return gifted ? FALLBACK_PARAGRAPHS : FALLBACK_PARAGRAPHS_PRO;
}

type BirthdayUser = {
  userId: string;
  email: string | null;
  name: string | null;
  sunSignIndex: number | null;
  isPremium: boolean;
  locale: UserLocale;
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
    is_premium: boolean | null;
    locale: string | null;
  }>(dsql`
    SELECT u.id AS user_id, u.email, u.name, u.interface_language AS locale,
           (u.is_premium AND u.premium_until IS NOT NULL AND u.premium_until > now()) AS is_premium,
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
    isPremium: Boolean(r.is_premium),
    locale: normalizeUserLocale(r.locale as string | null),
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
        gt(emailSendLog.sentAt, cutoff),
      ),
    )
    .limit(1);
  return !!row;
}

/**
 * The birthday present: BIRTHDAY_CREDITS credits for free users. PRO users
 * bypass every credit gate, so gifting them credits makes no sense.
 * Routed through grantCredits so the user also gets a "credit" bell
 * notification. The once-a-year email_send_log guard (alreadyGiftedThisYear)
 * already prevents double-gifting.
 */
async function giftBirthdayCredits(userId: string): Promise<boolean> {
  if (await isPremiumUser(userId)) return false;
  await grantCredits(userId, BIRTHDAY_CREDITS, "birthday_gift");
  return true;
}

interface OpenRouterJson {
  choices?: Array<{ message?: { content?: string } }>;
  error?: { message: string };
}

/** English/Polish prompt; the Georgian one below is the approved original. */
function internationalBirthdayPrompt(
  name: string | null,
  sign: string | null,
  locale: "en" | "pl",
): { system: string; user: string } {
  const language = locale === "pl" ? "Polish" : "English";
  const system =
    `You are the warm voice of the Vivida team (an astrology platform). ` +
    `Write sincere, human, natural ${language}: not formal, not over the top, ` +
    `no clichés. The goal: the reader should feel they truly matter and that ` +
    `their day is being celebrated from the heart, not with a template.` +
    (locale === "pl"
      ? " Address the reader informally (ty) and avoid gendered verb forms, " +
        "since you do not know the reader's gender."
      : "");
  const user =
    `Write a birthday greeting ${name ? `for ${name}` : "for our member"}` +
    (sign ? ` (zodiac sign: ${sign})` : "") +
    `. Exactly 2 short paragraphs (2-3 sentences each), in ${language}:\n` +
    `- First: a personal, heartfelt greeting, the sense that this day and this ` +
    `person are truly special${sign ? ", with a warm nod to what makes their sign unique" : ""}.\n` +
    `- Second: a sincere wish for the new personal year, that the best lies ` +
    `ahead, on a starry note.\n` +
    `No product promotion, no mention of any gift, only the person and their ` +
    `day. Return JSON: { "p1": string, "p2": string }`;
  return { system, user };
}

/**
 * Two short, warm paragraphs from Gemini in the reader's language.
 * Personalized with the name and (when known) sun sign, which the caller
 * passes already in that language. Throws on failure, caller falls back.
 */
export async function generateBirthdayCopy(
  name: string | null,
  sunSign: string | null,
  locale: UserLocale = "ka",
): Promise<string[]> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY missing");

  const prompt =
    locale === "ka"
      ? georgianBirthdayPrompt(name, sunSign)
      : internationalBirthdayPrompt(name, sunSign, locale);
  const { system, user } = prompt;
  return requestBirthdayCopy(apiKey, system, user);
}

function georgianBirthdayPrompt(
  name: string | null,
  sunSignKa: string | null,
): { system: string; user: string } {
  const system =
    "შენ ხარ Vivida-ს (ქართული ასტროლოგიური პლატფორმის) გუნდის თბილი ხმა. " +
    "წერ გულწრფელ, ადამიანურ ქართულს, არა ოფიციალურს, არა გადამეტებულად " +
    'პათეტიკურს. კლიშეების გარეშე ("ბედნიერების ოკეანე"). ' +
    "მთავარი მიზანი: ადამიანმა უნდა იგრძნოს, რომ ის ნამდვილად მნიშვნელოვანია " +
    "და მისი დღე გულით აღინიშნება, არა შაბლონური მილოცვით.";
  const user =
    `დაწერე დაბადების დღის მისალოცი ${name ? `სახელად ${name}-სთვის` : "ჩვენი მომხმარებლისთვის"}` +
    (sunSignKa ? ` (ზოდიაქო: ${sunSignKa})` : "") +
    `. ზუსტად 2 მოკლე აბზაცი (თითო 2-3 წინადადება):\n` +
    `- პირველი: პირადი, გულით ნათქვამი მილოცვა, იმის განცდა, რომ ეს დღე და ეს ადამიანი ` +
    `ნამდვილად განსაკუთრებულია${sunSignKa ? `, მისი ნიშნის უნიკალური ბუნების თბილი ხსენებით (რითაც ის გამორჩეულია)` : ""}.\n` +
    `- მეორე: გულწრფელი სურვილი ახალი პირადი წლისთვის, რომ წინ საუკეთესო ელოდება, ვარსკვლავურ ნოტაზე.\n` +
    `არავითარი პროდუქტის რეკლამა, არავითარი საჩუქრის ხსენება, მხოლოდ ადამიანი და მისი დღე. ` +
    `დააბრუნე JSON: { "p1": string, "p2": string }`;
  return { system, user };
}

async function requestBirthdayCopy(
  apiKey: string,
  system: string,
  user: string,
): Promise<string[]> {
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
      reasoning: { effort: "low" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
      temperature: 0.9,
      // Reasoning model, leave headroom beyond the thinking budget.
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
    (p): p is string => typeof p === "string" && p.trim().length > 0,
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

/** Cron entrypoint, gift + email everyone whose birthday is today. */
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

      const subject = birthdaySubject(u.locale);
      // Claim the year's slot first, the guard row, so a concurrent cron
      // tick can't double-gift.
      const [claim] = await db
        .insert(emailSendLog)
        .values({
          userId: u.userId,
          kind: "birthday",
          email: u.email,
          subject,
          status: "pending",
        })
        .returning({ id: emailSendLog.id });

      const gifted = !u.isPremium && (await giftBirthdayCredits(u.userId));
      if (gifted) result.gifted++;

      if (!resend || !u.email) {
        // Gift applied (for non-PRO) but no way to email, mark so admin can see it.
        await db
          .update(emailSendLog)
          .set({
            status: "failed",
            error: resend ? "no email address" : "resend not configured",
          })
          .where(eq(emailSendLog.id, claim.id));
        result.failed++;
        continue;
      }

      const firstName = u.name?.split(" ")[0] ?? null;
      const signInfo =
        u.sunSignIndex == null ? null : signByIndex(u.sunSignIndex);
      const sunSign = signInfo
        ? u.locale === "pl"
          ? signInfo.labelPl
          : u.locale === "en"
            ? signInfo.labelEn
            : signInfo.labelKa
        : null;
      const origin = u.locale === "ka" ? ORIGIN : ENGLISH_SITE_URL;

      let paragraphs: string[];
      try {
        paragraphs = await generateBirthdayCopy(firstName, sunSign, u.locale);
      } catch (err) {
        console.warn(
          "[birthday] AI copy failed, using fallback:",
          (err as Error).message,
        );
        paragraphs = birthdayFallback(u.locale, gifted);
      }

      // Shares the 2 req/s Resend budget with the daily blast that runs
      // just before this in the same cron invocation.
      await acquireResendSlot();
      const send = await resend.emails.send(
        {
          from: FROM,
          to: u.email,
          subject,
          react: BirthdayEmail({
            name: firstName,
            paragraphs,
            dashboardUrl: `${origin.replace(/\/$/, "")}/dashboard`,
            showGift: gifted,
            credits: BIRTHDAY_CREDITS,
            locale: u.locale,
          }),
        },
        { idempotencyKey: `birthday:${u.userId}:${year}` },
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
        (err as Error).message,
      );
    }
  }
  return result;
}
