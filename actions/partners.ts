"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth-helpers";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import {
  createPartnerCore,
  softDeletePartnerCore,
  type CreatePartnerInput,
  type CreatePartnerResult,
} from "@/lib/partners-core";

// Read + AI logic lives in lib/partners-core so the mobile API
// (app/api/v1/partners/*) shares it. A "use server" file may only export
// async functions, so the read helpers (partnerCreationsThisMonth,
// listPartners, getPartnerForViewer, ensureSynastryInterpretation) are
// imported straight from "@/lib/partners-core" by the pages that need them —
// not re-exported here. Type-only re-exports are still fine.
export type {
  CreatePartnerInput,
  CreatePartnerResult,
} from "@/lib/partners-core";

/**
 * Validate + insert a synastry partner. Shared core does the validation,
 * monthly-cap enforcement, and chart computation; the action adds auth +
 * cache revalidation.
 */
export async function createPartner(
  input: CreatePartnerInput,
): Promise<CreatePartnerResult> {
  const user = await requireUser();
  const locale = await getRequestLocale();
  const result = await createPartnerCore(user.id, input, locale);
  if (result.ok) revalidatePath("/synastry");
  return result;
}

/** Soft delete a partner (owner-only). */
export async function softDeletePartner(
  partnerId: string,
): Promise<{ ok: boolean }> {
  const user = await requireUser();
  const result = await softDeletePartnerCore(user.id, partnerId);
  revalidatePath("/synastry");
  return result;
}
