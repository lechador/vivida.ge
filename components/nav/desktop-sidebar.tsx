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
 * Editorial Celestial Desktop Sidebar (240px / 15rem).
 * Flat matte charcoal surface with a crisp 1px hairline border,
 * warm brass active indicator, and clean typographic hierarchy.
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
  pendingAskNudges?: number;
  locale?: UserLocale;
  compact?: boolean;
}) {
  const { primary, others } = compact
    ? splitCompactNav(locale)
    : { primary: navItems(locale), others: [] as NavItem[] };

  return (
    <aside
      data-desktop-sidebar
      aria-label={locale !== "ka" ? "Main navigation" : "ძირითადი ნავიგაცია"}
      className={cn(
        "hidden lg:flex",
        "fixed left-0 top-0 z-40 h-[100dvh] w-60",
        "overflow-hidden",
        "flex-col border-r border-border bg-card",
      )}
    >
      {/* Brand Lockup Header */}
      <Link
        href="/dashboard"
        className="flex h-16 shrink-0 items-center gap-2.5 border-b border-border/80 px-5"
      >
        <VividaMark size={30} id="sidebar-mark" className="shrink-0" />
        <span className="font-display text-2xl font-medium tracking-tight text-foreground">
          Vivida
        </span>
      </Link>

      {/* Primary Navigation Rail */}
      <nav className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="mb-2 px-3 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
          {locale !== "ka" ? "Observatory" : "ობსერვატორია"}
        </div>
        <ul className="flex flex-col gap-0.5">
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
                    "group/link relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150",
                    isActive
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "relative grid size-6 shrink-0 place-items-center transition-colors",
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground group-hover/link:text-foreground",
                    )}
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
                  <span className="truncate">{navLabel(item, locale)}</span>
                  {isActive && (
                    <span
                      aria-hidden
                      className="absolute inset-y-1.5 left-0 w-0.5 bg-primary"
                    />
                  )}
                </NavItemLink>
              </li>
            );
          })}

          {others.length > 0 && (
            <li className="mt-1">
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
                    className="group/other flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    <span className="grid size-6 shrink-0 place-items-center text-primary">
                      <item.Icon className="size-4" />
                    </span>
                    <span className="truncate">{navLabel(item, locale)}</span>
                  </NavItemLink>
                ))}
              </SidebarOthers>
            </li>
          )}
        </ul>
      </nav>

      {/* Footer Account Link */}
      <div className="shrink-0 border-t border-border/80 px-5 py-4">
        <Link
          href="/account"
          className="block whitespace-nowrap text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          {locale !== "ka"
            ? "Account & settings →"
            : "ანგარიში და პარამეტრები →"}
        </Link>
      </div>
    </aside>
  );
}
