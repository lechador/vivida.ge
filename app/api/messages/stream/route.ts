export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Retired SSE endpoint.
 *
 * HTTP 204 is deliberate: EventSource clients in tabs opened before this
 * deployment stop reconnecting when they receive it. A normal empty response
 * would make those stale clients reconnect forever.
 */
export async function GET() {
  return new Response(null, { status: 204 });
}
