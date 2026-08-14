import { eq } from "drizzle-orm";
import { renderToBuffer } from "@react-pdf/renderer";

import { auth } from "@/auth";
import { isAdminEmail } from "@/lib/admin-auth";
import { db } from "@/db";
import { charts, profiles, users } from "@/db/schema";
import { computeChartSalience } from "@/lib/report-salience";
import { generateNatalReport } from "@/lib/report-content";
import { NatalReport } from "@/components/pdf/natal-report";
import { buildEnglishNatalReportContent } from "@/lib/report-content-pdf-en";
import { normalizeUserLocale } from "@/lib/i18n/locale";

/**
 * Admin-only PDF generation trigger. Lets us review report OUTPUT QUALITY on a
 * real deploy before any payment is wired. Gated to the founder/admin session
 * (so it works on prod/preview but isn't public). Usage, while logged in as
 * admin:
 *   GET /api/dev/report-pdf?u=<username>            → natal PDF
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Long-form generation (4 parallel Gemini calls) + PDF render can run ~60-120s.
// Without this the function is killed early and the browser gets a white screen.
export const maxDuration = 300;

export async function GET(req: Request) {
  try {
    return await handle(req);
  } catch (err) {
    // Surface the real failure as text instead of a blank/white page.
    const msg = err instanceof Error ? `${err.message}\n${err.stack ?? ""}` : String(err);
    console.error("[report-pdf] fatal:", msg);
    return new Response(`report-pdf error:\n${msg}`, {
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}

async function handle(req: Request) {
  const session = await auth();
  if (!isAdminEmail(session?.user?.email)) {
    return new Response("not found", { status: 404 });
  }

  const url = new URL(req.url);
  const username = url.searchParams.get("u");
  const debug = url.searchParams.get("debug") === "1";
  const locale = normalizeUserLocale(url.searchParams.get("lang"));

  // Resolve a chart: by username, else the most recent chart on file.
  let userId: string | null = null;
  if (username) {
    const [p] = await db
      .select({ userId: profiles.userId })
      .from(profiles)
      .where(eq(profiles.username, username))
      .limit(1);
    userId = p?.userId ?? null;
    if (!userId) return new Response(`no profile @${username}`, { status: 404 });
  }

  const [chartRow] = userId
    ? await db.select().from(charts).where(eq(charts.userId, userId)).limit(1)
    : await db.select().from(charts).limit(1);

  if (!chartRow) return new Response("no chart found", { status: 404 });

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, chartRow.userId))
    .limit(1);
  const [user] = await db
    .select({ name: users.name })
    .from(users)
    .where(eq(users.id, chartRow.userId))
    .limit(1);

  const chart = chartRow.data;
  const salience = computeChartSalience(chart);

  const firstName = user?.name?.split(" ")[0] ?? null;

  // Georgian keeps the deep AI/library report path. English is assembled
  // deterministically from the exact chart so no Georgian cache can leak.
  const t0 = Date.now();
  const content =
    locale === "en"
      ? buildEnglishNatalReportContent(chart, salience, firstName)
      : await generateNatalReport({ firstName, chart, salience });
  const genMs = Date.now() - t0;

  if (debug) {
    return Response.json({
      genMs,
      hasKey: Boolean(process.env.OPENROUTER_API_KEY),
      narrative: {
        standout: content.narrative?.standout?.length ?? 0,
        signature: Boolean(content.narrative?.signature),
        balance: Boolean(content.narrative?.balance),
        strengths: Boolean(content.narrative?.strengths),
        growth: Boolean(content.narrative?.growth),
        closing: Boolean(content.narrative?.closing),
      },
      planets: content.planets ? Object.keys(content.planets).length : 0,
      houses: content.houses ? content.houses.length : 0,
      aspects: content.aspects ? content.aspects.length : 0,
    });
  }

  const tRender = Date.now();
  const buffer = await renderToBuffer(
    NatalReport({
      data: {
        name: firstName,
        birth: {
          date: profile?.dateOfBirth ?? "",
          time: profile?.timeOfBirth ? profile.timeOfBirth.slice(0, 5) : null,
          place: profile?.cityName ?? "",
        },
        chart,
        salience,
        content,
        locale,
      },
    })
  );

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="natal-${username ?? "sample"}.pdf"`,
      "X-Gen-Ms": String(genMs),
      "X-Render-Ms": String(Date.now() - tRender),
    },
  });
}
