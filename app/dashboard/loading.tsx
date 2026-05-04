import { CosmicLoader } from "@/components/dashboard/cosmic-loader";

/**
 * Route-level loading state. Shown by Next.js the instant the user navigates
 * to /dashboard, before any server work begins. Especially important for
 * new users — chart + daily generation can take 60–90s on first visit and
 * a blank screen during that window made the page feel broken.
 */
export default function DashboardLoading() {
  return <CosmicLoader />;
}
