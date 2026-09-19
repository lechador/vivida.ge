"use client";

import Link from "next/link";
import type { ComponentProps } from "react";

import { ANALYTICS_EVENT, productEventBase, trackEvent } from "@/lib/analytics";
import type { UserLocale } from "@/lib/i18n/user-locale";

type LinkProps = Omit<ComponentProps<typeof Link>, "href" | "onClick">;

/**
 * W04 nav funnel — a Next Link that fires nav_item_selected (contract v1:
 * platform/feature/surface/locale + item key) before navigating. Keeps
 * working when gtag is blocked; analytics must never break navigation.
 */
export function NavItemLink({
  href,
  itemKey,
  surface,
  locale = "ka",
  onNavigate,
  children,
  ...rest
}: LinkProps & {
  href: string;
  itemKey: string;
  surface: "desktop_sidebar" | "mobile_nav" | "mobile_tab_bar" | "top_nav";
  locale?: UserLocale;
  /** Extra navigation-time side effect (e.g. closing a drawer). */
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={() => {
        trackEvent(ANALYTICS_EVENT.navItemSelected, {
          ...productEventBase("navigation", surface, locale),
          item: itemKey,
        });
        onNavigate?.();
      }}
      {...rest}
    >
      {children}
    </Link>
  );
}
