import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/**
 * Subscriptions are retired — Vivida runs on credits now. This page redirects
 * to the credit hub. (Existing paid subscriptions still resolve via
 * getCurrentPlan and can be cancelled through the Stripe billing portal.)
 */
export default function SubscriptionPage() {
  redirect("/credits");
}
