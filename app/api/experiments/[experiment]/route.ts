import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  EXPERIMENTS,
  isExperimentName,
  isExperimentOutcome,
} from "@/lib/experiment-catalog";
import { recordExperimentEvent } from "@/lib/experiments";
import { firstPurchaseEligible } from "@/lib/first-purchase-experiment-config";
import { hasEverPaid } from "@/lib/payer";
import { isPremiumUser } from "@/lib/premium";

export const dynamic = "force-dynamic";

function cleanSurface(value: string | null): string {
  return value?.trim().slice(0, 120) || "unknown";
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ experiment: string }> },
) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { experiment } = await params;
  if (!isExperimentName(experiment)) {
    return NextResponse.json({ error: "unknown_experiment" }, { status: 404 });
  }
  // Never-payer gate: the first-purchase experiment must not enroll anyone
  // with a server-confirmed payment or an active PRO entitlement. Ineligible
  // users get no assignment row, so their later purchases can never be
  // attributed to an arm they were never in.
  if (experiment === EXPERIMENTS.firstPurchaseOffer) {
    const [paid, premium] = await Promise.all([
      hasEverPaid(session.user.id),
      isPremiumUser(session.user.id),
    ]);
    if (
      !firstPurchaseEligible({
        authenticated: true,
        hasEverPaid: paid,
        isPremium: premium,
      })
    ) {
      return NextResponse.json({ variant: null, eligible: false });
    }
  }
  const url = new URL(request.url);
  const surface = cleanSurface(url.searchParams.get("surface"));
  const result = await recordExperimentEvent({
    userId: session.user.id,
    experiment,
    eventType: "exposure",
    eventName: "viewed",
    surface,
    eventKey: `first:${surface}`,
  });
  return NextResponse.json({ variant: result?.variant });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ experiment: string }> },
) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { experiment } = await params;
  if (!isExperimentName(experiment)) {
    return NextResponse.json({ error: "unknown_experiment" }, { status: 404 });
  }
  const body = (await request.json().catch(() => null)) as {
    eventName?: unknown;
    surface?: unknown;
    eventKey?: unknown;
  } | null;
  const eventName = typeof body?.eventName === "string" ? body.eventName : "";
  if (!isExperimentOutcome(experiment, eventName)) {
    return NextResponse.json({ error: "unknown_outcome" }, { status: 400 });
  }
  const surface = cleanSurface(
    typeof body?.surface === "string" ? body.surface : null,
  );
  const eventKey =
    typeof body?.eventKey === "string" && body.eventKey.trim()
      ? body.eventKey.trim().slice(0, 180)
      : crypto.randomUUID();
  const result = await recordExperimentEvent({
    userId: session.user.id,
    experiment,
    eventType: "outcome",
    eventName,
    surface,
    eventKey,
    createAssignment: false,
  });
  return NextResponse.json({ recorded: Boolean(result) });
}
