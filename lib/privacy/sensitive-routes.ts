/** Pages whose URL can contain an account or email-action bearer token. */
export function isSensitiveTokenPath(pathname: string): boolean {
  const path = pathname.replace(/\/$/, "");
  return (
    path === "/reset-password" ||
    path === "/unsubscribe" ||
    path === "/api/auth/verify-email"
  );
}

export function isSensitiveTokenUrl(url: string, base?: string): boolean {
  try {
    return isSensitiveTokenPath(new URL(url, base).pathname);
  } catch {
    return false;
  }
}

/** Both paths matter while Next is rendering a route transition. */
export function isSensitiveTrackingLocation(
  renderedPathname: string,
  documentPathname: string,
): boolean {
  return (
    isSensitiveTokenPath(renderedPathname) ||
    isSensitiveTokenPath(documentPathname)
  );
}
