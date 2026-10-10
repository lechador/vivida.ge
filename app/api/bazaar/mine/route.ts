import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { listOwnServices, specialtiesOf } from "@/lib/bazaar";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/bazaar/mine — the viewer's own reader profile (any status) plus
 * all of its services (active and paused). Powers the provider dashboard
 * in My readings.
 */
export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { provider, services } = await listOwnServices(userId);
  return NextResponse.json({
    provider: provider
      ? {
          id: provider.id,
          status: provider.status,
          displayName: provider.displayName,
          headline: provider.headline,
          bio: provider.bio,
          specialties: specialtiesOf(provider),
          solanaWallet: provider.solanaWallet,
          avgRating100: provider.avgRating100,
          reviewCount: provider.reviewCount,
        }
      : null,
    services: services.map((s) => ({
      id: s.id,
      title: s.title,
      description: s.description,
      category: s.category,
      priceUsdcCents: s.priceUsdcCents,
      deliveryPromise: s.deliveryPromise,
      status: s.status,
    })),
  });
}
