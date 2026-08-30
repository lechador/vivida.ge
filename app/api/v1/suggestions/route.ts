import { requireMobileUser } from "@/lib/api/auth";
import { handle } from "@/lib/api/errors";
import { ok } from "@/lib/api/respond";
import { SOCIAL_FEATURES } from "@/lib/social-flags";
import { getDashboardSuggestions } from "@/lib/suggestions";

export const runtime = "nodejs";
export { OPTIONS } from "@/lib/api/cors";

/** The same compatible-people rail shown on the website dashboard. */
export async function GET(req: Request) {
  return handle(async () => {
    const user = await requireMobileUser(req);
    if (!SOCIAL_FEATURES.suggestedPeopleRail) {
      return ok({ suggestions: [] });
    }

    const suggestions = await getDashboardSuggestions(user.id, 12);
    return ok({ suggestions });
  });
}
