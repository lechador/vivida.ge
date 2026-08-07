import { permanentRedirect } from "next/navigation";

/**
 * Subscriptions are retired — Vivida runs on credits now. This page only
 * exists to redirect any old /subscription links to the credit hub.
 */
export default function SubscriptionPage() {
  permanentRedirect("/credits");
}
