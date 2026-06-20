import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { reports, type ReportTargetType } from "@/db/schema";

/**
 * Report *write* logic. Deliberately minimal — we just capture the report
 * for manual review (no admin UI yet). Read it with a SQL client or db:studio
 * (`select * from report where status='open' order by created_at desc`).
 */

const MAX_REASON = 1000;

export type ReportInput = {
  targetType: ReportTargetType;
  /** Reported user / post / comment id, or the other party's id for a thread. */
  targetId: string;
  reason?: string | null;
};

export type ReportResult =
  | { ok: true; deduped?: boolean }
  | { ok: false; error: string };

export async function createReportCore(
  reporterId: string,
  input: ReportInput
): Promise<ReportResult> {
  if (!input.targetId) {
    return { ok: false, error: "ვერ მოიძებნა საჩივრის ობიექტი" };
  }
  if (input.targetType === "user" && input.targetId === reporterId) {
    return { ok: false, error: "ვერ უჩივი საკუთარ თავს" };
  }

  const reason = (input.reason ?? "").trim().slice(0, MAX_REASON) || null;

  // Dedup: one open report per (reporter, target) — repeat taps are no-ops
  // rather than flooding the queue.
  const [existing] = await db
    .select({ id: reports.id })
    .from(reports)
    .where(
      and(
        eq(reports.reporterId, reporterId),
        eq(reports.targetType, input.targetType),
        eq(reports.targetId, input.targetId),
        eq(reports.status, "open")
      )
    )
    .limit(1);
  if (existing) return { ok: true, deduped: true };

  await db.insert(reports).values({
    reporterId,
    targetType: input.targetType,
    targetId: input.targetId,
    reason,
  });
  return { ok: true };
}
