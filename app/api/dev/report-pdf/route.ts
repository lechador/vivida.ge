import { eq } from "drizzle-orm";
import { renderToBuffer } from "@react-pdf/renderer";

import { auth } from "@/auth";
import { isAdminEmail } from "@/lib/admin-auth";
import { db } from "@/db";
import { charts, profiles, users } from "@/db/schema";
import { signByIndex } from "@/lib/zodiac";
import { computeChartSalience } from "@/lib/report-salience";
import { generateNatalHighlights } from "@/lib/report-content";
import { NatalReport } from "@/components/pdf/natal-report";

/**
 * Admin-only PDF generation trigger. Lets us review report OUTPUT QUALITY on a
 * real deploy before any payment is wired. Gated to the founder/admin session
 * (so it works on prod/preview but isn't public). Usage, while logged in as
 * admin:
 *   GET /api/dev/report-pdf?u=<username>            → natal PDF
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await auth();
  if (!isAdminEmail(session?.user?.email)) {
    return new Response("not found", { status: 404 });
  }

  const url = new URL(req.url);
  const username = url.searchParams.get("u");

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
  const sun = signByIndex(chart.bodies.sun.signIndex).labelKa;
  const moon = signByIndex(chart.bodies.moon.signIndex).labelKa;
  const ascendant = signByIndex(chart.ascendant.signIndex).labelKa;

  const highlights = await generateNatalHighlights({
    firstName,
    sun,
    moon,
    ascendant,
    salience,
  }).catch((err) => {
    console.warn("[report-pdf] highlights gen failed:", (err as Error).message);
    return null;
  });

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
        highlights,
        interpretation: chartRow.interpretation ?? null,
      },
    })
  );

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="natal-${username ?? "sample"}.pdf"`,
    },
  });
}
