"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth-helpers";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import {
  acceptRelationshipInviteCore,
  createRelationshipInviteCore,
  saveRelationshipAnswerCore,
  setRelationshipSubscriptionCore,
  type RelationshipSubscription,
} from "@/lib/relationship-core";

export async function createRelationshipInvite(partnerId: string) {
  const user = await requireUser();
  const result = await createRelationshipInviteCore(user.id, partnerId);
  if (result.ok) revalidatePath(`/synastry/${partnerId}`);
  return result;
}

export async function acceptRelationshipInvite(token: string) {
  const user = await requireUser(`/relationship/invite/${token}`);
  const result = await acceptRelationshipInviteCore(user.id, token);
  if (result.ok) {
    revalidatePath("/synastry");
    revalidatePath(`/synastry/${result.partnerId}`);
  }
  return result;
}

export async function updateRelationshipSubscription(
  partnerId: string,
  values: RelationshipSubscription,
) {
  const user = await requireUser();
  const result = await setRelationshipSubscriptionCore(partnerId, user.id, {
    weeklyEnabled: Boolean(values.weeklyEnabled),
    transitEnabled: Boolean(values.transitEnabled),
  });
  if (result.ok) revalidatePath(`/synastry/${partnerId}`);
  return result;
}

export async function saveRelationshipAnswer(
  partnerId: string,
  weekStart: string,
  questionKey: string,
  answer: string,
) {
  const user = await requireUser();
  const locale = await getRequestLocale();
  const result = await saveRelationshipAnswerCore(
    partnerId,
    user.id,
    weekStart,
    questionKey,
    answer,
    locale,
  );
  if (result.ok) revalidatePath(`/synastry/${partnerId}`);
  return result;
}
