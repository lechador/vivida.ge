export function normalizeReturnPath(
  path: string | null | undefined,
  fallback: string = "/dashboard",
): string {
  if (!path || typeof path !== "string") return fallback;
  const trimmed = path.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return fallback;
  return trimmed;
}

export function contextualCreditsHref(returnTo?: string | null): string {
  const safe = normalizeReturnPath(returnTo, "");
  if (!safe) return "/credits";
  return `/credits?returnTo=${encodeURIComponent(safe)}`;
}
