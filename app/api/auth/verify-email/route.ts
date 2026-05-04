import { NextResponse } from "next/server";

import { verifyEmailToken } from "@/actions/auth";

export const runtime = "nodejs";

/**
 * Inbound link from the verification email. We process server-side and
 * redirect to /login with a query flag the page picks up to render a
 * one-time success/failure banner.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") ?? "";
  const result = await verifyEmailToken(token);

  const redirect = new URL("/login", url.origin);
  if (result.ok) {
    redirect.searchParams.set("verified", "1");
  } else {
    redirect.searchParams.set("verify_error", result.error);
  }
  return NextResponse.redirect(redirect);
}
