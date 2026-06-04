import { NextResponse } from "next/server";

/**
 * CORS for the mobile API.
 *
 * `/api/v1` is a bearer-token API with no cookie/session auth, so allowing
 * any origin carries no CSRF risk (there are no ambient credentials for a
 * malicious page to ride on). This lets the Flutter *web* build — and any
 * future browser client — call the API cross-origin. Native iOS/Android
 * requests aren't subject to CORS at all, so this is purely a web concern.
 */
export const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
  "Access-Control-Max-Age": "86400",
};

/** Header added to every actual (non-preflight) response. */
export const CORS_ORIGIN: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
};

/**
 * Shared preflight handler. Each `/api/v1` route re-exports this:
 *   export { OPTIONS } from "@/lib/api/cors";
 */
export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
