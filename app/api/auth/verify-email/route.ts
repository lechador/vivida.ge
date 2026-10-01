import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Inbound link from the verification email. Opening the link alone must not
 * activate an account with a password possibly chosen by a preregistration
 * attacker (or by a mail scanner). Hand the token to a short-lived HttpOnly
 * cookie and let the inbox owner set the final password on /verify-email.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") ?? "";
  const response = NextResponse.redirect(new URL("/verify-email", url.origin));
  response.headers.set("Cache-Control", "no-store");
  if (/^[0-9a-f]{64}$/i.test(token)) {
    response.cookies.set("vivida_email_verify", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/verify-email",
      maxAge: 24 * 60 * 60,
    });
  } else {
    response.cookies.set("vivida_email_verify", "", {
      path: "/verify-email",
      maxAge: 0,
    });
  }
  return response;
}
