import { describe, expect, it } from "vitest";

import {
  internationalInternalPath,
  internationalPublicPath,
  isInternationalCleanPath,
  isInternationalLegacyPath,
  localizedHref,
} from "@/lib/seo/public-paths";
import { serializeLd } from "@/lib/seo/jsonld";

describe("international public URL vocabulary", () => {
  it.each([
    ["/astrologiuri-kalendari", "/astrology-calendar"],
    ["/astrologiuri-kalendari/2026-08-18", "/astrology-calendar/2026-08-18"],
    ["/chinuri-horoskopi/monkey", "/chinese-zodiac/monkey"],
    ["/horoskopi/kvireuli", "/weekly-horoscope"],
    [
      "/zodiac/aquarius/momavali-tvis-horoskopi",
      "/zodiac/aquarius/next-month-horoscope",
    ],
    ["/astrologiuri-saxlebi/6", "/astrology-houses/6"],
    ["/zodiac/amomavali", "/zodiac/rising-sign"],
    ["/zodiac/amomavali/cancer", "/zodiac/rising-sign/cancer"],
    ["/zodiac/tavsebadoba/aries-leo", "/zodiac/compatibility/aries-leo"],
  ])("maps %s to %s and back without a chain", (legacy, clean) => {
    expect(internationalPublicPath(legacy)).toBe(clean);
    expect(internationalInternalPath(clean)).toBe(legacy);
    expect(isInternationalLegacyPath(legacy)).toBe(true);
    expect(isInternationalCleanPath(clean)).toBe(true);
    expect(internationalPublicPath(clean)).toBe(clean);
    expect(internationalInternalPath(legacy)).toBe(legacy);
  });

  it("keeps Georgian routes internal while publishing clean EN links", () => {
    expect(localizedHref("/astrologiuri-kalendari", "ka")).toBe(
      "/astrologiuri-kalendari",
    );
    expect(localizedHref("/astrologiuri-kalendari", "en")).toBe(
      "/astrology-calendar",
    );
    expect(localizedHref("/astrologiuri-kalendari/2026-08-18", "en")).toBe(
      "/astrology-calendar/2026-08-18",
    );
  });

  it("consolidates legacy compatibility hubs without shadowing the core route", () => {
    expect(internationalPublicPath("/tavsebadoba")).toBe("/compatibility");
    expect(internationalPublicPath("/zodiac/tavsebadoba")).toBe(
      "/compatibility",
    );
    expect(internationalInternalPath("/compatibility")).toBe("/compatibility");
  });

  it("preserves query strings and fragments while translating the pathname", () => {
    expect(internationalPublicPath("/zodiac/datit?month=8#picker")).toBe(
      "/zodiac/dates?month=8#picker",
    );
    expect(internationalInternalPath("/zodiac/dates?month=8#picker")).toBe(
      "/zodiac/datit?month=8#picker",
    );
  });

  it("publishes clean English URLs inside JSON-LD", () => {
    const json = serializeLd({
      english: "https://www.vividaastro.com/astrologiuri-kalendari/2026-08-18",
      georgian: "https://www.vivida.ge/astrologiuri-kalendari",
    });

    expect(JSON.parse(json)).toEqual({
      english: "https://www.vividaastro.com/astrology-calendar/2026-08-18",
      georgian: "https://www.vivida.ge/astrologiuri-kalendari",
    });
  });

  it("keeps the Search Console canonical examples on clean English URLs", () => {
    expect(localizedHref("/zodiac/amomavali", "en")).toBe(
      "/zodiac/rising-sign",
    );
    expect(localizedHref("/zodiac/tavsebadoba/aries-scorpio", "en")).toBe(
      "/zodiac/compatibility/aries-scorpio",
    );
  });
});
