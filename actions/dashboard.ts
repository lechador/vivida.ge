"use server";

import { requireUser } from "@/lib/auth-helpers";
import {
  loadDashboardCoreFor,
  loadDashboardExtrasFor,
  type DashboardCore,
  type DashboardExtras,
} from "@/lib/dashboard-load";
import type { UserLocale } from "@/lib/i18n/user-locale";

export type { DashboardCore, DashboardExtras };

/**
 * Both actions are public POST endpoints, so the user is ALWAYS taken from
 * the session, never from the caller. Implementation (and its docs) live in
 * `lib/dashboard-load.ts`.
 */
export async function loadDashboardCore(): Promise<DashboardCore> {
  const user = await requireUser();
  return loadDashboardCoreFor(user.id);
}

export async function loadDashboardExtras(
  locale: UserLocale = "ka",
): Promise<DashboardExtras> {
  const user = await requireUser();
  return loadDashboardExtrasFor(user.id, locale);
}
