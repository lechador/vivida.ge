"use client";

import { useState } from "react";
import { Ellipsis } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { UserLocale } from "@/lib/i18n/user-locale";

/**
 * Compact-sidebar "Others" entry (English host): opens a dialog with every
 * secondary destination. The trigger mirrors the sidebar link styling; the
 * dialog's link grid is server-rendered and passed in as children, and any
 * click inside the grid closes the dialog before/while navigating.
 */
export function SidebarOthers({
  children,
  hasUnread = false,
  locale = "ka",
}: {
  children: React.ReactNode;
  /** Unread messages / pending nudges — shown as a dot on the trigger. */
  hasUnread?: boolean;
  locale?: UserLocale;
}) {
  const [open, setOpen] = useState(false);
  const en = locale !== "ka";
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className={cn(
            "group/link relative flex w-full items-center gap-3 rounded-xl px-3 py-1.5 text-sm font-medium transition-colors",
            open
              ? "bg-[var(--vivida-violet)]/15 text-foreground"
              : "text-muted-foreground hover:bg-card/50 hover:text-foreground",
          )}
        >
          <span className="relative grid size-8 shrink-0 place-items-center rounded-lg bg-card/40 ring-1 ring-border/40 transition-all group-hover/link:ring-border">
            <Ellipsis className="size-4" />
            {hasUnread && (
              <span
                aria-hidden
                className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-[var(--vivida-cyan)] shadow-[0_0_6px_oklch(0.80_0.15_200/0.9)]"
              />
            )}
          </span>
          <span className="truncate">{en ? "Others" : "სხვა"}</span>
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[92dvh] max-w-md overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{en ? "Others" : "სხვა გვერდები"}</DialogTitle>
          <DialogDescription>
            {en
              ? "Every other corner of Vivida."
              : "ვივიდას დანარჩენი გვერდები."}
          </DialogDescription>
        </DialogHeader>
        <div
          className="grid grid-cols-2 gap-1.5"
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}
