import { isSensitiveTokenUrl } from "./sensitive-routes";

/** Remove URL query and fragment data from Sentry payload strings, including breadcrumbs and spans. */
function redactUrlText(value: string): string {
  return value
    .replace(/https?:\/\/[^\s"'<>)}\],;]+/gi, (candidate) => {
      try {
        const url = new URL(candidate);
        url.search = "";
        url.hash = "";
        return url.toString();
      } catch {
        return candidate;
      }
    })
    .replace(
      /\/(?:[\w-]+\/)*[\w-]+[?#][^\s"'<>)}\],;]+/g,
      (candidate) => candidate.split(/[?#]/, 1)[0],
    );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return (
    value !== null &&
    typeof value === "object" &&
    (Object.getPrototypeOf(value) === Object.prototype ||
      Object.getPrototypeOf(value) === null)
  );
}

function scrub(value: unknown, seen: WeakMap<object, unknown>): unknown {
  if (typeof value === "string") return redactUrlText(value);
  if (Array.isArray(value)) {
    if (seen.has(value)) return seen.get(value);
    const result: unknown[] = [];
    seen.set(value, result);
    for (const item of value) result.push(scrub(item, seen));
    return result;
  }
  if (!isRecord(value)) return value;
  if (seen.has(value)) return seen.get(value);
  const result: Record<string, unknown> = {};
  seen.set(value, result);
  for (const [key, item] of Object.entries(value)) {
    result[key] = /token|authorization|cookie|secret/i.test(key)
      ? "[redacted]"
      : scrub(item, seen);
  }
  return result;
}

/**
 * Suppress events from token routes, then remove token URLs retained in later
 * ordinary-page events (Referer headers, breadcrumbs, spans, and stack frames).
 */
export function sanitizeSentryEvent<T extends object>(
  event: T,
  currentUrl?: string,
): T | null {
  const details = event as { request?: { url?: string }; transaction?: string };
  if (
    (currentUrl && isSensitiveTokenUrl(currentUrl)) ||
    (details.request?.url &&
      isSensitiveTokenUrl(details.request.url, "https://vivida.ge")) ||
    (details.transaction &&
      isSensitiveTokenUrl(details.transaction, "https://vivida.ge"))
  )
    return null;
  return scrub(event, new WeakMap()) as T;
}

/** Sentry can run this hook for child spans separately from transaction events. */
export function sanitizeSentrySpan<T extends object>(span: T): T {
  return scrub(span, new WeakMap()) as T;
}
