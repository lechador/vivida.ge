import { MarketingHeader } from "@/components/marketing-header";
import { EnglishHeader } from "@/components/en/english-header";
import { ArmenianHeader } from "@/components/am/armenian-header";
import type { UserLocale } from "@/lib/i18n/locale";

type MarketingActive =
  | "features"
  | "how-it-works"
  | "nataluri-ruka"
  | "zodiac"
  | "horoskopi"
  | "taro"
  | "tests";

/**
 * Header for public marketing + SEO pages. Fully STATIC on purpose: it does
 * NOT read auth on the server, so every page that renders it stays statically
 * prerenderable (CDN-served) instead of being forced dynamic. The header shows
 * the anonymous marketing shell; a small client CTA (MarketingCta) upgrades to
 * an "open app" link after hydration for signed-in visitors.
 *
 * In-app authed pages (dashboard, feed, …) render `AppHeader` directly and stay
 * dynamic — this component is only for the public surface.
 */
export function SmartHeader({
  active,
  locale = "ka",
  georgianPath = "/",
}: {
  active?: MarketingActive;
  locale?: UserLocale;
  georgianPath?: string;
} = {}) {
  if (locale === "am") {
    return <ArmenianHeader georgianPath={georgianPath} />;
  }
  if (locale === "en") {
    return <EnglishHeader georgianPath={georgianPath} />;
  }
  return <MarketingHeader active={active} />;
}

