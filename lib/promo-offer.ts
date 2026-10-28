/**
 * The Halloween low-credit win-back offer: 1 month of unlimited PRO for ₾9.99.
 *
 * Who may see it is decided here and nowhere else. The audience is not a
 * property of the user (a "has_offer" column would have needed a migration and
 * a backfill) but of the campaign: whoever the campaign email addressed is
 * entitled to the price, which is exactly the row `email_campaign_recipient`
 * already stores. Both the /credits card and the checkout route call
 * `getLowCreditOffer`, so the price a buyer is charged can never disagree with
 * the price they were shown.
 */
import { and, eq, isNotNull } from "drizzle-orm";

import { db } from "@/db";
import { emailCampaignRecipients, emailCampaigns, users } from "@/db/schema";
import {
  HALLOWEEN_PROMO_MONTHS,
  HALLOWEEN_PROMO_PLAN,
  premiumPlanForCountry,
  type PremiumPlan,
} from "@/lib/billing-config";

export const LOW_CREDIT_OFFER_CAMPAIGN_SLUG = "halloween-low-credits-999-2026";

/** Balance at or below which the campaign addressed a user. */
export const LOW_CREDIT_OFFER_THRESHOLD = 3;

/**
 * Offer closes at the end of 2 November 2026 in Tbilisi (23:59:59 UTC+4 =
 * 19:59:59Z). The deadline is a constant rather than a column because it is
 * the same for everyone, and because a lapsed offer must stop selling on its
 * own, without anyone remembering to archive the Stripe price.
 */
export const LOW_CREDIT_OFFER_ENDS_AT = new Date("2026-11-02T19:59:59Z");

export type LowCreditOffer = {
  plan: PremiumPlan;
  months: number;
  endsAt: Date;
};

/**
 * The offer for this user, or null if they may not have it.
 *
 * Test recipients are deliberately included: `is_test` exists to keep preview
 * sends out of the campaign's conversion figures, not to deny the price to
 * someone the campaign addressed on purpose. It is also the only way to walk
 * the real purchase flow before the blast goes out.
 */
export async function getLowCreditOffer(
  userId: string,
): Promise<LowCreditOffer | null> {
  const now = Date.now();
  if (now > LOW_CREDIT_OFFER_ENDS_AT.getTime()) return null;

  const [row] = await db
    .select({
      countryCode: users.residenceCountryCode,
      interfaceLanguage: users.interfaceLanguage,
      isPremium: users.isPremium,
      premiumUntil: users.premiumUntil,
    })
    .from(emailCampaignRecipients)
    .innerJoin(
      emailCampaigns,
      eq(emailCampaigns.id, emailCampaignRecipients.campaignId),
    )
    .innerJoin(users, eq(users.id, emailCampaignRecipients.userId))
    .where(
      and(
        eq(emailCampaigns.slug, LOW_CREDIT_OFFER_CAMPAIGN_SLUG),
        eq(emailCampaignRecipients.userId, userId),
        // Sent, not merely addressed. A recipient row is written before the
        // send is attempted, and dispatch skips anyone who topped up in the
        // meantime, without this, those skipped users would be shown an offer
        // they were never told about.
        isNotNull(emailCampaignRecipients.sentAt),
      ),
    )
    .limit(1);

  if (!row) return null;
  // Priced in lari: allow users in the GEL catalogue market (GE or unlisted
  // countries that fall back to GE) as well as Georgian-interface users.
  const resolvedPlan = premiumPlanForCountry(row.countryCode);
  if (
    resolvedPlan.currency !== HALLOWEEN_PROMO_PLAN.currency &&
    row.interfaceLanguage !== "ka"
  ) {
    return null;
  }
  // Already paying, the same guard /api/subscription/checkout applies, so a
  // subscriber can't stack a second subscription on top of their current one.
  if (row.isPremium && row.premiumUntil && row.premiumUntil.getTime() > now) {
    return null;
  }

  return {
    plan: HALLOWEEN_PROMO_PLAN,
    months: HALLOWEEN_PROMO_MONTHS,
    endsAt: LOW_CREDIT_OFFER_ENDS_AT,
  };
}
