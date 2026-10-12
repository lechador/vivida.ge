import { describe, expect, it } from "vitest";

import {
  ENGLISH_LEGACY_CONTENT_REDIRECTS,
  ENGLISH_PUBLIC_ROUTES,
  ENGLISH_SITE_URL,
} from "@/lib/seo/locales";
import { isInternationalCleanPath } from "@/lib/seo/public-paths";

/**
 * Lock for the Georgian↔English duplicate-content contract.
 *
 * Each entry keeps a Georgian keyword URL intact on vivida.ge while
 * consolidating the same path on the English host onto one canonical English
 * URL. If a new overlapping page is added without an entry here, the English
 * host serves two self-canonicalising copies competing for the same query,
 * exactly what this list exists to prevent.
 *
 * Behavior per entry (EN 308 / GE 200 + Georgian copy) is asserted in
 * e2e/locale-routing.spec.ts; this file guards the list's own consistency.
 */
describe("English legacy content redirects", () => {
  const publicEn = new Set(ENGLISH_PUBLIC_ROUTES.map((r) => r.en));

  it("consolidates onto real English public routes", () => {
    expect(ENGLISH_LEGACY_CONTENT_REDIRECTS.length).toBeGreaterThan(0);
    for (const { source, destination } of ENGLISH_LEGACY_CONTENT_REDIRECTS) {
      expect(source.startsWith("/")).toBe(true);
      expect(destination.startsWith("/")).toBe(true);
      expect(destination, `${source} must differ from its target`).not.toBe(
        source,
      );
      // Either a listed public route (/natal-chart) or a clean alias the
      // proxy rewrites onto the shared tree (/tarot → /taro). Anything else
      // would consolidate onto a 404.
      const listed = publicEn.has(
        destination as (typeof ENGLISH_PUBLIC_ROUTES)[number]["en"],
      );
      const aliased = isInternationalCleanPath(destination);
      expect(
        listed || aliased,
        `${source} consolidates onto ${destination}, which is not a servable English URL`,
      ).toBe(true);
    }
  });

  it("has no duplicate sources", () => {
    const sources = ENGLISH_LEGACY_CONTENT_REDIRECTS.map((r) => r.source);
    expect(new Set(sources).size).toBe(sources.length);
  });

  it("resolves to absolute canonical English URLs", () => {
    for (const { source, destination } of ENGLISH_LEGACY_CONTENT_REDIRECTS) {
      expect(`${ENGLISH_SITE_URL}${destination}`).toMatch(
        /^https:\/\/www\.vividaastro\.com\//,
      );
      expect(source).not.toMatch(/^\/en\//);
    }
  });
});
