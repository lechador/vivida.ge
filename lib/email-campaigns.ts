import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import { emailCampaignRecipients, emailCampaigns } from "@/db/schema";
import { grantCredits } from "@/lib/credits";

/** Mark all campaigns addressed to this user as converted and pay each reward once. */
export async function completeEligibleEmailCampaigns(userId: string): Promise<void> {
  const eligible = await db
    .select({ campaignId: emailCampaignRecipients.campaignId, reward: emailCampaigns.rewardCredits })
    .from(emailCampaignRecipients)
    .innerJoin(emailCampaigns, eq(emailCampaigns.id, emailCampaignRecipients.campaignId))
    .where(and(
      eq(emailCampaignRecipients.userId, userId),
      eq(emailCampaignRecipients.isTest, false),
      isNull(emailCampaignRecipients.completedAt)
    ));

  for (const row of eligible) {
    const [claimed] = await db
      .update(emailCampaignRecipients)
      .set({ completedAt: new Date() })
      .where(
        and(
          eq(emailCampaignRecipients.campaignId, row.campaignId),
          eq(emailCampaignRecipients.userId, userId),
          isNull(emailCampaignRecipients.completedAt)
        )
      )
      .returning({ campaignId: emailCampaignRecipients.campaignId });
    if (claimed && row.reward > 0) {
      await grantCredits(userId, row.reward, "campaign_reward", `email-campaign:${row.campaignId}`);
      await db.update(emailCampaignRecipients).set({ rewardedAt: new Date() }).where(and(
        eq(emailCampaignRecipients.campaignId, row.campaignId),
        eq(emailCampaignRecipients.userId, userId)
      ));
    }
  }
}
