import { describe, expect, it } from "vitest";

import {
  internationalInternalPath,
  internationalPublicPath,
  isInternationalCleanPath,
  isInternationalLegacyPath,
} from "@/lib/seo/public-paths";
import { localeHref, withArmenianPrefix } from "@/lib/i18n/armenian-routes";
import { serializeLd } from "@/lib/seo/jsonld";

describe("international public URL vocabulary", () => {
  it.each([
    ["/astrologiuri-kalendari", "/astrology-calendar"],
    [
      "/astrologiuri-kalendari/2026-08-18",
      "/astrology-calendar/2026-08-18",
    ],
    ["/chinuri-horoskopi/monkey", "/chinese-zodiac/monkey"],
    ["/horoskopi/kvireuli", "/weekly-horoscope"],
    [
      "/zodiac/aquarius/momavali-tvis-horoskopi",
      "/zodiac/aquarius/next-month-horoscope",
    ],
    ["/astrologiuri-saxlebi/6", "/astrology-houses/6"],
    ["/zodiac/amomavali", "/zodiac/rising-sign"],
    ["/zodiac/amomavali/cancer", "/zodiac/rising-sign/cancer"],
    [
      "/zodiac/tavsebadoba/aries-leo",
      "/zodiac/compatibility/aries-leo",
    ],
  ])("maps %s to %s and back without a chain", (legacy, clean) => {
    expect(internationalPublicPath(legacy)).toBe(clean);
    expect(internationalInternalPath(clean)).toBe(legacy);
    expect(isInternationalLegacyPath(legacy)).toBe(true);
    expect(isInternationalCleanPath(clean)).toBe(true);
    expect(internationalPublicPath(clean)).toBe(clean);
    expect(internationalInternalPath(legacy)).toBe(legacy);
  });

  it("keeps Georgian routes internal while publishing clean EN and AM links", () => {
    expect(localeHref("/astrologiuri-kalendari", "ka")).toBe(
      "/astrologiuri-kalendari",
    );
    expect(localeHref("/astrologiuri-kalendari", "en")).toBe(
      "/astrology-calendar",
    );
    expect(localeHref("/astrologiuri-kalendari", "am")).toBe(
      "/am/astrology-calendar",
    );
    expect(withArmenianPrefix("/am/astrologiuri-kalendari/2026-08-18")).toBe(
      "/am/astrology-calendar/2026-08-18",
    );
  });

  it("consolidates legacy compatibility hubs without shadowing the core route", () => {
    expect(internationalPublicPath("/tavsebadoba")).toBe("/compatibility");
    expect(internationalPublicPath("/zodiac/tavsebadoba")).toBe(
      "/compatibility",
    );
    expect(internationalInternalPath("/compatibility")).toBe(
      "/compatibility",
    );
    expect(localeHref("/zodiac/tavsebadoba", "am")).toBe(
      "/am/compatibility",
    );
  });

  it("preserves query strings and fragments while translating the pathname", () => {
    expect(internationalPublicPath("/zodiac/datit?month=8#picker")).toBe(
      "/zodiac/dates?month=8#picker",
    );
    expect(internationalInternalPath("/zodiac/dates?month=8#picker")).toBe(
      "/zodiac/datit?month=8#picker",
    );
    expect(localeHref("/sizmris-akhsna?query=water", "am")).toBe(
      "/am/dream-meanings?query=water",
    );
  });

  it("publishes clean English and Armenian URLs inside JSON-LD", () => {
    const json = serializeLd({
      english: "https://www.vividaastro.com/astrologiuri-kalendari/2026-08-18",
      armenian: "https://www.vividaastro.com/am/mtvaris-kalendari",
      georgian: "https://www.vivida.ge/astrologiuri-kalendari",
    });

    expect(JSON.parse(json)).toEqual({
      english: "https://www.vividaastro.com/astrology-calendar/2026-08-18",
      armenian: "https://www.vividaastro.com/am/moon-calendar",
      georgian: "https://www.vivida.ge/astrologiuri-kalendari",
    });
  });

  it("keeps the Search Console canonical examples on clean Armenian URLs", () => {
    expect(withArmenianPrefix("/zodiac/amomavali")).toBe(
      "/am/zodiac/rising-sign",
    );
    expect(withArmenianPrefix("/zodiac/tavsebadoba/aries-scorpio")).toBe(
      "/am/zodiac/compatibility/aries-scorpio",
    );
  });
});
