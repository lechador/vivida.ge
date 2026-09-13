import { describe, expect, it } from "vitest";

import { authConfig } from "@/auth.config";

function providerIds(): string[] {
  return authConfig.providers.map((provider) => provider.id);
}

describe("web Apple authentication", () => {
  it("registers Apple alongside Google in the shared Auth.js config", () => {
    expect(providerIds()).toEqual(expect.arrayContaining(["google", "apple"]));
  });
});
