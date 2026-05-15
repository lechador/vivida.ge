import { auth } from "@/auth";
import { getCurrentPlan } from "@/lib/plan";
import { AppHeader } from "@/components/nav/app-header";
import { MarketingHeader } from "@/components/marketing-header";

type MarketingActive = "features" | "how-it-works";

/**
 * Header that picks the right variant by auth state.
 *
 * - Anonymous viewer → lightweight `MarketingHeader` (logo + nav links + CTA)
 * - Authed viewer    → full `AppHeader` (the in-app shell with bell, search, user menu)
 *
 * Used on the public marketing pages (/features, /how-it-works, /terms,
 * /privacy) so a logged-in user reading marketing copy is never stranded
 * outside their app shell. AppHeader's `active` prop intentionally ignores
 * the marketing-only keys — none of the in-app nav tabs should be highlighted
 * while reading marketing content.
 */
export async function SmartHeader({
  active: _active,
}: {
  active?: MarketingActive;
} = {}) {
  const session = await auth();
  if (session?.user?.id) {
    const plan = await getCurrentPlan(session.user.id);
    return <AppHeader authed plan={plan} active={undefined} />;
  }
  return <MarketingHeader active={_active} />;
}
