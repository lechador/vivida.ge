"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth-helpers";
import {
  createPartnerCore,
  softDeletePartnerCore,
  type CreatePartnerInput,
  type CreatePartnerResult,
} from "@/lib/partners-core";

// Read + AI logic lives in lib/partners-core so the mobile API
// (app/api/v1/partners/*) shares it. Re-export the pieces server components
// already import from here so their imports keep working.
export {
  partnerCreationsThisMonth,
  listPartners,
  getPartnerForViewer,
  ensureSynastryInterpretation,
} from "@/lib/partners-core";
export type { CreatePartnerInput, CreatePartnerResult } from "@/lib/partners-core";

/**
 * Validate + insert a synastry partner. Shared core does the validation,
 * monthly-cap enforcement, and chart computation; the action adds auth +
 * cache revalidation.
 */
export async function createPartner(
  input: CreatePartnerInput
): Promise<CreatePartnerResult> {
  const user = await requireUser();
  const result = await createPartnerCore(user.id, input);
  if (result.ok) revalidatePath("/synastry");
  return result;
}

/** Soft delete a partner (owner-only). */
export async function softDeletePartner(
  partnerId: string
): Promise<{ ok: boolean }> {
  const user = await requireUser();
  const result = await softDeletePartnerCore(user.id, partnerId);
  revalidatePath("/synastry");
  return result;
}
