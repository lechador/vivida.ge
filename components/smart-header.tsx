import { MarketingHeader } from "@/components/marketing-header";

type MarketingActive = "features" | "how-it-works" | "nataluri-ruka" | "zodiac";

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
export function SmartHeader({ active }: { active?: MarketingActive } = {}) {
  return <MarketingHeader active={active} />;
}
