import { and, count, desc, eq, inArray } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { Flag, ShieldAlert } from "lucide-react";
import Link from "next/link";

import {
  AdminSafetyReportRow,
  type AdminSafetyReportRowData,
} from "@/components/admin/admin-safety-report-row";
import { db } from "@/db";
import {
  postComments,
  posts,
  profiles,
  reportModerationActions,
  reports,
  users,
  type ReportTargetType,
} from "@/db/schema";
import { requireAdmin } from "@/lib/admin-auth";

export const metadata = { title: "უსაფრთხოება · ადმინი" };
export const dynamic = "force-dynamic";

const STATUSES = ["open", "reviewed", "actioned", "dismissed"] as const;
const TARGET_TYPES = ["user", "post", "comment", "message_thread"] as const;

type StatusFilter = (typeof STATUSES)[number] | "all";
type TargetFilter = ReportTargetType | "all";

function statusFilter(value: string | undefined): StatusFilter {
  return value && STATUSES.includes(value as (typeof STATUSES)[number])
    ? (value as (typeof STATUSES)[number])
    : value === "all"
      ? "all"
      : "open";
}

function targetFilter(value: string | undefined): TargetFilter {
  return value && TARGET_TYPES.includes(value as ReportTargetType)
    ? (value as ReportTargetType)
    : "all";
}

function filterHref(status: StatusFilter, target: TargetFilter, page = 1): string {
  const params = new URLSearchParams();
  params.set("status", status);
  if (target !== "all") params.set("type", target);
  if (page > 1) params.set("page", String(page));
  return `/admin/safety?${params.toString()}`;
}

export default async function AdminSafetyPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string; page?: string }>;
}) {
  // Keep the authorization check next to the sensitive query. The shared
  // layout is useful UI gating, but layouts alone are not a data boundary.
  await requireAdmin();
  const params = await searchParams;
  const selectedStatus = statusFilter(params.status);
  const selectedTarget = targetFilter(params.type);
  const requestedPage = Number.parseInt(params.page ?? "1", 10);
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const pageSize = 100;
  const where = and(
    selectedStatus === "all" ? undefined : eq(reports.status, selectedStatus),
    selectedTarget === "all" ? undefined : eq(reports.targetType, selectedTarget),
  );

  const reporter = alias(users, "reporter");
  const reporterProfile = alias(profiles, "reporter_profile");
  const [rows, statusCounts, [filteredCount]] = await Promise.all([
    db
      .select({
        id: reports.id,
        reporterId: reports.reporterId,
        targetType: reports.targetType,
        targetId: reports.targetId,
        reason: reports.reason,
        status: reports.status,
        createdAt: reports.createdAt,
        reviewedAt: reports.reviewedAt,
        reviewedBy: reports.reviewedBy,
        resolutionNote: reports.resolutionNote,
        reporterName: reporter.name,
        reporterEmail: reporter.email,
        reporterUsername: reporterProfile.username,
      })
      .from(reports)
      .innerJoin(reporter, eq(reporter.id, reports.reporterId))
      .leftJoin(reporterProfile, eq(reporterProfile.userId, reports.reporterId))
      .where(where)
      .orderBy(desc(reports.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db
      .select({ status: reports.status, total: count() })
      .from(reports)
      .groupBy(reports.status),
    db.select({ total: count() }).from(reports).where(where),
  ]);

  const directTargetIds = rows
    .filter((row) => row.targetType === "user" || row.targetType === "message_thread")
    .map((row) => row.targetId);
  const postIds = rows.filter((row) => row.targetType === "post").map((row) => row.targetId);
  const commentIds = rows.filter((row) => row.targetType === "comment").map((row) => row.targetId);

  const targetProfile = alias(profiles, "target_profile");
  const postAuthor = alias(users, "post_author");
  const postAuthorProfile = alias(profiles, "post_author_profile");
  const commentAuthor = alias(users, "comment_author");
  const commentAuthorProfile = alias(profiles, "comment_author_profile");

  const [directTargets, targetPosts, targetComments, history] = await Promise.all([
    directTargetIds.length
      ? db
          .select({
            id: users.id,
            name: users.name,
            email: users.email,
            username: targetProfile.username,
            restricted: users.restricted,
          })
          .from(users)
          .leftJoin(targetProfile, eq(targetProfile.userId, users.id))
          .where(inArray(users.id, directTargetIds))
      : Promise.resolve([]),
    postIds.length
      ? db
          .select({
            id: posts.id,
            body: posts.body,
            userId: postAuthor.id,
            name: postAuthor.name,
            email: postAuthor.email,
            username: postAuthorProfile.username,
            restricted: postAuthor.restricted,
          })
          .from(posts)
          .innerJoin(postAuthor, eq(postAuthor.id, posts.userId))
          .leftJoin(postAuthorProfile, eq(postAuthorProfile.userId, posts.userId))
          .where(inArray(posts.id, postIds))
      : Promise.resolve([]),
    commentIds.length
      ? db
          .select({
            id: postComments.id,
            postId: postComments.postId,
            body: postComments.body,
            userId: commentAuthor.id,
            name: commentAuthor.name,
            email: commentAuthor.email,
            username: commentAuthorProfile.username,
            restricted: commentAuthor.restricted,
          })
          .from(postComments)
          .innerJoin(commentAuthor, eq(commentAuthor.id, postComments.userId))
          .leftJoin(commentAuthorProfile, eq(commentAuthorProfile.userId, postComments.userId))
          .where(inArray(postComments.id, commentIds))
      : Promise.resolve([]),
    rows.length
      ? db
          .select({
            id: reportModerationActions.id,
            reportId: reportModerationActions.reportId,
            action: reportModerationActions.action,
            actorEmail: reportModerationActions.actorEmail,
            note: reportModerationActions.note,
            createdAt: reportModerationActions.createdAt,
          })
          .from(reportModerationActions)
          .where(inArray(reportModerationActions.reportId, rows.map((row) => row.id)))
          .orderBy(desc(reportModerationActions.createdAt))
      : Promise.resolve([]),
  ]);

  const directById = new Map(directTargets.map((target) => [target.id, target]));
  const postById = new Map(targetPosts.map((post) => [post.id, post]));
  const commentById = new Map(targetComments.map((comment) => [comment.id, comment]));
  const historyByReport = new Map<string, typeof history>();
  for (const event of history) {
    const events = historyByReport.get(event.reportId) ?? [];
    events.push(event);
    historyByReport.set(event.reportId, events);
  }

  const reportRows: AdminSafetyReportRowData[] = rows.map((row) => {
    const post = row.targetType === "post" ? postById.get(row.targetId) : undefined;
    const comment = row.targetType === "comment" ? commentById.get(row.targetId) : undefined;
    const target = post
      ? {
          id: post.userId,
          name: post.name,
          email: post.email,
          username: post.username,
          restricted: post.restricted,
        }
      : comment
        ? {
            id: comment.userId,
            name: comment.name,
            email: comment.email,
            username: comment.username,
            restricted: comment.restricted,
          }
        : directById.get(row.targetId) ?? null;

    return {
      id: row.id,
      targetType: row.targetType,
      targetId: row.targetId,
      reason: row.reason,
      status: row.status,
      createdAt: row.createdAt,
      reviewedAt: row.reviewedAt,
      reviewedBy: row.reviewedBy,
      resolutionNote: row.resolutionNote,
      reporter: {
        id: row.reporterId,
        name: row.reporterName,
        email: row.reporterEmail,
        username: row.reporterUsername,
      },
      targetUser: target,
      targetBody: post?.body ?? comment?.body ?? null,
      targetPostId: post?.id ?? comment?.postId ?? null,
      history: historyByReport.get(row.id) ?? [],
    };
  });

  const counts = Object.fromEntries(STATUSES.map((status) => [status, 0])) as Record<(typeof STATUSES)[number], number>;
  for (const item of statusCounts) counts[item.status] = Number(item.total);
  const filteredTotal = Number(filteredCount?.total ?? 0);
  const pageCount = Math.max(1, Math.ceil(filteredTotal / pageSize));

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="size-5 text-[var(--vivida-pink)]" />
            <h1 className="text-2xl font-semibold tracking-tight">უსაფრთხოების პანელი</h1>
          </div>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            მომხმარებლების საჩივრების რიგი, გადაწყვეტილებების ისტორია და სოციალური ფუნქციების ხელით შეზღუდვა.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-amber-400/20 bg-amber-400/5 px-3 py-2 text-xs text-amber-200">
          <Flag className="size-4" /> {counts.open} ღია საჩივარი
        </div>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {STATUSES.map((status) => (
          <Link
            key={status}
            href={filterHref(status, selectedTarget)}
            className={`rounded-xl border p-3 transition-colors ${selectedStatus === status ? "border-[var(--vivida-violet)] bg-[var(--vivida-violet)]/10" : "border-border/60 bg-card/30 hover:bg-card/60"}`}
          >
            <div className="text-xl font-semibold">{counts[status]}</div>
            <div className="mt-1 text-xs text-muted-foreground">
              {status === "open" ? "ღია" : status === "reviewed" ? "განხილული" : status === "actioned" ? "მოქმედებით" : "დახურული"}
            </div>
          </Link>
        ))}
      </div>

      <div className="mb-6 flex flex-wrap gap-2 text-xs">
        <Link href={filterHref(selectedStatus, "all")} className={`rounded-full border px-3 py-1.5 ${selectedTarget === "all" ? "border-foreground text-foreground" : "border-border text-muted-foreground"}`}>
          ყველა ტიპი
        </Link>
        {TARGET_TYPES.map((type) => (
          <Link key={type} href={filterHref(selectedStatus, type)} className={`rounded-full border px-3 py-1.5 ${selectedTarget === type ? "border-foreground text-foreground" : "border-border text-muted-foreground"}`}>
            {type === "user" ? "მომხმარებელი" : type === "post" ? "პოსტი" : type === "comment" ? "კომენტარი" : "მიმოწერა"}
          </Link>
        ))}
        <Link href={filterHref("all", selectedTarget)} className={`rounded-full border px-3 py-1.5 ${selectedStatus === "all" ? "border-foreground text-foreground" : "border-border text-muted-foreground"}`}>
          ყველა სტატუსი
        </Link>
      </div>

      {reportRows.length ? (
        <>
          <div className="mb-3 text-xs text-muted-foreground">
            ნაჩვენებია {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filteredTotal)} · სულ {filteredTotal}
          </div>
          <ul className="space-y-3">
            {reportRows.map((report) => (
              <AdminSafetyReportRow key={report.id} report={report} />
            ))}
          </ul>
          {pageCount > 1 && (
            <nav className="mt-6 flex items-center justify-center gap-3 text-sm" aria-label="საჩივრების გვერდები">
              {page > 1 ? (
                <Link href={filterHref(selectedStatus, selectedTarget, page - 1)} className="rounded-lg border border-border px-3 py-2 hover:bg-card">
                  ← წინა
                </Link>
              ) : <span />}
              <span className="text-muted-foreground">{page} / {pageCount}</span>
              {page < pageCount ? (
                <Link href={filterHref(selectedStatus, selectedTarget, page + 1)} className="rounded-lg border border-border px-3 py-2 hover:bg-card">
                  შემდეგი →
                </Link>
              ) : <span />}
            </nav>
          )}
        </>
      ) : (
        <div className="rounded-2xl border border-dashed border-border/60 bg-card/20 p-12 text-center">
          <ShieldAlert className="mx-auto size-8 text-muted-foreground/50" />
          <p className="mt-3 text-sm text-muted-foreground">ამ ფილტრით საჩივრები არ მოიძებნა.</p>
        </div>
      )}
    </main>
  );
}
