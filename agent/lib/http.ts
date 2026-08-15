const DEFAULT_TIMEOUT_MS = 20_000;

function safeResponseExcerpt(value: string): string {
  return value
    .slice(0, 400)
    .replace(/[A-Za-z0-9_\-.]{48,}/g, "[redacted]");
}

export async function fetchJson<T>(
  url: string | URL,
  init: RequestInit = {},
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<T> {
  const timeoutSignal = AbortSignal.timeout(timeoutMs);
  const signal = init.signal
    ? AbortSignal.any([init.signal, timeoutSignal])
    : timeoutSignal;
  const response = await fetch(url, { ...init, signal });
  const body = await response.text();

  if (!response.ok) {
    throw new Error(
      `HTTP ${response.status} from ${new URL(url).hostname}: ${safeResponseExcerpt(body)}`,
    );
  }

  try {
    return JSON.parse(body) as T;
  } catch {
    throw new Error(
      `Invalid JSON from ${new URL(url).hostname}: ${safeResponseExcerpt(body)}`,
    );
  }
}

export function safeIntegrationError(error: unknown): string {
  if (error instanceof Error) return safeResponseExcerpt(error.message);
  return "Unknown integration error";
}
