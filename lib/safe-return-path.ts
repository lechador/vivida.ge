/** Accept only an internal, user-facing path for checkout return navigation. */
export function normalizeReturnPath(value: unknown, fallback = "/dashboard"): string {
  if (typeof value !== "string" || value.length === 0 || value.length > 600) return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\") || /[\u0000-\u001f]/.test(value)) return fallback;
  try {
    const parsed = new URL(value, "https://vivida.invalid");
    if (
      parsed.origin !== "https://vivida.invalid" ||
      parsed.pathname === "/api" ||
      parsed.pathname.startsWith("/api/")
    ) return fallback;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}

export function contextualCreditsHref(opts: {
  returnTo: string;
  need: number;
  product: string;
  packId?: string | null;
}): string {
  const query = new URLSearchParams({
    next: normalizeReturnPath(opts.returnTo),
    need: String(Math.max(1, Math.round(opts.need))),
    product: opts.product.slice(0, 60),
  });
  if (opts.packId && /^(s|m|l)$/.test(opts.packId)) {
    query.set("pack", opts.packId);
  }
  return `/credits?${query.toString()}#credit-packs`;
}
