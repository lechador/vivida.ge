import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { charts, profiles, reminderSettings, users } from "@/db/schema";
import { normalizeUserLocale } from "@/lib/i18n/user-locale";
import { computeTiming } from "@/lib/timing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function icsText(value: string): string {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll("\n", "\\n")
    .replaceAll(",", "\\,")
    .replaceAll(";", "\\;");
}

function compactDate(iso: string): string {
  return iso.replaceAll("-", "");
}

function nextDay(iso: string): string {
  const date = new Date(`${iso}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return compactDate(date.toISOString().slice(0, 10));
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  if (!/^[a-f0-9]{64}$/i.test(token))
    return new Response("not found", { status: 404 });

  const [row] = await db
    .select({
      userId: reminderSettings.userId,
      locale: users.interfaceLanguage,
      timezone: profiles.timezone,
      chart: charts.data,
    })
    .from(reminderSettings)
    .innerJoin(users, eq(users.id, reminderSettings.userId))
    .innerJoin(profiles, eq(profiles.userId, reminderSettings.userId))
    .innerJoin(charts, eq(charts.userId, reminderSettings.userId))
    .where(
      and(
        eq(reminderSettings.calendarToken, token),
        eq(reminderSettings.calendarEnabled, true),
      ),
    )
    .limit(1);
  if (!row) return new Response("not found", { status: 404 });

  const locale = normalizeUserLocale(row.locale);
  const timing = computeTiming(
    row.chart,
    new Date(),
    row.timezone ?? "Asia/Tbilisi",
    90,
    locale,
  );
  const calendarName =
    locale === "ka"
      ? "Vivida, მნიშვნელოვანი ტრანზიტები"
      : "Vivida, important transits";
  const nowStamp = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
  const events = timing.notable.map((item) =>
    [
      "BEGIN:VEVENT",
      `UID:${item.dateIso}-${item.transit}-${item.natal}-${item.kind}@vivida.ge`,
      `DTSTAMP:${nowStamp}`,
      `DTSTART;VALUE=DATE:${compactDate(item.dateIso)}`,
      `DTEND;VALUE=DATE:${nextDay(item.dateIso)}`,
      `SUMMARY:${icsText(item.title)}`,
      `DESCRIPTION:${icsText(`${item.meaning}\n\n${locale === "ka" ? "დეტალები: https://www.vivida.ge/timing" : "Details: https://www.vividaastro.com/timing"}`)}`,
      `URL:${locale === "ka" ? "https://www.vivida.ge/timing" : "https://www.vividaastro.com/timing"}`,
      "END:VEVENT",
    ].join("\r\n"),
  );

  const body = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Vivida//Personal Astrology Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${icsText(calendarName)}`,
    `X-WR-TIMEZONE:${icsText(row.timezone ?? "Asia/Tbilisi")}`,
    ...events,
    "END:VCALENDAR",
    "",
  ].join("\r\n");

  return new Response(body, {
    headers: {
      "content-type": "text/calendar; charset=utf-8",
      "content-disposition": "inline; filename=vivida-personal-calendar.ics",
      "cache-control": "private, no-store",
    },
  });
}
