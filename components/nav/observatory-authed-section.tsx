"use client";

import { ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { AskTabBadge } from "./ask-tab-badge";
import { MessagesTabBadge } from "./messages-tab-badge";
import { NavItemLink } from "./nav-item-link";
import { navItems, navLabel, type NavActiveKey } from "./nav-items";
import type { UserLocale } from "@/lib/i18n/user-locale";

export function ObservatoryAuthedSection({
  active,
  locale = "ka",
  unreadMessages = 0,
  pendingAskNudges = 0,
  onNavigate,
}: {
  active?: NavActiveKey | "account";
  locale?: UserLocale;
  unreadMessages?: number;
  pendingAskNudges?: number;
  onNavigate: () => void;
}) {
  const en = locale !== "ka";
  const items = navItems(locale);

  return (
    <div className="mb-6">
      <div className="mb-2.5 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
        <span>{en ? "01 · Personal Workspace" : "01 · პირადი სივრცე"}</span>
        <span>{items.length}</span>
      </div>
      <div className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-background/70">
        {items.map((item, idx) => {
          const isActive = item.key === active;
          const Icon = item.Icon;
          return (
            <NavItemLink
              key={item.key}
              href={item.href}
              itemKey={item.key}
              surface="mobile_nav"
              locale={locale}
              onNavigate={onNavigate}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group relative flex items-center justify-between px-3.5 py-2.5 text-sm transition-colors",
                isActive
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
              )}
            >
              {isActive && (
                <span
                  aria-hidden
                  className="absolute inset-y-0 left-0 w-1"
                  style={{ backgroundColor: item.hue }}
                />
              )}
              <div className="flex min-w-0 items-center gap-3">
                <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <span
                  className="relative grid size-5 shrink-0 place-items-center"
                  style={{ color: item.hue }}
                >
                  <Icon className="size-4" />
                  {item.key === "messages" && (
                    <MessagesTabBadge
                      initial={unreadMessages}
                      locale={locale}
                    />
                  )}
                  {item.key === "ask" && (
                    <AskTabBadge pending={pendingAskNudges} locale={locale} />
                  )}
                </span>
                <span className="truncate font-medium">
                  {navLabel(item, locale)}
                </span>
              </div>
              <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
            </NavItemLink>
          );
        })}
      </div>
    </div>
  );
}
