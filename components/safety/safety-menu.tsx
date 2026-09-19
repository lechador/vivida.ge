"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Ban, Flag, ShieldAlert } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { blockUser } from "@/actions/moderation";
import type { ReportTargetType } from "@/db/schema";
import { ReportDialog } from "./report-dialog";
import type { UserLocale } from "@/lib/i18n/user-locale";

/**
 * Report + block menu for another user — used on their profile and in the
 * chat thread header. Block uses a two-tap confirm inside the menu (no extra
 * dialog primitive needed); on success we refresh so the now-hidden user
 * disappears (their profile 404s via the server-side block guard).
 */
export function SafetyMenu({
  targetUserId,
  targetType = "user",
  targetId,
  align = "end",
  locale = "ka",
}: {
  targetUserId: string;
  targetType?: ReportTargetType;
  /** Defaults to targetUserId (for "user"/"message_thread" reports). */
  targetId?: string;
  align?: "end" | "start";
  locale?: UserLocale;
}) {
  const en = locale !== "ka";
  const router = useRouter();
  const [reportOpen, setReportOpen] = useState(false);
  const [confirmBlock, setConfirmBlock] = useState(false);
  const [pending, start] = useTransition();

  function doBlock() {
    start(async () => {
      await blockUser(targetUserId);
      router.refresh();
    });
  }

  return (
    <>
      <DropdownMenu
        onOpenChange={(o) => {
          if (!o) setConfirmBlock(false);
        }}
      >
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={en ? "Safety" : "უსაფრთხოება"}
            className="grid size-9 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-card/80 hover:text-foreground"
          >
            <ShieldAlert className="size-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align={align} className="w-52">
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setReportOpen(true);
            }}
            className="cursor-pointer"
          >
            <Flag className="size-4" />
            {en ? "Report" : "დაარეპორტე"}
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={(e) => {
              // Keep the menu open on the first tap so the confirm shows.
              e.preventDefault();
              if (!confirmBlock) setConfirmBlock(true);
              else doBlock();
            }}
            disabled={pending}
            className="cursor-pointer text-destructive focus:text-destructive"
          >
            <Ban className="size-4" />
            {confirmBlock
              ? en
                ? "Confirm block"
                : "დაადასტურე — დაბლოკე"
              : en
                ? "Block"
                : "დაბლოკე"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ReportDialog
        open={reportOpen}
        onOpenChange={setReportOpen}
        targetType={targetType}
        targetId={targetId ?? targetUserId}
        locale={locale}
      />
    </>
  );
}
