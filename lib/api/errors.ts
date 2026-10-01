/**
 * Typed error shared by authentication, rate limiting, and web handlers.
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    /** Extra response headers, e.g. Retry-After on a 429. */
    public headers?: Record<string, string>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
