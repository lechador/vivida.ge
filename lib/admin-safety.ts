import "server-only";

import { eq, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  postComments,
  posts,
  reportModerationActions,
  reports,
  users,
  type ReportTargetType,
} from "@/db/schema";
import { isAdminEmail } from "@/lib/admin-auth";

export const SAFETY_ACTIONS = [
  "review",
  "dismiss",
  "reopen",
  "restrict",
  "unrestrict",
] as const;

export type SafetyAction = (typeof SAFETY_ACTIONS)[number];

const MAX_NOTE_LENGTH = 1000;

export type SafetyActionInput = {
  reportId: string;
  action: SafetyAction;
  note?: string | null;
};

export type SafetyActionResult =
  | { ok: true; message: string }
  | { ok: false; error: string };

export function isSafetyAction(value: unknown): value is SafetyAction {
  return typeof value === "string" && SAFETY_ACTIONS.includes(value as SafetyAction);
}

function validId(value: unknown): value is string {
  return typeof value === "string" && value.length >= 8 && value.length <= 128;
}

function normalizeNote(value: string | null | undefined): string | null {
  return value?.trim().slice(0, MAX_NOTE_LENGTH) || null;
}

async function targetUserFor(
  targetType: ReportTargetType,
  targetId: string,
): Promise<{ id: string; email: string | null } | null> {
  if (targetType === "user" || targetType === "message_thread") {
    const [target] = await db
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(eq(users.id, targetId))
      .limit(1);
    return target ?? null;
  }

  if (targetType === "post") {
    const [target] = await db
      .select({ id: users.id, email: users.email })
      .from(posts)
      .innerJoin(users, eq(users.id, posts.userId))
      .where(eq(posts.id, targetId))
      .limit(1);
    return target ?? null;
  }

  const [target] = await db
    .select({ id: users.id, email: users.email })
    .from(postComments)
    .innerJoin(users, eq(users.id, postComments.userId))
    .where(eq(postComments.id, targetId))
    .limit(1);
  return target ?? null;
}

function outcome(action: SafetyAction): {
  status: "open" | "reviewed" | "actioned" | "dismissed";
  message: string;
} {
  switch (action) {
    case "review":
      return { status: "reviewed", message: "საჩივარი მონიშნულია განხილულად." };
    case "dismiss":
      return { status: "dismissed", message: "საჩივარი დაიხურა მოქმედების გარეშე." };
    case "reopen":
      return { status: "open", message: "საჩივარი რიგში დაბრუნდა." };
    case "restrict":
      return { status: "actioned", message: "მომხმარებელი შეიზღუდა და საჩივარი დაიხურა." };
    case "unrestrict":
      return { status: "reviewed", message: "მომხმარებლის ხელით შეზღუდვა მოიხსნა." };
  }
}

/**
 * Framework-agnostic moderation mutation. Authorization belongs in the Server
 * Action wrapper; this core validates the target and writes the report state,
 * restriction flag, and audit event in one PostgreSQL statement.
 */
export async function moderateSafetyReportCore(
  actorEmail: string,
  rawInput: SafetyActionInput | unknown,
): Promise<SafetyActionResult> {
  if (!rawInput || typeof rawInput !== "object") {
    return { ok: false, error: "არასწორი მოქმედება." };
  }
  const candidate = rawInput as Partial<SafetyActionInput>;
  if (!validId(candidate.reportId) || !isSafetyAction(candidate.action)) {
    return { ok: false, error: "არასწორი მოქმედება." };
  }
  if (candidate.note != null && typeof candidate.note !== "string") {
    return { ok: false, error: "არასწორი შენიშვნა." };
  }
  const input: SafetyActionInput = {
    reportId: candidate.reportId,
    action: candidate.action,
    note: candidate.note,
  };

  const [report] = await db
    .select({
      id: reports.id,
      targetType: reports.targetType,
      targetId: reports.targetId,
    })
    .from(reports)
    .where(eq(reports.id, input.reportId))
    .limit(1);
  if (!report) return { ok: false, error: "საჩივარი ვერ მოიძებნა." };

  const needsTarget = input.action === "restrict" || input.action === "unrestrict";
  const targetUser = needsTarget
    ? await targetUserFor(report.targetType, report.targetId)
    : null;
  if (needsTarget && !targetUser) {
    return {
      ok: false,
      error: "საჩივრის სამიზნე მომხმარებელი აღარ არსებობს, restriction ვერ შეიცვლება.",
    };
  }
  if (input.action === "restrict" && isAdminEmail(targetUser?.email)) {
    return { ok: false, error: "ადმინისტრატორის ანგარიშის შეზღუდვა ამ პანელიდან აკრძალულია." };
  }

  const note = normalizeNote(input.note);
  const { status, message } = outcome(input.action);
  const eventId = crypto.randomUUID();
  const reopened = input.action === "reopen";

  if (needsTarget && targetUser) {
    const restricted = input.action === "restrict";
    await db.execute(sql`
      WITH target_updated AS (
        UPDATE ${users}
        SET restricted = ${restricted}
        WHERE id = ${targetUser.id}
        RETURNING id
      ), report_updated AS (
        UPDATE ${reports}
        SET
          status = ${status}::report_status,
          reviewed_at = now(),
          reviewed_by = ${actorEmail},
          resolution_note = ${note},
          updated_at = now()
        WHERE id = ${report.id}
          AND EXISTS (SELECT 1 FROM target_updated)
        RETURNING id
      )
      INSERT INTO ${reportModerationActions}
        (id, report_id, actor_email, action, target_user_id, note, created_at)
      SELECT
        ${eventId}, report_updated.id, ${actorEmail}, ${input.action},
        target_updated.id, ${note}, now()
      FROM report_updated
      CROSS JOIN target_updated
    `);
  } else {
    await db.execute(sql`
      WITH report_updated AS (
        UPDATE ${reports}
        SET
          status = ${status}::report_status,
          reviewed_at = ${reopened ? null : new Date()},
          reviewed_by = ${reopened ? null : actorEmail},
          resolution_note = ${note},
          updated_at = now()
        WHERE id = ${report.id}
        RETURNING id
      )
      INSERT INTO ${reportModerationActions}
        (id, report_id, actor_email, action, target_user_id, note, created_at)
      SELECT ${eventId}, id, ${actorEmail}, ${input.action}, NULL, ${note}, now()
      FROM report_updated
    `);
  }

  return { ok: true, message };
}
