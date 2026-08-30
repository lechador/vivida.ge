import { ensureMoonPhase } from "@/actions/moon-phase";
import { requireMobileUser } from "@/lib/api/auth";
import { ApiError, handle } from "@/lib/api/errors";
import { ok } from "@/lib/api/respond";

export const runtime = "nodejs";
export { OPTIONS } from "@/lib/api/cors";

/** Today's universal moon phase and its shared dashboard interpretation. */
export async function GET(req: Request) {
  return handle(async () => {
    await requireMobileUser(req);

    const moon = await ensureMoonPhase("ka");
    if (!moon) {
      throw new ApiError(
        503,
        "moon_phase_unavailable",
        "Moon phase is not available right now",
      );
    }

    return ok({
      date: moon.date,
      phaseKey: moon.phaseKey,
      phaseLabelKa: moon.phaseLabelKa,
      signEn: moon.signEn,
      signKa: moon.signKa,
      signIndex: moon.signIndex,
      signSymbol: moon.snapshot.signSymbol,
      phaseAngle: moon.phaseAngle,
      illumination: moon.illumination,
      ageDays: moon.ageDays,
      headline: moon.headline,
      summary: moon.summary,
      body: moon.body,
      themes: moon.themes,
    });
  });
}
