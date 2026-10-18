"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Link2, Trash2 } from "lucide-react";

import { softDeletePartner } from "@/actions/partners";
import { cn } from "@/lib/utils";
import type { UserLocale } from "@/lib/i18n/user-locale";

export function PartnerCard({
  id,
  name,
  cityName,
  dateOfBirth,
  canDelete = true,
  connected = false,
  locale,
}: {
  id: string;
  name: string;
  cityName: string;
  dateOfBirth: string;
  canDelete?: boolean;
  connected?: boolean;
  locale: UserLocale;
}) {
  const [isPending, startTransition] = useTransition();

  const onDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (
      !window.confirm(locale !== "ka" ? `Remove ${name}?` : `წავშალოთ ${name}?`)
    )
      return;
    startTransition(async () => {
      await softDeletePartner(id);
    });
  };

  return (
    <Link
      href={`/synastry/${id}`}
      className={cn(
        "group relative flex h-full items-start gap-3.5 bg-card p-5 transition-colors hover:bg-secondary/40",
        isPending && "pointer-events-none opacity-50",
      )}
    >
      <div className="grid size-10 shrink-0 place-items-center rounded-sm border border-border bg-secondary/50 font-mono text-sm font-semibold text-primary">
        {name.slice(0, 1).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <div className="truncate text-base font-semibold tracking-tight text-foreground group-hover:text-primary">
            {name}
          </div>
          {connected && (
            <span className="inline-flex shrink-0 items-center gap-1 font-mono text-[10px] font-medium uppercase tracking-wider text-primary">
              <Link2 className="size-2.5" aria-hidden />
              {locale !== "ka" ? "Connected" : "ერთად"}
            </span>
          )}
        </div>
        <div className="mt-1 truncate font-mono text-xs tabular-nums text-muted-foreground">
          {dateOfBirth} · {cityName}
        </div>
      </div>
      {canDelete && (
        <button
          type="button"
          onClick={onDelete}
          disabled={isPending}
          className="relative grid size-8 shrink-0 place-items-center rounded-sm text-muted-foreground/60 transition-colors hover:bg-destructive/10 hover:text-destructive"
          aria-label={locale !== "ka" ? `Remove ${name}` : `წაშლა, ${name}`}
          title={locale !== "ka" ? "Remove" : "წაშლა"}
        >
          <Trash2 className="size-4" />
        </button>
      )}
    </Link>
  );
}
