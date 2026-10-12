import { eq } from "drizzle-orm";

import { auth } from "@/auth";
import { db } from "@/db";
import { pdfReports, users } from "@/db/schema";
import { sendReportPdfEmail } from "@/lib/email";
import { normalizeUserLocale } from "@/lib/i18n/locale";
import { ApiError } from "@/lib/api/errors";
import { enforceRateLimit } from "@/lib/rate-limit";
import { isReportProductKey, localized, REPORT_PRODUCTS } from "@/lib/report-catalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/**
 * Mail the finished PDF to the owner's account address, from the "send it to
 * my email" button next to the download.
 *
 * Deliberately re-sendable: people press this again when the first one didn't
 * land, so nothing here dedupes. The rate limit is what keeps it from becoming
 * a way to fire mail at an inbox, generous enough that a genuine retry always
 * goes through.
 */
export async function POST(req: Request, ctx: Params) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return Response.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const [report] = await db
    .select()
    .from(pdfReports)
    .where(eq(pdfReports.id, id))
    .limit(1);

  if (!report || report.userId !== userId) {
    return Response.json({ error: "not_found" }, { status: 404 });
  }
  if (report.status !== "ready" || !report.pdfKey) {
    return Response.json({ error: "not_ready" }, { status: 409 });
  }

  try {
    await enforceRateLimit({
      bucket: "report_email",
      identifier: userId,
      limit: 5,
      windowMs: 60 * 60 * 1000,
    });
  } catch (err) {
    if (err instanceof ApiError) {
      return Response.json(
        { error: "rate_limited" },
        { status: err.status, headers: err.headers },
      );
    }
    throw err;
  }

  const [user] = await db
    .select({
      email: users.email,
      name: users.name,
      locale: users.interfaceLanguage,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user?.email) {
    return Response.json({ error: "no_email" }, { status: 400 });
  }

  // The PDF's own language was fixed at purchase; write the covering email in
  // the same one so the two don't disagree.
  const reportLocale = normalizeUserLocale(report.language ?? user.locale);
  const result = await sendReportPdfEmail({
    userId,
    to: user.email,
    name: user.name,
    reportId: report.id,
    pdfKey: report.pdfKey,
    locale: reportLocale,
    reportType: report.type,
    reportTitle: isReportProductKey(report.type) ? localized(REPORT_PRODUCTS[report.type].shortTitle, reportLocale) : undefined,
  });

  if (!result.ok) {
    return Response.json({ error: result.error ?? "send_failed" }, { status: 502 });
  }
  return Response.json({ ok: true, to: user.email });
}
