import { eq } from "drizzle-orm";

import { auth } from "@/auth";
import { db } from "@/db";
import { pdfReports } from "@/db/schema";
import { presignedDownloadUrl } from "@/lib/r2";
import { isReportProductKey } from "@/lib/report-catalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/** Redirect the owner to a short-lived signed URL for their PDF. */
export async function GET(req: Request, ctx: Params) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return new Response("unauthorized", { status: 401 });

  const { id } = await ctx.params;
  const [report] = await db
    .select()
    .from(pdfReports)
    .where(eq(pdfReports.id, id))
    .limit(1);

  if (!report || report.userId !== userId) {
    return new Response("not found", { status: 404 });
  }
  if (report.status !== "ready" || !report.pdfKey) {
    return new Response("not ready", { status: 409 });
  }

  const url = await presignedDownloadUrl({
    key: report.pdfKey,
    expiresIn: 5 * 60,
    downloadFilename: isReportProductKey(report.type) ? `vivida-${report.type}-report.pdf` : "vivida-natal-report.pdf",
  });
  return Response.redirect(url, 302);
}
