/**
 * Targeted token-growth campaign for the 368 prospects ranked on 2026-08-28.
 *
 * Safe by default: without --execute this only builds a live preflight report.
 *
 * Usage:
 *   npx tsx scripts/launch-token-growth-campaign.tsx
 *   npx tsx scripts/launch-token-growth-campaign.tsx --execute --channel=in-app
 *   npx tsx scripts/launch-token-growth-campaign.tsx --execute --channel=email
 *   npx tsx scripts/launch-token-growth-campaign.tsx --execute --channel=all
 *
 * Every delivery is idempotent through reminder_delivery. Email recipients are
 * re-checked immediately before dispatch. Current PRO users, newly converted
 * buyers, restricted/under-age accounts, and deleted candidates are suppressed
 * from both channels. Marketing opt-outs are suppressed from email only.
 */

import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { render } from "@react-email/render";
import { Resend } from "resend";
import { and, eq, inArray, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  creditAccounts,
  creditTransactions,
  emailCampaignRecipients,
  emailCampaigns,
  emailSendLog,
  notifications,
  profiles,
  reminderDeliveries,
  users,
} from "@/db/schema";
import {
  LOW_CREDIT_PROMO_MONTHS,
  LOW_CREDIT_PROMO_PLAN,
  formatBillingAmount,
  creditPacksForCountry,
  premiumPlanForCountry,
} from "@/lib/billing-config";
import { MarketingEmail } from "@/lib/email-templates/marketing";
import { LowCreditOfferEmail } from "@/lib/email-templates/low-credit-offer";
import { normalizeUserLocale, type UserLocale } from "@/lib/i18n/user-locale";
import { LOW_CREDIT_OFFER_CAMPAIGN_SLUG } from "@/lib/promo-offer";
import { acquireResendSlot } from "@/lib/resend-throttle";
import { getOrCreateUnsubscribeToken } from "@/lib/unsubscribe";

const CAMPAIGN_KEY = "token_growth_2026_08_28";
const EXPECTED_CANDIDATES = 368;
const ORIGIN = (process.env.EMAIL_ORIGIN ?? "https://vivida.ge").replace(
  /\/$/,
  "",
);
const FROM = (() => {
  const configured = process.env.RESEND_FROM;
  if (!configured) return "Vivida <hello@vivida.ge>";
  return configured.includes("<") ? configured : `Vivida <${configured}>`;
})();

const analysisRoot = resolve(
  process.cwd(),
  "../analysis/token-growth-2026-08-28",
);
const candidatePath = resolve(
  analysisRoot,
  "output/05-potential-buyers-ranked.csv",
);
const reportPath = resolve(analysisRoot, "campaign-live-preflight.json");
const assignmentPath = resolve(analysisRoot, "campaign-live-assignments.csv");

type Channel = "all" | "email" | "in-app";
type Segment =
  | "HOT — depleted and returned"
  | "HOT — active low balance"
  | "WARM — strong paid-feature use"
  | "WARM — light feature intent";
type Offer =
  | "existing_pro_deadline"
  | "pro_3mo_29"
  | "standard_pro"
  | "refill_75"
  | "starter_30";

type Candidate = {
  user_id: string;
  name: string;
  email: string;
  country: string;
  locale: string;
  balance: string;
  credits_spent_lifetime: string;
  distinct_paid_features: string;
  best_feature: string;
  low_credit_offer_sent: string;
  segment: Segment;
  propensity_score: string;
};

type LiveUser = {
  id: string;
  name: string | null;
  email: string | null;
  emailVerified: Date | null;
  emailMarketing: boolean;
  locale: string;
  country: string | null;
  restricted: boolean;
  dateOfBirth: string | null;
  isPremium: boolean;
  premiumUntil: Date | null;
  balance: number;
  purchaseCount: number;
  lowCreditOfferSent: boolean;
};

type Assignment = {
  candidate: Candidate;
  live: LiveUser | null;
  offer: Offer;
  baseEligible: boolean;
  inAppPlanned: boolean;
  emailPlanned: boolean;
  suppressionReasons: string[];
};

async function withRetry<T>(
  label: string,
  work: () => Promise<T>,
  attempts = 5,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await work();
    } catch (error) {
      lastError = error;
      if (attempt === attempts) break;
      const delayMs = 500 * 2 ** (attempt - 1);
      console.warn(
        `[campaign] ${label} failed (attempt ${attempt}/${attempts}); retrying in ${delayMs}ms`,
      );
      await new Promise((resolveDelay) => setTimeout(resolveDelay, delayMs));
    }
  }
  throw lastError;
}

function bool(value: string): boolean {
  return value.trim().toLowerCase() === "true";
}

function parseCsv(input: string): Candidate[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    if (quoted) {
      if (char === '"' && input[i + 1] === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  if (field || row.length) {
    row.push(field.replace(/\r$/, ""));
    rows.push(row);
  }
  const [header, ...body] = rows.filter((r) => r.some((cell) => cell.length));
  if (!header) return [];
  return body.map((values) =>
    Object.fromEntries(header.map((key, index) => [key, values[index] ?? ""])),
  ) as Candidate[];
}

function csvCell(value: unknown): string {
  const text = String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function ageOn(dateOfBirth: string | null, now = new Date()): number | null {
  if (!dateOfBirth) return null;
  const [year, month, day] = dateOfBirth.split("-").map(Number);
  if (!year || !month || !day) return null;
  let age = now.getUTCFullYear() - year;
  const beforeBirthday =
    now.getUTCMonth() + 1 < month ||
    (now.getUTCMonth() + 1 === month && now.getUTCDate() < day);
  if (beforeBirthday) age -= 1;
  return age;
}

function isCurrentPremium(live: LiveUser): boolean {
  return Boolean(
    live.isPremium &&
    live.premiumUntil &&
    live.premiumUntil.getTime() > Date.now(),
  );
}

function chooseOffer(candidate: Candidate, live: LiveUser | null): Offer {
  if (live?.lowCreditOfferSent || bool(candidate.low_credit_offer_sent))
    return "existing_pro_deadline";
  if (
    candidate.segment === "HOT — depleted and returned" &&
    (live?.country ?? candidate.country) === "GE" &&
    (live?.balance ?? Number(candidate.balance)) <= 4
  )
    return "pro_3mo_29";
  if (candidate.segment === "WARM — strong paid-feature use") {
    const spend = Number(candidate.credits_spent_lifetime);
    const features = Number(candidate.distinct_paid_features);
    if (spend >= 20 || features >= 3 || candidate.best_feature === "AI ჩატი")
      return "standard_pro";
    return "refill_75";
  }
  return "starter_30";
}

function evaluate(candidate: Candidate, live: LiveUser | null): Assignment {
  const suppressionReasons: string[] = [];
  if (!live) suppressionReasons.push("candidate_not_found");
  if (live && isCurrentPremium(live)) suppressionReasons.push("current_pro");
  if (live?.restricted) suppressionReasons.push("restricted");
  const age = live ? ageOn(live.dateOfBirth) : null;
  if (age !== null && age < 18) suppressionReasons.push("under_18");
  if (live && live.purchaseCount > 0)
    suppressionReasons.push("converted_to_buyer");
  const baseEligible = suppressionReasons.length === 0;
  const offer = chooseOffer(candidate, live);
  const highIntent = candidate.segment !== "WARM — light feature intent";
  const duplicateOfferEmail = Boolean(
    live?.lowCreditOfferSent || bool(candidate.low_credit_offer_sent),
  );
  const emailPlanned = Boolean(
    baseEligible &&
    highIntent &&
    !duplicateOfferEmail &&
    live?.email &&
    live.emailMarketing &&
    live.emailVerified,
  );
  if (baseEligible && highIntent && !emailPlanned) {
    if (duplicateOfferEmail)
      suppressionReasons.push("email_existing_offer_recipient");
    if (!live?.emailMarketing)
      suppressionReasons.push("email_marketing_opt_out");
    if (!live?.emailVerified) suppressionReasons.push("email_unverified");
    if (!live?.email) suppressionReasons.push("email_missing");
  }
  if (baseEligible && !highIntent)
    suppressionReasons.push("email_in_app_only_light_intent");
  return {
    candidate,
    live,
    offer,
    baseEligible,
    inAppPlanned: baseEligible,
    emailPlanned,
    suppressionReasons,
  };
}

const FEATURE: Record<string, Record<UserLocale, string>> = {
  ტარო: { ka: "ტარო", en: "tarot" },
  "PDF რუკა": { ka: "PDF რუკა", en: "PDF reports" },
  "7-დღიანი პროგნოზი": { ka: "7-დღიანი პროგნოზი", en: "7-day forecasts" },
  თავსებადობა: { ka: "თავსებადობა", en: "compatibility readings" },
  "AI ჩატი": { ka: "AI ჩატი", en: "AI chat" },
  MBTI: { ka: "MBTI", en: "MBTI" },
  "Big Five": { ka: "Big Five", en: "Big Five" },
  "აუდიო ჰოროსკოპი": { ka: "აუდიო ჰოროსკოპი", en: "audio horoscope" },
  "IQ ტესტი": { ka: "IQ ტესტი", en: "IQ test" },
  "EQ ტესტი": { ka: "EQ ტესტი", en: "EQ test" },
};

function featureLabel(candidate: Candidate, locale: UserLocale): string {
  return FEATURE[candidate.best_feature]?.[locale] ?? candidate.best_feature;
}

function offerDestination(offer: Offer): string {
  const params = new URLSearchParams({
    utm_source: "vivida",
    utm_medium: "lifecycle",
    utm_campaign: CAMPAIGN_KEY,
    utm_content: offer,
  });
  if (offer === "starter_30" || offer === "refill_75")
    return `/credits?${params}#credit-packs`;
  if (offer === "standard_pro") return `/credits?${params}#pro-plan`;
  return `/credits?${params}`;
}

function offerPrice(live: LiveUser, offer: Offer, locale: UserLocale): string {
  if (offer === "pro_3mo_29" || offer === "existing_pro_deadline") {
    return formatBillingAmount(
      LOW_CREDIT_PROMO_PLAN.amountMinor,
      LOW_CREDIT_PROMO_PLAN.currency,
      locale,
    );
  }
  if (offer === "standard_pro") {
    const plan = premiumPlanForCountry(live.country);
    return formatBillingAmount(plan.amountMinor, plan.currency, locale);
  }
  const packId = offer === "refill_75" ? "m" : "s";
  const pack = creditPacksForCountry(live.country).find(
    (item) => item.id === packId,
  )!;
  return formatBillingAmount(pack.amountMinor, pack.currency, locale);
}

function copyFor(assignment: Assignment): {
  subject: string;
  title: string;
  body: string;
  emailBody: string;
  cta: string;
} {
  const live = assignment.live!;
  const locale = normalizeUserLocale(live.locale);
  const feature = featureLabel(assignment.candidate, locale);
  const price = offerPrice(live, assignment.offer, locale);
  if (locale === "en") {
    if (
      assignment.offer === "existing_pro_deadline" ||
      assignment.offer === "pro_3mo_29"
    )
      return {
        subject: `3 months of unlimited Vivida for ${price}`,
        title:
          assignment.offer === "existing_pro_deadline"
            ? "Your PRO offer is still active"
            : "Your credits ran out, but Vivida can keep going",
        body: `Get 3 months of unlimited Vivida for ${price}. Available through 1 September.`,
        emailBody: `Your credits are nearly gone. Open every feature for three full months — without credits or limits.\n\nThis offer is available through 1 September.`,
        cta: "Activate the offer",
      };
    if (assignment.offer === "standard_pro")
      return {
        subject: `Unlock ${feature} and all of Vivida without limits`,
        title: "Open Vivida without limits",
        body: `With PRO, ${feature} and every other feature are unlimited for ${price}/month.`,
        emailBody: `You are one of the people getting real value from ${feature}. With Vivida PRO, it and every other feature stay open without credits or limits.\n\nPRO is ${price} per month.`,
        cta: "Unlock PRO",
      };
    const credits = assignment.offer === "refill_75" ? 75 : 30;
    return {
      subject: `${credits} credits to keep using ${feature}`,
      title: `Keep using ${feature} without interruption`,
      body: `${credits} credits are available for ${price}. Continue right where you left off.`,
      emailBody: `Your activity shows that ${feature} matters to you. With ${credits} credits, you can continue right where you left off.\n\nPrice: ${price}.`,
      cta: "Top up credits",
    };
  }
  if (
    assignment.offer === "existing_pro_deadline" ||
    assignment.offer === "pro_3mo_29"
  )
    return {
      subject: `3 თვე ულიმიტო Vivida — ${price}`,
      title:
        assignment.offer === "existing_pro_deadline"
          ? "შენი PRO შეთავაზება ისევ აქტიურია"
          : "კრედიტები დასრულდა, Vivida კი შეგიძლია გააგრძელო",
      body: `3 თვე ულიმიტო Vivida ${price}-ად — შეთავაზება ძალაშია 1 სექტემბრის ჩათვლით.`,
      emailBody: `შენი კრედიტები თითქმის დასრულებულია. გახსენი ყველა ფუნქცია 3 სრული თვით — კრედიტებისა და ლიმიტების გარეშე.\n\nშეთავაზება ძალაშია 1 სექტემბრის ჩათვლით.`,
      cta: "გაააქტიურე შეთავაზება",
    };
  if (assignment.offer === "standard_pro")
    return {
      subject: `გახსენი ${feature} და მთელი Vivida ლიმიტების გარეშე`,
      title: "გახსენი Vivida ულიმიტოდ",
      body: `PRO-ით ${feature} და ყველა სხვა ფუნქცია ულიმიტოა — ${price} თვეში.`,
      emailBody: `შენი აქტივობიდან ჩანს, რომ ${feature} შენთვის რეალურ ღირებულებას ქმნის. Vivida PRO-ით ის და ყველა სხვა ფუნქცია კრედიტებისა და ლიმიტების გარეშე გაიხსნება.\n\nPRO-ის ფასი არის ${price} თვეში.`,
      cta: "გახსენი PRO",
    };
  const credits = assignment.offer === "refill_75" ? 75 : 30;
  return {
    subject: `${credits} კრედიტი — გააგრძელე ${feature}`,
    title: `გააგრძელე ${feature} შეფერხების გარეშე`,
    body: `${credits} კრედიტი ხელმისაწვდომია ${price}-ად — გააგრძელე იქიდან, სადაც გაჩერდი.`,
    emailBody: `შენი აქტივობიდან ჩანს, რომ ${feature} გაინტერესებს. ${credits} კრედიტით შეგიძლია გააგრძელო ზუსტად იქიდან, სადაც გაჩერდი.\n\nფასი: ${price}.`,
    cta: "შეავსე კრედიტები",
  };
}

async function loadLiveUsers(
  candidateIds: string[],
): Promise<Map<string, LiveUser>> {
  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      emailVerified: users.emailVerified,
      emailMarketing: users.emailMarketing,
      locale: users.interfaceLanguage,
      country: users.residenceCountryCode,
      restricted: users.restricted,
      dateOfBirth: profiles.dateOfBirth,
      isPremium: users.isPremium,
      premiumUntil: users.premiumUntil,
      balance: sql<number>`coalesce(${creditAccounts.balance}, 0)`,
      purchaseCount: sql<number>`(
        select count(*)::int from ${creditTransactions} ct
        where ct.user_id = ${users.id} and ct.reason = 'purchase' and ct.amount > 0
      )`,
      lowCreditOfferSent: sql<boolean>`exists(
        select 1
        from ${emailCampaignRecipients} ecr
        join ${emailCampaigns} ec on ec.id = ecr.campaign_id
        where ecr.user_id = ${users.id}
          and ec.slug = ${LOW_CREDIT_OFFER_CAMPAIGN_SLUG}
          and ecr.sent_at is not null
      )`,
    })
    .from(users)
    .leftJoin(profiles, eq(profiles.userId, users.id))
    .leftJoin(creditAccounts, eq(creditAccounts.userId, users.id))
    .where(inArray(users.id, candidateIds));
  return new Map(
    rows.map((row) => [
      row.id,
      {
        ...row,
        balance: Number(row.balance),
        purchaseCount: Number(row.purchaseCount),
        lowCreditOfferSent: Boolean(row.lowCreditOfferSent),
      },
    ]),
  );
}

async function reloadLiveUser(userId: string): Promise<LiveUser | null> {
  const usersById = await withRetry(`live eligibility ${userId}`, () =>
    loadLiveUsers([userId]),
  );
  return usersById.get(userId) ?? null;
}

async function claimDelivery(
  assignment: Assignment,
  channel: "email" | "in_app",
): Promise<{ id: string; existing: boolean } | null> {
  const deliveryKey = `${assignment.offer}:v1`;
  const destination = offerDestination(assignment.offer);
  const [inserted] = await withRetry(
    `claim ${channel} ${assignment.candidate.user_id}`,
    () =>
      db
        .insert(reminderDeliveries)
        .values({
          userId: assignment.candidate.user_id,
          topic: CAMPAIGN_KEY,
          channel,
          deliveryKey,
          destination,
        })
        .onConflictDoNothing()
        .returning({ id: reminderDeliveries.id }),
  );
  if (inserted) return { id: inserted.id, existing: false };
  const [existing] = await withRetry(
    `read claim ${channel} ${assignment.candidate.user_id}`,
    () =>
      db
        .select({
          id: reminderDeliveries.id,
          status: reminderDeliveries.status,
        })
        .from(reminderDeliveries)
        .where(
          and(
            eq(reminderDeliveries.userId, assignment.candidate.user_id),
            eq(reminderDeliveries.topic, CAMPAIGN_KEY),
            eq(reminderDeliveries.channel, channel),
            eq(reminderDeliveries.deliveryKey, deliveryKey),
          ),
        )
        .limit(1),
  );
  if (!existing || existing.status === "sent") return null;
  await withRetry(`reclaim ${channel} ${assignment.candidate.user_id}`, () =>
    db
      .update(reminderDeliveries)
      .set({ status: "claimed", failedAt: null })
      .where(eq(reminderDeliveries.id, existing.id)),
  );
  return { id: existing.id, existing: true };
}

async function markDelivery(id: string, sent: boolean): Promise<void> {
  await withRetry(`mark delivery ${id}`, () =>
    db
      .update(reminderDeliveries)
      .set(
        sent
          ? { status: "sent", sentAt: new Date(), failedAt: null }
          : { status: "failed", failedAt: new Date() },
      )
      .where(eq(reminderDeliveries.id, id)),
  );
}

async function sendInApp(
  assignment: Assignment,
): Promise<"sent" | "skipped" | "failed"> {
  const live = await reloadLiveUser(assignment.candidate.user_id);
  const refreshed = evaluate(assignment.candidate, live);
  if (!refreshed.inAppPlanned) return "skipped";
  const claimed = await claimDelivery(refreshed, "in_app");
  if (!claimed) return "skipped";
  const copy = copyFor(refreshed);
  const reminderUrl = `/reminders/${encodeURIComponent(claimed.id)}`;
  try {
    const [alreadyInserted] = await withRetry(
      `read in-app ${refreshed.candidate.user_id}`,
      () =>
        db
          .select({ id: notifications.id })
          .from(notifications)
          .where(
            and(
              eq(notifications.userId, refreshed.candidate.user_id),
              sql`${notifications.payload}->>'reminderUrl' = ${reminderUrl}`,
            ),
          )
          .limit(1),
    );
    if (!alreadyInserted) {
      await withRetry(`insert in-app ${refreshed.candidate.user_id}`, () =>
        db.insert(notifications).values({
          userId: refreshed.candidate.user_id,
          kind: "timing_reminder",
          payload: {
            reminderTitle: copy.title,
            reminderBody: copy.body,
            reminderUrl,
          },
        }),
      );
    }
    await markDelivery(claimed.id, true);
    return "sent";
  } catch (error) {
    await markDelivery(claimed.id, false);
    console.error(
      `[campaign] in-app failed for ${refreshed.candidate.user_id}:`,
      error,
    );
    return "failed";
  }
}

async function ensurePromoCampaign(): Promise<string> {
  const subject = `${LOW_CREDIT_PROMO_MONTHS} თვე ულიმიტო Vivida — მხოლოდ ₾29`;
  const [campaign] = await db
    .insert(emailCampaigns)
    .values({
      slug: LOW_CREDIT_OFFER_CAMPAIGN_SLUG,
      name: "Low credits · 3 months PRO for ₾29",
      template: "low_credit_offer",
      subject,
      rewardCredits: 0,
      status: "launched",
      launchedAt: new Date(),
      ctaLabel: "გაააქტიურე შეთავაზება",
      ctaUrl: "/credits",
    })
    .onConflictDoUpdate({
      target: emailCampaigns.slug,
      set: { subject, status: "launched", launchedAt: new Date() },
    })
    .returning({ id: emailCampaigns.id });
  return campaign.id;
}

async function logEmail(input: {
  userId: string;
  email: string;
  kind: string;
  subject: string;
  error?: string;
}): Promise<void> {
  await db.insert(emailSendLog).values({
    userId: input.userId,
    kind: input.kind,
    email: input.email,
    subject: input.subject,
    status: input.error ? "failed" : "sent",
    error: input.error ?? null,
  });
}

async function sendEmail(
  assignment: Assignment,
  resend: Resend,
): Promise<"sent" | "skipped" | "failed"> {
  const live = await reloadLiveUser(assignment.candidate.user_id);
  const refreshed = evaluate(assignment.candidate, live);
  if (!refreshed.emailPlanned || !live?.email) return "skipped";
  const claimed = await claimDelivery(refreshed, "email");
  if (!claimed) return "skipped";
  const locale = normalizeUserLocale(live.locale);
  const copy = copyFor(refreshed);
  const token = await getOrCreateUnsubscribeToken(live.id);
  const unsubscribeUrl = `${ORIGIN}/unsubscribe?token=${encodeURIComponent(token)}&type=marketing`;
  const ctaUrl = `${ORIGIN}/reminders/${encodeURIComponent(claimed.id)}`;
  const name = live.name?.split(" ")[0] ?? null;
  let promoCampaignId: string | null = null;
  try {
    if (refreshed.offer === "pro_3mo_29") {
      promoCampaignId = await ensurePromoCampaign();
      await db
        .insert(emailCampaignRecipients)
        .values({
          campaignId: promoCampaignId,
          userId: live.id,
          email: live.email,
        })
        .onConflictDoUpdate({
          target: [
            emailCampaignRecipients.campaignId,
            emailCampaignRecipients.userId,
          ],
          set: { email: live.email, status: "pending", error: null },
        });
    }
    const html =
      refreshed.offer === "pro_3mo_29"
        ? await render(
            <LowCreditOfferEmail
              name={name}
              balance={live.balance}
              priceLabel={formatBillingAmount(
                LOW_CREDIT_PROMO_PLAN.amountMinor,
                LOW_CREDIT_PROMO_PLAN.currency,
                locale,
              )}
              months={LOW_CREDIT_PROMO_MONTHS}
              deadlineLabel={locale === "ka" ? "1 სექტემბრის" : "1 September"}
              creditsUrl={ctaUrl}
              unsubscribeUrl={unsubscribeUrl}
              locale={locale}
            />,
          )
        : await render(
            <MarketingEmail
              name={name}
              heading={copy.subject}
              body={copy.emailBody}
              ctaLabel={copy.cta}
              ctaUrl={ctaUrl}
              unsubscribeUrl={unsubscribeUrl}
              locale={locale}
            />,
          );
    await acquireResendSlot();
    const result = await resend.emails.send(
      {
        from: FROM,
        to: live.email,
        subject: copy.subject,
        html,
        headers: {
          "List-Unsubscribe": `<${unsubscribeUrl}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
      },
      { idempotencyKey: `${CAMPAIGN_KEY}:${refreshed.offer}:${live.id}` },
    );
    if (result.error) throw new Error(result.error.message ?? "send failed");
    if (promoCampaignId) {
      await db
        .update(emailCampaignRecipients)
        .set({ status: "sent", sentAt: new Date(), error: null })
        .where(
          and(
            eq(emailCampaignRecipients.campaignId, promoCampaignId),
            eq(emailCampaignRecipients.userId, live.id),
          ),
        );
    }
    await logEmail({
      userId: live.id,
      email: live.email,
      kind: refreshed.offer === "pro_3mo_29" ? "low_credit_offer" : "marketing",
      subject: copy.subject,
    });
    await markDelivery(claimed.id, true);
    return "sent";
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (promoCampaignId) {
      await db
        .update(emailCampaignRecipients)
        .set({ status: "failed", sentAt: null, error: message })
        .where(
          and(
            eq(emailCampaignRecipients.campaignId, promoCampaignId),
            eq(emailCampaignRecipients.userId, live.id),
          ),
        );
    }
    await logEmail({
      userId: live.id,
      email: live.email,
      kind: "marketing",
      subject: copy.subject,
      error: message,
    }).catch(() => undefined);
    await markDelivery(claimed.id, false);
    console.error(`[campaign] email failed for ${live.id}: ${message}`);
    return "failed";
  }
}

function countBy<T>(
  items: T[],
  key: (item: T) => string,
): Record<string, number> {
  return items.reduce<Record<string, number>>((counts, item) => {
    const value = key(item);
    counts[value] = (counts[value] ?? 0) + 1;
    return counts;
  }, {});
}

async function main(): Promise<void> {
  const execute = process.argv.includes("--execute");
  const channelArg = process.argv.find((arg) => arg.startsWith("--channel="));
  const channel = (channelArg?.split("=")[1] ?? "all") as Channel;
  if (!(["all", "email", "in-app"] as string[]).includes(channel))
    throw new Error(`Invalid channel: ${channel}`);
  const candidates = parseCsv(await readFile(candidatePath, "utf8"));
  if (candidates.length !== EXPECTED_CANDIDATES) {
    throw new Error(
      `Candidate guard failed: expected ${EXPECTED_CANDIDATES}, found ${candidates.length}`,
    );
  }
  if (
    new Set(candidates.map((row) => row.user_id)).size !== EXPECTED_CANDIDATES
  ) {
    throw new Error("Candidate guard failed: duplicate user IDs found");
  }
  const liveById = await loadLiveUsers(candidates.map((row) => row.user_id));
  const assignments = candidates.map((candidate) =>
    evaluate(candidate, liveById.get(candidate.user_id) ?? null),
  );
  const livePremium = assignments.filter((item) =>
    item.suppressionReasons.includes("current_pro"),
  ).length;
  const report = {
    campaign: CAMPAIGN_KEY,
    generatedAt: new Date().toISOString(),
    execute,
    channel,
    sourceCandidates: candidates.length,
    liveUsersFound: liveById.size,
    liveCurrentProSuppressed: livePremium,
    baseEligible: assignments.filter((item) => item.baseEligible).length,
    inAppPlanned: assignments.filter((item) => item.inAppPlanned).length,
    emailPlanned: assignments.filter((item) => item.emailPlanned).length,
    offerCounts: countBy(
      assignments.filter((item) => item.baseEligible),
      (item) => item.offer,
    ),
    emailOfferCounts: countBy(
      assignments.filter((item) => item.emailPlanned),
      (item) => item.offer,
    ),
    segmentCounts: countBy(
      assignments.filter((item) => item.baseEligible),
      (item) => item.candidate.segment,
    ),
    suppressionCounts: countBy(
      assignments.flatMap((item) =>
        item.suppressionReasons.map((reason) => ({ reason })),
      ),
      (item) => item.reason,
    ),
  };
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  const assignmentHeader = [
    "user_id",
    "name",
    "email",
    "segment",
    "propensity_score",
    "best_feature",
    "live_country",
    "live_locale",
    "live_balance",
    "offer",
    "email_planned",
    "in_app_planned",
    "suppression_reasons",
  ];
  const assignmentRows = assignments.map((item) => [
    item.candidate.user_id,
    item.live?.name ?? item.candidate.name,
    item.live?.email ?? item.candidate.email,
    item.candidate.segment,
    item.candidate.propensity_score,
    item.candidate.best_feature,
    item.live?.country ?? "",
    item.live?.locale ?? "",
    item.live?.balance ?? "",
    item.offer,
    item.emailPlanned,
    item.inAppPlanned,
    item.suppressionReasons.join("; "),
  ]);
  await writeFile(
    assignmentPath,
    `${[assignmentHeader, ...assignmentRows].map((row) => row.map(csvCell).join(",")).join("\n")}\n`,
    "utf8",
  );
  console.log(JSON.stringify(report, null, 2));
  if (!execute) return;

  const results = {
    inApp: { sent: 0, skipped: 0, failed: 0 },
    email: { sent: 0, skipped: 0, failed: 0 },
  };
  if (channel === "all" || channel === "in-app") {
    const planned = assignments.filter((item) => item.inAppPlanned);
    for (const [index, assignment] of planned.entries()) {
      let outcome: "sent" | "skipped" | "failed" = "failed";
      try {
        outcome = await sendInApp(assignment);
      } catch (error) {
        console.error(
          `[campaign] in-app exhausted retries for ${assignment.candidate.user_id}:`,
          error,
        );
      }
      results.inApp[outcome] += 1;
      if ((index + 1) % 25 === 0 || index + 1 === planned.length) {
        console.log(
          `[campaign] in-app progress ${index + 1}/${planned.length}`,
        );
      }
    }
  }
  if (channel === "all" || channel === "email") {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error("RESEND_API_KEY is required for email execution");
    const resend = new Resend(key);
    const planned = assignments.filter((item) => item.emailPlanned);
    for (const [index, assignment] of planned.entries()) {
      let outcome: "sent" | "skipped" | "failed" = "failed";
      try {
        outcome = await sendEmail(assignment, resend);
      } catch (error) {
        console.error(
          `[campaign] email exhausted retries for ${assignment.candidate.user_id}:`,
          error,
        );
      }
      results.email[outcome] += 1;
      if ((index + 1) % 10 === 0 || index + 1 === planned.length) {
        console.log(`[campaign] email progress ${index + 1}/${planned.length}`);
      }
    }
  }
  const finalReport = {
    ...report,
    completedAt: new Date().toISOString(),
    results,
  };
  await writeFile(
    reportPath,
    `${JSON.stringify(finalReport, null, 2)}\n`,
    "utf8",
  );
  console.log(JSON.stringify({ campaign: CAMPAIGN_KEY, results }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
