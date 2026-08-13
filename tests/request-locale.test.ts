import { describe, expect, it } from "vitest";

import { localeForHost } from "@/lib/i18n/request-locale";

describe("localeForHost", () => {
  it("always serves English on the international domain", () => {
    expect(localeForHost("vividaastro.com", "ka")).toBe("en");
    expect(localeForHost("www.vividaastro.com:443", "ka")).toBe("en");
  });

  it("retains an explicit preference on non-English hosts", () => {
    expect(localeForHost("www.vivida.ge", "en")).toBe("en");
    expect(localeForHost("www.vivida.ge", "ka")).toBe("ka");
  });

  it("defaults unknown and missing preferences to Georgian", () => {
    expect(localeForHost("localhost:3000")).toBe("ka");
    expect(localeForHost(null, "fr")).toBe("ka");
  });
});
