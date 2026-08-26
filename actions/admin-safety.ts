"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/admin-auth";
import {
  moderateSafetyReportCore,
  type SafetyActionInput,
} from "@/lib/admin-safety";

export async function moderateSafetyReport(input: SafetyActionInput) {
  const admin = await requireAdmin();
  const result = await moderateSafetyReportCore(
    admin.email?.toLowerCase() ?? "admin",
    input,
  );

  revalidatePath("/admin/safety");
  if (result.ok && (input.action === "restrict" || input.action === "unrestrict")) {
    // The core resolves the actual reported author and never trusts a client
    // supplied user id. Refresh all shared social surfaces after the flag flips.
    revalidatePath("/feed");
    revalidatePath("/friends");
    revalidatePath("/messages");
    revalidatePath("/people");
    revalidatePath("/discover");
  }
  return result;
}
