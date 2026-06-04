import type { ZodType } from "zod";

/**
 * Parse and validate a JSON request body against a Zod schema. A missing
 * or malformed body is treated as `{}` so the schema produces a clean
 * 422 (via the ZodError path in handle()) instead of a raw JSON.parse
 * crash.
 */
export async function parseBody<T>(
  req: Request,
  schema: ZodType<T>
): Promise<T> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    raw = {};
  }
  return schema.parse(raw);
}
