import { describe, expect, it } from "vitest";

import {
  articleLd,
  escapeJsonLd,
  inLanguageFor,
  jsonLdString,
  serializeLd,
} from "@/lib/seo/jsonld";

describe("JSON-LD escaping", () => {
  const evil = { name: "</script><script>alert(1)</script>" };

  it("never emits a raw < from serializeLd", () => {
    const out = serializeLd(evil);
    expect(out).not.toContain("<");
    expect(out).not.toContain("</script>");
    expect(JSON.parse(out)).toEqual(evil);
  });

  it("never emits a raw < from jsonLdString / escapeJsonLd", () => {
    expect(jsonLdString(evil)).not.toContain("<");
    expect(escapeJsonLd('{"a":"<b>"}')).toBe('{"a":"\\u003cb>"}');
    expect(JSON.parse(jsonLdString(evil))).toEqual(evil);
  });
});

describe("inLanguageFor", () => {
  it.each([
    ["https://www.vivida.ge/horoskopi", "ka-GE"],
    ["https://www.vividaastro.com/daily-horoscope", "en"],
    ["https://www.vividaastro.com/pl", "pl"],
    ["https://www.vividaastro.com/pl/horoskop-dzienny", "pl"],
    ["https://www.vividaastro.com/plan", "en"],
    ["not a url", "ka-GE"],
  ])("%s -> %s", (url, lang) => {
    expect(inLanguageFor(url)).toBe(lang);
  });

  it("articleLd uses pl for Polish URLs", () => {
    const ld = articleLd({
      url: "https://www.vividaastro.com/pl/sennik",
      headline: "h",
      description: "d",
    });
    expect(ld.inLanguage).toBe("pl");
  });
});
