import Link from "next/link";

import { VividaMark } from "@/components/brand/vivida-mark";
import { cn } from "@/lib/utils";
import { AskTabBadge } from "./ask-tab-badge";
import { MessagesTabBadge } from "./messages-tab-badge";
import { NavItemLink } from "./nav-item-link";
import {
  navItems,
  navLabel,
  splitCompactNav,
  type NavActiveKey,
  type NavItem,
} from "./nav-items";
import { SidebarOthers } from "./sidebar-others";
import type { UserLocale } from "@/lib/i18n/user-locale";

/**
 * Desktop-only left sidebar, always expanded (15rem) so labels are visible
 * without hovering. Content is offset by the same width via the
 * `[data-desktop-sidebar]` body rule in globals.css.
 */
export function DesktopSidebar({
  active,
  unreadMessages = 0,
  pendingAskNudges = 0,
  locale = "ka",
  compact = false,
}: {
  active?: NavActiveKey;
  unreadMessages?: number;
  /** Unopened proactive astrologer nudges, dot on the ask item. */
  pendingAskNudges?: number;
  locale?: UserLocale;
  /** English host: a few primary destinations + an "Others" dialog. */
  compact?: boolean;
}) {
  // Compact (vividaastro.com): Today/Tarot/Ask/My chart/Readings stay visible and
  // everything else moves into the Others dialog. Otherwise the full rail.
  const { primary, others } = compact
    ? splitCompactNav(locale)
    : { primary: navItems(locale), others: [] as NavItem[] };

  // Labels are always visible, no hover reveal.
  const reveal = "";

  return (
    <aside
      data-desktop-sidebar
      aria-label={locale !== "ka" ? "Main navigation" : "ძირითადი ნავიგაცია"}
      className={cn(
        "hidden lg:flex",
        "fixed left-0 top-0 z-40 h-[100dvh] w-60",
        "overflow-hidden",
        "flex-col border-r border-[var(--vivida-violet)]/30 bg-[oklch(0.15_0.05_290/0.97)] backdrop-blur-2xl",
        "shadow-[8px_0_32px_-12px_oklch(0.65_0.24_305/0.18)]",
        "after:pointer-events-none after:absolute after:inset-y-8 after:right-0 after:w-px after:bg-[linear-gradient(180deg,transparent,oklch(0.78_0.18_305/0.45),transparent)]",
      )}
    >
      <Link
        href="/dashboard"
        className="flex shrink-0 items-center gap-2.5 px-[1.15rem] pb-3 pt-4"
      >
        <VividaMark size={36} id="sidebar-mark" className="!size-9 shrink-0" />
        <span className={cn("flex items-center gap-2", reveal)}>
          <span
            className="bg-clip-text text-transparent text-xl font-semibold tracking-tight"
            style={{
              backgroundImage:
                "linear-gradient(135deg, #a78bfa 0%, #f472b6 55%, #22d3ee 100%)",
            }}
          >
            vivida
          </span>
        </span>
      </Link>

      <div
        aria-hidden
        className="mx-4 h-px shrink-0 bg-gradient-to-r from-transparent via-border to-transparent"
      />

      <nav className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <ul className="mt-2 flex flex-col gap-0.5">
          {primary.map((item) => {
            const isActive = active === item.key;
            return (
              <li key={item.key}>
                <NavItemLink
                  href={item.href}
                  itemKey={item.key}
                  surface="desktop_sidebar"
                  locale={locale}
                  aria-current={isActive ? "page" : undefined}
                  title={navLabel(item, locale)}
                  className={cn(
                    "group/link relative flex items-center gap-3 rounded-xl px-3 py-1.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[var(--vivida-violet)]/15 text-foreground"
                      : "text-muted-foreground hover:bg-card/50 hover:text-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "relative grid size-8 shrink-0 place-items-center rounded-lg transition-all",
                      isActive
                        ? "bg-[var(--vivida-violet)]/30 ring-1 ring-[var(--vivida-violet)]/55 shadow-[0_0_18px_-4px_oklch(0.65_0.24_305/0.55)]"
                        : "bg-card/40 ring-1 ring-border/40 group-hover/link:ring-border",
                    )}
                    style={isActive ? { color: item.hue } : undefined}
                  >
                    <item.Icon className="size-4" />
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
                  <span className={cn("truncate")}>
                    {navLabel(item, locale)}
                  </span>
                  {isActive && (
                    <span
                      aria-hidden
                      className="absolute inset-y-1.5 left-0 w-0.5 rounded-r-full bg-[var(--vivida-violet)] shadow-[0_0_8px_oklch(0.65_0.24_305/0.85)]"
                    />
                  )}
                </NavItemLink>
              </li>
            );
          })}

          {others.length > 0 && (
            <li>
              <SidebarOthers
                locale={locale}
                hasUnread={unreadMessages > 0 || pendingAskNudges > 0}
              >
                {others.map((item) => (
                  <NavItemLink
                    key={item.key}
                    href={item.href}
                    itemKey={item.key}
                    surface="desktop_sidebar"
                    locale={locale}
                    title={navLabel(item, locale)}
                    className="group/other flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-card/50 hover:text-foreground"
                  >
                    <span
                      className="grid size-7 shrink-0 place-items-center rounded-lg bg-card/40 ring-1 ring-border/40"
                      style={{ color: item.hue }}
                    >
                      <item.Icon className="size-3.5" />
                    </span>
                    <span className="truncate">{navLabel(item, locale)}</span>
                  </NavItemLink>
                ))}
              </SidebarOthers>
            </li>
          )}
        </ul>
      </nav>

      <div className="shrink-0 px-5 pb-5 pt-3">
        <div
          aria-hidden
          className="mb-3 h-px bg-gradient-to-r from-transparent via-border to-transparent"
        />
        <Link
          href="/account"
          className={cn(
            "block whitespace-nowrap text-xs text-muted-foreground hover:text-foreground",
            reveal,
          )}
        >
          {locale !== "ka"
            ? "Account & settings →"
            : "ანგარიში & პარამეტრები →"}
        </Link>
      </div>
    </aside>
  );
}
