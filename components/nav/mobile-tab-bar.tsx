import { cn } from "@/lib/utils";
import { AskTabBadge } from "./ask-tab-badge";
import { MobileNav } from "./mobile-nav";
import { NavItemLink } from "./nav-item-link";
import {
  MOBILE_TAB_ITEMS,
  mobileTabLabel,
  type NavActiveKey,
} from "./nav-items";
import type { UserLocale } from "@/lib/i18n/user-locale";

/**
 * Cosmic Observatory Mobile Bottom Tab Bar.
 * Lifted, clearly outlined surface with per-destination hue accents so
 * returning users immediately recognize the mobile navigation.
 */
export function MobileTabBar({
  active,
  unreadMessages = 0,
  pendingAskNudges = 0,
  locale = "ka",
}: {
  active?: NavActiveKey;
  unreadMessages?: number;
  pendingAskNudges?: number;
  locale?: UserLocale;
}) {
  return (
    <nav
      data-mobile-tab-bar
      aria-label={locale !== "ka" ? "Main navigation" : "ძირითადი ნავიგაცია"}
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 lg:hidden",
        "border-t border-[var(--vivida-violet)]/45 bg-[oklch(0.155_0.052_282/0.96)] backdrop-blur-xl",
        "shadow-[0_-12px_32px_-8px_oklch(0.65_0.24_305/0.24)]",
        "before:pointer-events-none before:absolute before:inset-x-6 before:-top-px before:h-px before:bg-[linear-gradient(90deg,transparent,oklch(0.77_0.18_305/0.7),transparent)]",
        "pb-[max(env(safe-area-inset-bottom),0.25rem)]",
      )}
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-around gap-1 px-2 pt-1.5">
        {MOBILE_TAB_ITEMS.map((item) => {
          const isActive = active === item.key;
          return (
            <li key={item.key} className="flex-1">
              <NavItemLink
                href={item.href}
                itemKey={item.key}
                surface="mobile_tab_bar"
                locale={locale}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "group relative flex flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] font-medium transition-colors",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {isActive && (
                  <span
                    aria-hidden
                    className="absolute inset-x-5 -top-1.5 h-0.5 rounded-full"
                    style={{ backgroundColor: item.hue }}
                  />
                )}
                <span
                  className={cn(
                    "relative grid size-8.5 place-items-center rounded-xl transition-all",
                    isActive
                      ? "bg-[var(--vivida-violet)]/25 ring-1 ring-[var(--vivida-violet)]/60 shadow-[0_0_16px_-4px_oklch(0.65_0.24_305/0.55)]"
                      : "text-muted-foreground group-hover:text-foreground group-active:scale-95",
                  )}
                  style={isActive ? { color: item.hue } : undefined}
                >
                  <item.Icon className="size-4.5" />
                  {item.key === "ask" && (
                    <AskTabBadge pending={pendingAskNudges} locale={locale} />
                  )}
                </span>
                <span className="truncate">{mobileTabLabel(item, locale)}</span>
              </NavItemLink>
            </li>
          );
        })}
        <li className="flex-1">
          <MobileNav
            variant="tab"
            active={active}
            locale={locale}
            unreadMessages={unreadMessages}
            pendingAskNudges={pendingAskNudges}
          />
        </li>
      </ul>
    </nav>
  );
}
