import { describe, expect, it } from "vitest";

import { ALL_DREAM_SLUGS } from "@/lib/seo/dreams";
import {
  ALL_DREAM_PL_SLUGS,
  ALL_EQ_PL_SLUGS,
  ALL_PLANET_PL_SLUGS,
  DREAM_EN_SLUGS,
  dreamPublicSlug,
  eqPublicSlug,
  planetPublicSlug,
  resolveDreamSlug,
  resolveEqSlug,
  resolvePlanetSlug,
} from "@/lib/seo/en-slugs";
import {
  DREAMS_FAQ_PL,
  DREAMS_HUB_PL,
  DREAM_PL_BY_SLUG,
  DREAM_SYMBOLS_PL,
} from "@/lib/seo/dreams-pl";
import { LIFE_PATH_NUMBERS } from "@/lib/numerology";
import {
  LIFE_PATH_CONTENT_PL,
  NUMEROLOGY_FAQ_PL,
  NUMEROLOGY_HUB_PL,
} from "@/lib/seo/numerology-content-pl";
import {
  ANGEL_FAQ_PL,
  ANGEL_HUB_PL,
  ANGEL_NUMBERS_PL,
  ANGEL_PL_BY_SLUG,
} from "@/lib/seo/angel-numbers-pl";
import { ALL_SLUGS } from "@/lib/seo/zodiac-dates";
import { ZODIAC_HUB_PL, ZODIAC_SIGN_PL } from "@/lib/seo/zodiac-sign-pl";

describe("Stage 5B: Polish Slugs & Resolvers", () => {
  it("has valid Polish slugs for all dream symbols", () => {
    expect(DREAM_EN_SLUGS.length).toBe(66);
    expect(ALL_DREAM_PL_SLUGS.length).toBe(66);
    const plSet = new Set(ALL_DREAM_PL_SLUGS);
    expect(plSet.size).toBe(66);
  });

  it("resolves Polish dream slugs to Georgian internal slugs", () => {
    const isDream = (s: string) => ALL_DREAM_SLUGS.includes(s);
    expect(resolveDreamSlug("waz", "pl", isDream)).toBe("gveli");
    expect(resolveDreamSlug("woda", "pl", isDream)).toBe("wyali");
    expect(resolveDreamSlug("wypadajace-zeby", "pl", isDream)).toBe("kbili");
    expect(resolveDreamSlug("zmarla-bliska-osoba", "pl", isDream)).toBe(
      "micvalebuli",
    );
    expect(resolveDreamSlug("ciaza", "pl", isDream)).toBe("orsuloba");
  });

  it("renders Polish public slugs for dream symbols", () => {
    expect(dreamPublicSlug("gveli", "pl")).toBe("waz");
    expect(dreamPublicSlug("wyali", "pl")).toBe("woda");
    expect(dreamPublicSlug("kbili", "pl")).toBe("wypadajace-zeby");
    expect(dreamPublicSlug("micvalebuli", "pl")).toBe("zmarla-bliska-osoba");
  });

  it("resolves Polish EQ slugs and renders Polish public slugs", () => {
    expect(ALL_EQ_PL_SLUGS.length).toBe(15);
    const isEq = () => true;
    expect(
      resolveEqSlug("co-to-jest-inteligencja-emocjonalna", "pl", isEq),
    ).toBe("ra-aris-emociuri-inteleqti");
    expect(eqPublicSlug("ra-aris-emociuri-inteleqti", "pl")).toBe(
      "co-to-jest-inteligencja-emocjonalna",
    );
  });

  it("resolves Polish planet slugs and renders Polish public slugs", () => {
    expect(ALL_PLANET_PL_SLUGS.length).toBe(10);
    const isPlanet = () => true;
    expect(resolvePlanetSlug("slonce", "pl", isPlanet)).toBe("mze");
    expect(resolvePlanetSlug("ksiezyc", "pl", isPlanet)).toBe("mtvare");
    expect(resolvePlanetSlug("merkury", "pl", isPlanet)).toBe("merkuri");
    expect(resolvePlanetSlug("wenus", "pl", isPlanet)).toBe("venera");
    expect(resolvePlanetSlug("jowisz", "pl", isPlanet)).toBe("iupiteri");
    expect(planetPublicSlug("mze", "pl")).toBe("slonce");
    expect(planetPublicSlug("mtvare", "pl")).toBe("ksiezyc");
  });
});

describe("Stage 5B: Polish Dream Dictionary (Sennik)", () => {
  it("contains all 66 dream symbols in Polish", () => {
    expect(DREAM_SYMBOLS_PL.length).toBe(66);
    for (const slug of ALL_DREAM_SLUGS) {
      const item = DREAM_PL_BY_SLUG[slug];
      expect(item).toBeDefined();
      expect(item.title.length).toBeGreaterThan(0);
      expect(item.summary.length).toBeGreaterThan(0);
      expect(item.meaning.length).toBeGreaterThan(0);
      expect(item.variants.length).toBeGreaterThan(0);
      for (const v of item.variants) {
        expect(v.when.length).toBeGreaterThan(0);
        expect(v.means.length).toBeGreaterThan(0);
      }
      expect(item.positive.length).toBeGreaterThan(0);
      expect(item.caution.length).toBeGreaterThan(0);
    }
  });

  it("has valid Polish hub metadata and FAQ", () => {
    expect(DREAMS_HUB_PL.title).toContain("Sennik");
    expect(DREAMS_HUB_PL.description.length).toBeGreaterThan(20);
    expect(DREAMS_FAQ_PL.length).toBeGreaterThanOrEqual(3);
    for (const faq of DREAMS_FAQ_PL) {
      expect(faq.q.length).toBeGreaterThan(0);
      expect(faq.a.length).toBeGreaterThan(0);
    }
  });
});

describe("Stage 5B: Polish Numerology Content", () => {
  it("contains all 12 life path numbers in Polish", () => {
    for (const num of LIFE_PATH_NUMBERS) {
      const content = LIFE_PATH_CONTENT_PL[num];
      expect(content).toBeDefined();
      expect(content.archetype.length).toBeGreaterThan(0);
      expect(content.essence.length).toBeGreaterThan(0);
      expect(content.traits.length).toBeGreaterThanOrEqual(3);
      expect(content.strengths.length).toBeGreaterThan(0);
      expect(content.challenges.length).toBeGreaterThan(0);
      expect(content.love.length).toBeGreaterThan(0);
      expect(content.career.length).toBeGreaterThan(0);
      expect(content.advice.length).toBeGreaterThan(0);
    }
  });

  it("has valid Polish numerology hub and FAQ", () => {
    expect(NUMEROLOGY_HUB_PL.title).toContain("Numerologiczny");
    expect(NUMEROLOGY_FAQ_PL.length).toBeGreaterThanOrEqual(4);
  });
});

describe("Stage 5B: Polish Angel Numbers Content", () => {
  it("contains all 14 angel numbers in Polish", () => {
    expect(ANGEL_NUMBERS_PL.length).toBe(14);
    const expected = [
      "000",
      "111",
      "222",
      "333",
      "444",
      "555",
      "666",
      "777",
      "888",
      "999",
      "1010",
      "1111",
      "1212",
      "1234",
    ];
    for (const slug of expected) {
      const content = ANGEL_PL_BY_SLUG[slug];
      expect(content).toBeDefined();
      expect(content.title.length).toBeGreaterThan(0);
      expect(content.essence.length).toBeGreaterThan(0);
      expect(content.meaning.length).toBeGreaterThan(0);
      expect(content.love.length).toBeGreaterThan(0);
      expect(content.career.length).toBeGreaterThan(0);
      expect(content.action.length).toBeGreaterThan(0);
    }
  });

  it("has valid Polish angel numbers hub and FAQ", () => {
    expect(ANGEL_HUB_PL.title).toContain("Liczby Anielskie");
    expect(ANGEL_FAQ_PL.length).toBeGreaterThanOrEqual(4);
  });
});

describe("Stage 5B: Polish Zodiac Content", () => {
  it("contains all 12 zodiac signs in Polish", () => {
    for (const slug of ALL_SLUGS) {
      const sign = ZODIAC_SIGN_PL[slug];
      expect(sign).toBeDefined();
      expect(sign.tagline.length).toBeGreaterThan(0);
      expect(sign.core.length).toBeGreaterThan(0);
      expect(sign.strengths.length).toBeGreaterThanOrEqual(3);
      expect(sign.challenges.length).toBeGreaterThanOrEqual(3);
      expect(sign.love.length).toBeGreaterThan(0);
      expect(sign.career.length).toBeGreaterThan(0);
    }
  });

  it("has valid Polish zodiac hub and FAQ", () => {
    expect(ZODIAC_HUB_PL.title).toContain("Znaki Zodiaku");
    expect(ZODIAC_HUB_PL.faq.length).toBeGreaterThanOrEqual(4);
  });
});
