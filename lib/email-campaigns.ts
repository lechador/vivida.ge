import { and, eq, isNotNull, isNull } from "drizzle-orm";

import { db } from "@/db";
import { emailCampaignRecipients, emailCampaigns, profiles } from "@/db/schema";
import { grantCredits } from "@/lib/credits";

/** Slug of the campaign the profile_incomplete re-nudge enrols recipients in. */
export const PROFILE_INCOMPLETE_CAMPAIGN_SLUG = "profile-incomplete-bonus-v1";
/** What the profile_incomplete email promises for adding a birth date. */
export const PROFILE_INCOMPLETE_REWARD_CREDITS = 50;

/**
 * Mark all campaigns addressed to this user as converted and pay each reward
 * once.
 *
 * Only rows that were actually sent can convert: a recipient inserted but not
 * yet mailed (e.g. the win-back claim inserted seconds before the Resend call)
 * must not be completed by an unrelated page view.
 *
 * Called from profile completion, the activity path (`recordVisit`) and the
 * purchase path. Win-back campaigns carry `reward_credits = 0`, so "conversion"
 * there means only the `completed_at` stamp; no credits are granted.
 */
export async function completeEligibleEmailCampaigns(
  userId: string,
): Promise<void> {
  const eligible = await db
    .select({
      campaignId: emailCampaignRecipients.campaignId,
      reward: emailCampaigns.rewardCredits,
      slug: emailCampaigns.slug,
    })
    .from(emailCampaignRecipients)
    .innerJoin(
      emailCampaigns,
      eq(emailCampaigns.id, emailCampaignRecipients.campaignId),
    )
    .where(
      and(
        eq(emailCampaignRecipients.userId, userId),
        eq(emailCampaignRecipients.isTest, false),
        isNull(emailCampaignRecipients.completedAt),
        isNotNull(emailCampaignRecipients.sentAt),
      ),
    );

  let hasBirthDate: boolean | null = null;
  for (const row of eligible) {
    // The profile_incomplete bonus is for adding a birth date, not for any
    // visit or purchase (those paths also call this function), so it only
    // converts once the profile actually has one.
    if (row.slug === PROFILE_INCOMPLETE_CAMPAIGN_SLUG) {
      if (hasBirthDate === null) {
        const [p] = await db
          .select({ dob: profiles.dateOfBirth })
          .from(profiles)
          .where(eq(profiles.userId, userId))
          .limit(1);
        hasBirthDate = !!p?.dob;
      }
      if (!hasBirthDate) continue;
    }
    const [claimed] = await db
      .update(emailCampaignRecipients)
      .set({ completedAt: new Date() })
      .where(
        and(
          eq(emailCampaignRecipients.campaignId, row.campaignId),
          eq(emailCampaignRecipients.userId, userId),
          isNull(emailCampaignRecipients.completedAt),
        ),
      )
      .returning({ campaignId: emailCampaignRecipients.campaignId });
    if (claimed && row.reward > 0) {
      await grantCredits(
        userId,
        row.reward,
        "campaign_reward",
        `email-campaign:${row.campaignId}`,
      );
      await db
        .update(emailCampaignRecipients)
        .set({ rewardedAt: new Date() })
        .where(
          and(
            eq(emailCampaignRecipients.campaignId, row.campaignId),
            eq(emailCampaignRecipients.userId, userId),
          ),
        );
    }
  }
}

/**
 * Enrol a user who was just mailed the profile_incomplete nudge in the
 * birth-details bonus campaign, so the promised credits are paid (once, via
 * `completeEligibleEmailCampaigns`) when they add a birth date. Idempotent:
 * the second nudge and reruns are no-ops, and a completed row is never reset.
 */
export async function enrolProfileIncompleteRecipient(
  userId: string,
  email: string,
): Promise<void> {
  const fields = {
    name: "Profile incomplete: birth-details bonus",
    template: "profile_incomplete",
    subject: "Complete your profile",
    rewardCredits: PROFILE_INCOMPLETE_REWARD_CREDITS,
    status: "active",
  };
  const [campaign] = await db
    .insert(emailCampaigns)
    .values({
      slug: PROFILE_INCOMPLETE_CAMPAIGN_SLUG,
      ...fields,
      launchedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: emailCampaigns.slug,
      set: fields,
    })
    .returning({ id: emailCampaigns.id });
  if (!campaign) return;
  await db
    .insert(emailCampaignRecipients)
    .values({
      campaignId: campaign.id,
      userId,
      email,
      status: "sent",
      sentAt: new Date(),
    })
    .onConflictDoNothing();
}
