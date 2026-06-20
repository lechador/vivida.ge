"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth-helpers";
import { blockUserCore, unblockUserCore } from "@/lib/block-core";
import { createReportCore, type ReportInput } from "@/lib/report-core";
import { invalidateHeaderForUser } from "@/lib/header-cache";

/**
 * Trust & safety Server Actions. Thin auth wrappers over the framework-
 * agnostic cores in lib/{block,report}-core.ts.
 */

export async function blockUser(targetUserId: string) {
  const user = await requireUser();
  const res = await blockUserCore(user.id, targetUserId);
  // Block drops friendship/match + filters feed; refresh the surfaces that
  // render the now-hidden user.
  invalidateHeaderForUser(user.id);
  revalidatePath("/feed");
  revalidatePath("/friends");
  revalidatePath("/messages");
  return res;
}

export async function unblockUser(targetUserId: string) {
  const user = await requireUser();
  const res = await unblockUserCore(user.id, targetUserId);
  revalidatePath("/feed");
  return res;
}

export async function reportContent(input: ReportInput) {
  const user = await requireUser();
  return createReportCore(user.id, input);
}
