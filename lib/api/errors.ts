import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { fail } from "./respond";

/**
 * Typed error for mobile API handlers. Throw it from anywhere in a
 * request's call stack and `handle()` converts it to a clean JSON
 * response with the right status — no need to thread NextResponse
 * objects back up through helper functions.
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    /** Extra response headers, e.g. Retry-After on a 429. */
    public headers?: Record<string, string>
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Wraps a route handler body so every `/api/v1` route gets uniform error
 * handling: ApiError → its status, ZodError → 422 validation_error,
 * anything else → logged 500 (never leaks internals to the client).
 *
 *   export async function POST(req: Request) {
 *     return handle(async () => { ... });
 *   }
 */
export async function handle(
  fn: () => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof ApiError) {
      return fail(err.status, err.code, err.message, err.headers);
    }
    if (err instanceof ZodError) {
      return fail(
        422,
        "validation_error",
        err.issues[0]?.message ?? "Invalid request body"
      );
    }
    console.error("[api/v1] unhandled error:", err);
    return fail(500, "internal_error", "Something went wrong");
  }
}
