import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { auth } from "@/auth";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { MINIMUM_AGE_YEARS } from "@/lib/profile-core";
import { ageFromDob } from "@/lib/profile-utils";
import { ensureChartFor } from "@/actions/chart";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function isValidCalendarDate(value: string): boolean {
  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(5, 7));
  const day = Number(value.slice(8, 10));
  const currentYear = new Date().getUTCFullYear();
  if (year < 1900 || year > currentYear) return false;
  if (month < 1 || month > 12) return false;
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return day >= 1 && day <= daysInMonth;
}

/**
 * POST /api/profile/birth-date, saves a birth date for users who signed up
 * without one (e.g. via /taro or /ask inline prompt). Fills Tbilisi location
 * defaults when missing so ensureChartFor can compute their natal chart.
 */
export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as {
    dateOfBirth?: unknown;
  } | null;
  const dateOfBirth =
    typeof body?.dateOfBirth === "string" ? body.dateOfBirth : "";

  if (!DATE_RE.test(dateOfBirth) || !isValidCalendarDate(dateOfBirth)) {
    return NextResponse.json(
      { ok: false, error: "დაბადების თარიღი არასწორია" },
      { status: 400 },
    );
  }

  const age = ageFromDob(dateOfBirth);
  if (age !== null && age < MINIMUM_AGE_YEARS) {
    return NextResponse.json(
      {
        ok: false,
        error: `Vivida-ს გამოყენება ${MINIMUM_AGE_YEARS} წლიდან არის შესაძლებელი`,
      },
      { status: 400 },
    );
  }

  const [existing] = await db
    .select({
      dateOfBirth: profiles.dateOfBirth,
      cityName: profiles.cityName,
      latitude: profiles.latitude,
      longitude: profiles.longitude,
      timezone: profiles.timezone,
    })
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1);

  // Birth date is locked after the first save, reuse the stored value when
  // one exists.
  const lockedDate = existing?.dateOfBirth ?? dateOfBirth;

  await db
    .insert(profiles)
    .values({
      userId,
      dateOfBirth: lockedDate,
      cityName: existing?.cityName ?? "Tbilisi",
      latitude: existing?.latitude ?? 41.7151,
      longitude: existing?.longitude ?? 44.8271,
      timezone: existing?.timezone ?? "Asia/Tbilisi",
    })
    .onConflictDoUpdate({
      target: profiles.userId,
      set: {
        dateOfBirth: lockedDate,
        ...(existing?.cityName ? {} : { cityName: "Tbilisi" }),
        ...(existing?.latitude != null ? {} : { latitude: 41.7151 }),
        ...(existing?.longitude != null ? {} : { longitude: 44.8271 }),
        ...(existing?.timezone ? {} : { timezone: "Asia/Tbilisi" }),
        updatedAt: new Date(),
      },
    });

  await ensureChartFor(userId);

  return NextResponse.json({ ok: true, dateOfBirth: lockedDate });
}
