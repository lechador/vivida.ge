import { describe, expect, it } from "vitest";

import { contextualCreditsHref, normalizeReturnPath } from "@/lib/safe-return-path";

describe("checkout return paths", () => {
  it("preserves internal content paths", () => {
    expect(normalizeReturnPath("/synastry/abc?tab=deep#result")).toBe("/synastry/abc?tab=deep#result");
  });

  it("rejects external and API targets", () => {
    expect(normalizeReturnPath("https://evil.example/path")).toBe("/dashboard");
    expect(normalizeReturnPath("//evil.example/path")).toBe("/dashboard");
    expect(normalizeReturnPath("/api")).toBe("/dashboard");
    expect(normalizeReturnPath("/api/admin")).toBe("/dashboard");
  });

  it("builds a contextual credits link", () => {
    expect(contextualCreditsHref({ returnTo: "/taro", need: 10, product: "tarot" }))
      .toBe("/credits?next=%2Ftaro&need=10&product=tarot#credit-packs");
    expect(contextualCreditsHref({
      returnTo: "/taro",
      need: 10,
      product: "tarot",
      packId: "s",
    })).toBe(
      "/credits?next=%2Ftaro&need=10&product=tarot&pack=s#credit-packs",
    );
  });
});
