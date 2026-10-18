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
 * Editorial Celestial Mobile Bottom Tab Bar.
 * Flat matte charcoal surface with a crisp 1px top hairline border
 * and warm brass active tab state.
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
        "border-t border-border bg-card/95 backdrop-blur-md",
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
                  "group relative flex flex-col items-center gap-0.5 rounded-md px-1 py-1.5 text-[10px] font-medium transition-colors",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {isActive && (
                  <span
                    aria-hidden
                    className="absolute inset-x-4 -top-1.5 h-0.5 bg-primary"
                  />
                )}
                <span
                  className={cn(
                    "relative grid size-8 place-items-center rounded-md transition-colors",
                    isActive
                      ? "bg-secondary text-primary"
                      : "text-muted-foreground group-hover:text-foreground",
                  )}
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
