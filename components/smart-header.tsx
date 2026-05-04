import { auth } from "@/auth";
import { getCurrentPlan } from "@/lib/plan";
import { AppHeader } from "@/components/nav/app-header";
import { MarketingHeader } from "@/components/marketing-header";

type MarketingActive = "features" | "how-it-works" | "pricing";

/**
 * Header that picks the right variant by auth state.
 *
 * - Anonymous viewer → lightweight `MarketingHeader` (logo + 3 nav links + CTA)
 * - Authed viewer    → full `AppHeader` (the in-app shell with bell, search, user menu)
 *
 * Used on the four public-facing pages (/features, /how-it-works, /terms,
 * /privacy) so a logged-in user reading marketing copy is never stranded
 * outside their app shell. AppHeader's `active` prop intentionally ignores
 * the marketing-only keys ("features", "how-it-works") — none of the in-app
 * nav tabs should be highlighted while reading marketing content.
 */
export async function SmartHeader({
  active,
}: {
  active?: MarketingActive;
}) {
  const session = await auth();
  if (session?.user?.id) {
    const plan = await getCurrentPlan(session.user.id);
    return (
      <AppHeader
        authed
        plan={plan}
        active={active === "pricing" ? "pricing" : undefined}
      />
    );
  }
  return <MarketingHeader active={active} />;
}
