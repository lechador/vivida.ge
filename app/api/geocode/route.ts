import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { searchPlaces } from "@/lib/geocoding";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";

  try {
    const results = await searchPlaces(query);
    return NextResponse.json({ results });
  } catch (err) {
    console.error("geocode error", err);
    return NextResponse.json(
      { error: "geocoding_failed" },
      { status: 502 }
    );
  }
}
