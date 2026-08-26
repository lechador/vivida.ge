"use client";

import {
  Ban,
  Check,
  CircleDot,
  Loader2,
  RotateCcw,
  ShieldCheck,
  ShieldOff,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { moderateSafetyReport } from "@/actions/admin-safety";
import { Button } from "@/components/ui/button";
import type { ReportTargetType } from "@/db/schema";
import type { SafetyAction } from "@/lib/admin-safety";

type Person = {
  id: string;
  name: string | null;
  email: string | null;
  username: string | null;
  restricted: boolean;
};

export type AdminSafetyReportRowData = {
  id: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: string | null;
  status: "open" | "reviewed" | "actioned" | "dismissed";
  createdAt: Date;
  reviewedAt: Date | null;
  reviewedBy: string | null;
  resolutionNote: string | null;
  reporter: Omit<Person, "restricted">;
  targetUser: Person | null;
  targetBody: string | null;
  targetPostId: string | null;
  history: Array<{
    id: string;
    action: string;
    actorEmail: string;
    note: string | null;
    createdAt: Date;
  }>;
};

const TYPE_LABELS: Record<ReportTargetType, string> = {
  user: "მომხმარებელი",
  post: "პოსტი",
  comment: "კომენტარი",
  message_thread: "მიმოწერა",
};

const STATUS_STYLES = {
  open: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  reviewed: "border-cyan-400/30 bg-cyan-400/10 text-cyan-300",
  actioned: "border-rose-400/30 bg-rose-400/10 text-rose-300",
  dismissed: "border-border bg-card text-muted-foreground",
} as const;

const STATUS_LABELS = {
  open: "ღია",
  reviewed: "განხილული",
  actioned: "მოქმედება მიღებულია",
  dismissed: "დახურული",
} as const;

const ACTION_LABELS: Record<string, string> = {
  review: "განიხილა",
  dismiss: "დახურა",
  reopen: "ხელახლა გახსნა",
  restrict: "მომხმარებელი შეზღუდა",
  unrestrict: "შეზღუდვა მოხსნა",
};

function PersonLink({ person }: { person: Person | Omit<Person, "restricted"> }) {
  const label = person.name ?? person.email ?? "უცნობი მომხმარებელი";
  return person.username ? (
    <Link href={`/u/${person.username}`} className="font-medium hover:underline">
      {label} <span className="text-muted-foreground">@{person.username}</span>
    </Link>
  ) : (
    <span className="font-medium">{label}</span>
  );
}

export function AdminSafetyReportRow({ report }: { report: AdminSafetyReportRowData }) {
  const router = useRouter();
  const [note, setNote] = useState(report.resolutionNote ?? "");
  const [pending, startTransition] = useTransition();

  function act(action: SafetyAction) {
    const confirmations: Partial<Record<SafetyAction, string>> = {
      dismiss: "დაიხუროს ეს საჩივარი მოქმედების გარეშე?",
      restrict: "შეიზღუდოს ეს მომხმარებელი და დაიხუროს საჩივარი? სოციალური ფუნქციები მისთვის გაითიშება.",
      unrestrict: "მოიხსნას ამ მომხმარებლის ხელით დაწესებული შეზღუდვა?",
      reopen: "დაბრუნდეს ეს საჩივარი ღია რიგში?",
    };
    if (confirmations[action] && !confirm(confirmations[action])) return;

    startTransition(async () => {
      const result = await moderateSafetyReport({
        reportId: report.id,
        action,
        note,
      });
      alert(result.ok ? result.message : result.error);
      if (result.ok) router.refresh();
    });
  }

  return (
    <li className="rounded-2xl border border-border/60 bg-card/40 p-4 sm:p-5">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${STATUS_STYLES[report.status]}`}>
                {STATUS_LABELS[report.status]}
              </span>
              <span className="rounded-full border border-border/60 px-2.5 py-1 text-[11px] text-muted-foreground">
                {TYPE_LABELS[report.targetType]}
              </span>
              <span className="text-[11px] text-muted-foreground">
                {report.createdAt.toLocaleString("ka-GE")}
              </span>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              გამომგზავნი: <PersonLink person={report.reporter} />
              {report.reporter.email && <span> · {report.reporter.email}</span>}
            </div>
          </div>
          <code className="max-w-full break-all rounded bg-background/50 px-2 py-1 text-[10px] text-muted-foreground">
            {report.id}
          </code>
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <section className="rounded-xl border border-border/50 bg-background/30 p-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              საჩივრის მიზეზი
            </div>
            <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed">
              {report.reason ?? "მიზეზი არ არის მითითებული."}
            </p>
          </section>

          <section className="rounded-xl border border-border/50 bg-background/30 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                სამიზნე
              </div>
              {report.targetUser?.restricted && (
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-400/10 px-2 py-1 text-[11px] text-rose-300">
                  <Ban className="size-3" /> შეზღუდულია
                </span>
              )}
            </div>
            {report.targetUser ? (
              <div className="mt-2 text-sm">
                <PersonLink person={report.targetUser} />
                {report.targetUser.email && (
                  <div className="mt-1 break-all text-xs text-muted-foreground">
                    {report.targetUser.email}
                  </div>
                )}
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                მომხმარებელი ან კონტენტი წაშლილია.
              </p>
            )}
            {report.targetBody && (
              <blockquote className="mt-3 whitespace-pre-wrap break-words border-l-2 border-[var(--vivida-violet)]/50 pl-3 text-sm text-foreground/80">
                {report.targetBody}
              </blockquote>
            )}
            {report.targetPostId && (
              <Link
                href={`/feed#post-${report.targetPostId}`}
                className="mt-3 inline-block text-xs text-[var(--vivida-cyan)] hover:underline"
              >
                ფიდში ნახვა →
              </Link>
            )}
          </section>
        </div>

        <label>
          <span className="text-xs font-medium text-muted-foreground">ადმინის შენიშვნა</span>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            maxLength={1000}
            rows={2}
            placeholder="გადაწყვეტილების მოკლე მიზეზი (არასავალდებულო)"
            className="mt-1.5 w-full resize-y rounded-xl border border-border bg-background/40 p-3 text-sm outline-none focus:border-[var(--vivida-violet)]"
          />
        </label>

        <div className="flex flex-wrap gap-2">
          {report.status === "open" && (
            <Button type="button" size="sm" variant="outline" onClick={() => act("review")} disabled={pending}>
              {pending ? <Loader2 className="animate-spin" /> : <Check />}
              განხილულად მონიშვნა
            </Button>
          )}
          {report.status !== "open" && (
            <Button type="button" size="sm" variant="outline" onClick={() => act("reopen")} disabled={pending}>
              {pending ? <Loader2 className="animate-spin" /> : <RotateCcw />}
              ხელახლა გახსნა
            </Button>
          )}
          {report.status !== "dismissed" && (
            <Button type="button" size="sm" variant="outline" onClick={() => act("dismiss")} disabled={pending}>
              {pending ? <Loader2 className="animate-spin" /> : <X />}
              დახურვა
            </Button>
          )}
          {report.targetUser && !report.targetUser.restricted && (
            <Button type="button" size="sm" variant="mystic" onClick={() => act("restrict")} disabled={pending}>
              {pending ? <Loader2 className="animate-spin" /> : <ShieldOff />}
              მომხმარებლის შეზღუდვა
            </Button>
          )}
          {report.targetUser?.restricted && (
            <Button type="button" size="sm" variant="outline" onClick={() => act("unrestrict")} disabled={pending}>
              {pending ? <Loader2 className="animate-spin" /> : <ShieldCheck />}
              შეზღუდვის მოხსნა
            </Button>
          )}
        </div>

        {(report.reviewedAt || report.history.length > 0) && (
          <details className="rounded-xl border border-border/40 bg-background/20 px-3 py-2 text-xs">
            <summary className="cursor-pointer select-none text-muted-foreground">
              მოქმედებების ისტორია · {report.history.length}
            </summary>
            <ul className="mt-3 space-y-2">
              {report.history.map((event) => (
                <li key={event.id} className="flex gap-2 text-muted-foreground">
                  <CircleDot className="mt-0.5 size-3 shrink-0 text-[var(--vivida-violet)]" />
                  <span>
                    <span className="text-foreground">{event.actorEmail}</span>{" "}
                    {ACTION_LABELS[event.action] ?? event.action} · {event.createdAt.toLocaleString("ka-GE")}
                    {event.note && <span className="block text-foreground/75">{event.note}</span>}
                  </span>
                </li>
              ))}
              {report.history.length === 0 && report.reviewedAt && (
                <li className="text-muted-foreground">
                  {report.reviewedBy ?? "admin"} · {report.reviewedAt.toLocaleString("ka-GE")}
                </li>
              )}
            </ul>
          </details>
        )}
      </div>
    </li>
  );
}
