import { requireMobileUser } from "@/lib/api/auth";
import { handle } from "@/lib/api/errors";
import { ok } from "@/lib/api/respond";
import { CREDIT_COST, getBalance } from "@/lib/credits";
import { isPremiumUser } from "@/lib/premium";

export const runtime = "nodejs";
export { OPTIONS } from "@/lib/api/cors";

/**
 * GET /api/v1/credits
 *
 * The viewer's credit wallet. `premium` users are never charged (spendOnce
 * short-circuits for them), so the client shows them as unlimited rather than
 * quoting a balance. `costs` ships the price list with the balance so the app
 * doesn't hard-code an economy that lives in lib/credits-config.
 */
export async function GET(req: Request) {
  return handle(async () => {
    const user = await requireMobileUser(req);
    const [balance, premium] = await Promise.all([
      getBalance(user.id),
      isPremiumUser(user.id),
    ]);
    return ok({
      balance,
      premium,
      costs: {
        synastry: CREDIT_COST.synastry,
        weeklyForecast: CREDIT_COST.weeklyForecast,
      },
    });
  });
}
