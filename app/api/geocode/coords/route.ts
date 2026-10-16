import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { timezoneForCoordinates, validateCoordinates } from "@/lib/geocoding";

/**
 * Resolve a timezone for manually entered birth coordinates.
 *
 * The safety valve for the onboarding birthplace step. The primary path searches
 * a geocoder, but that is a network dependency and a birthplace absent from the
 * geocoder used to be a hard dead end on the last step before the user would see
 * their chart. A chart needs a real timezone, so this resolves one from the
 * coordinates instead of guessing.
 *
 * Auth-gated: it is only used mid-onboarding and should not be a public proxy.
 */
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const checked = validateCoordinates(
    searchParams.get("lat") ?? "",
    searchParams.get("lon") ?? "",
  );
  if (!checked.ok) {
    return NextResponse.json({ error: checked.reason }, { status: 400 });
  }

  const timezone = await timezoneForCoordinates(
    checked.latitude,
    checked.longitude,
  );
  if (!timezone) {
    return NextResponse.json(
      { error: "timezone_unavailable" },
      { status: 502 },
    );
  }

  return NextResponse.json({
    latitude: checked.latitude,
    longitude: checked.longitude,
    timezone,
  });
}
