import { NextResponse } from "next/server";

import { CORS_ORIGIN } from "./cors";

/**
 * JSON response helpers for the mobile API (`/api/v1/*`).
 *
 * Success responses return the payload directly. Errors always use a
 * stable envelope `{ error: { code, message } }` so the Flutter client
 * can switch on `code` (e.g. "email_not_verified") and localize the
 * message itself — the human-readable `message` is a fallback, not the
 * source of truth for UX.
 *
 * Every response carries the CORS origin header so browser clients
 * (Flutter web) can read it; preflight is handled by lib/api/cors.ts.
 */
export function ok(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: CORS_ORIGIN });
}

export function fail(
  status: number,
  code: string,
  message: string,
  headers?: Record<string, string>
) {
  return NextResponse.json(
    { error: { code, message } },
    { status, headers: { ...CORS_ORIGIN, ...headers } }
  );
}
