import { describe, expect, it } from "vitest";

import { USERNAME_PATTERN, suggestUsername } from "@/lib/profile-utils";

/**
 * Every user gets a username at signup (lib/username.ts), and the handle is
 * derived from their name by suggestUsername. Most Vivida users write their
 * name in Georgian, so the transliteration is what keeps those handles from
 * all collapsing to the same meaningless `user_1234`.
 */
describe("suggestUsername", () => {
  it("always produces a handle the validators accept", () => {
    const names = [
      "თაკო",
      "Giorgi Uertashvili",
      "Ana",
      "ნიკოლოზ ჯავახიშვილი",
      "Zoë",
      "!!!",
      "",
      null,
      undefined,
      "a".repeat(200),
    ];
    for (const name of names) {
      expect(suggestUsername(name)).toMatch(USERNAME_PATTERN);
    }
  });

  it("transliterates Georgian instead of falling back to 'user'", () => {
    expect(suggestUsername("თაკო")).toMatch(/^tako_\d{4}$/);
    expect(suggestUsername("ნათია")).toMatch(/^natia_\d{4}$/);
    expect(suggestUsername("სოფიკო")).toMatch(/^sopiko_\d{4}$/);
    // Mixed scripts slug together rather than dropping the Georgian half.
    expect(suggestUsername("Nino ჯავახი")).toMatch(/^nino_javakhi_\d{4}$/);
  });

  it("falls back to 'user' only when nothing sluggable is left", () => {
    expect(suggestUsername("!!!")).toMatch(/^user_\d{4}$/);
    expect(suggestUsername(null)).toMatch(/^user_\d{4}$/);
  });

  it("never leaves a trailing separator when the name is truncated", () => {
    // 14-char slice used to land mid-separator, e.g. "aaaaaaaaaaaaa_" + suffix.
    expect(suggestUsername("aaaaaaaaaaaaa bbbb")).toMatch(/^a{13}_\d{4}$/);
  });
});
