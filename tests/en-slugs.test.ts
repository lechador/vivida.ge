import { describe, expect, it } from "vitest";

import { ALL_DREAM_SLUGS } from "@/lib/seo/dreams";
import { EQ_ARTICLE_SLUGS } from "@/lib/seo/eq-articles";
import { PLANET_SLUGS } from "@/lib/seo/astrology-guides";
import {
  ALL_DREAM_EN_SLUGS,
  ALL_DREAM_PL_SLUGS,
  ALL_EQ_EN_SLUGS,
  ALL_EQ_PL_SLUGS,
  ALL_PLANET_EN_SLUGS,
  ALL_PLANET_PL_SLUGS,
  DREAM_EN_SLUGS,
  dreamPublicSlug,
  EQ_EN_SLUGS,
  eqPublicSlug,
  PLANET_EN_SLUGS,
  planetPublicSlug,
  resolveDreamSlug,
  resolveEqSlug,
  resolvePlanetSlug,
  upgradeEnglishDetailSlug,
} from "@/lib/seo/en-slugs";

const GEORGIAN = /[\u10A0-\u10FF]/;
const ASCII_SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function checkTable(
  pairs: Array<{ ka: string; en: string; pl: string }>,
  internalSlugs: string[],
) {
  // Every internal slug gets exactly one English slug and vice versa.
  expect(pairs.map((p) => p.ka).sort()).toEqual([...internalSlugs].sort());
  const enSlugs = pairs.map((p) => p.en);
  expect(new Set(enSlugs).size).toBe(enSlugs.length);
  for (const slug of enSlugs) {
    expect(slug).toMatch(ASCII_SLUG);
    expect(slug).not.toMatch(GEORGIAN);
  }
  const plSlugs = pairs.map((p) => p.pl);
  expect(new Set(plSlugs).size).toBe(plSlugs.length);
  for (const slug of plSlugs) {
    expect(slug).toMatch(ASCII_SLUG);
    expect(slug).not.toMatch(GEORGIAN);
  }
  // Slugs must not collide with the cluster's own internal slugs.
  const internal = new Set(internalSlugs);
  for (const slug of enSlugs) expect(internal.has(slug)).toBe(false);
  for (const slug of plSlugs) expect(internal.has(slug)).toBe(false);
}

describe("Localized keyword slug tables", () => {
  it("covers every dream symbol exactly once", () => {
    checkTable(DREAM_EN_SLUGS, ALL_DREAM_SLUGS);
    expect(ALL_DREAM_EN_SLUGS).toEqual(DREAM_EN_SLUGS.map((p) => p.en));
    expect(ALL_DREAM_PL_SLUGS).toEqual(DREAM_EN_SLUGS.map((p) => p.pl));
  });

  it("covers every EQ article exactly once", () => {
    checkTable(EQ_EN_SLUGS, EQ_ARTICLE_SLUGS);
    expect(ALL_EQ_EN_SLUGS).toEqual(EQ_EN_SLUGS.map((p) => p.en));
    expect(ALL_EQ_PL_SLUGS).toEqual(EQ_EN_SLUGS.map((p) => p.pl));
  });

  it("covers every planet exactly once", () => {
    checkTable(PLANET_EN_SLUGS, PLANET_SLUGS);
    expect(ALL_PLANET_EN_SLUGS).toEqual(PLANET_EN_SLUGS.map((p) => p.en));
    expect(ALL_PLANET_PL_SLUGS).toEqual(PLANET_EN_SLUGS.map((p) => p.pl));
  });
});

describe("slug resolvers", () => {
  const isDream = (s: string) => ALL_DREAM_SLUGS.includes(s);
  const isEq = (s: string) => EQ_ARTICLE_SLUGS.includes(s);
  const isPlanet = (s: string) => PLANET_SLUGS.includes(s);

  it("resolves English slugs on the English host", () => {
    expect(resolveDreamSlug("snake", "en", isDream)).toBe("gveli");
    expect(resolveEqSlug("what-is-eq", "en", isEq)).toBe(
      "ra-aris-emociuri-inteleqti",
    );
    expect(resolvePlanetSlug("sun", "en", isPlanet)).toBe("mze");
  });

  it("resolves Polish slugs on the Polish host", () => {
    expect(resolveDreamSlug("waz", "pl", isDream)).toBe("gveli");
    expect(resolveDreamSlug("wypadajace-zeby", "pl", isDream)).toBe("kbili");
    expect(
      resolveEqSlug("co-to-jest-inteligencja-emocjonalna", "pl", isEq),
    ).toBe("ra-aris-emociuri-inteleqti");
    expect(resolvePlanetSlug("slonce", "pl", isPlanet)).toBe("mze");
    expect(resolvePlanetSlug("ksiezyc", "pl", isPlanet)).toBe("mtvare");
  });

  it("falls back to English and internal slugs on the Polish host", () => {
    expect(resolveDreamSlug("snake", "pl", isDream)).toBe("gveli");
    expect(resolveDreamSlug("gveli", "pl", isDream)).toBe("gveli");
    expect(resolveEqSlug("what-is-eq", "pl", isEq)).toBe(
      "ra-aris-emociuri-inteleqti",
    );
    expect(resolvePlanetSlug("sun", "pl", isPlanet)).toBe("mze");
  });

  it("keeps resolving internal slugs on the English host (redirect fallback)", () => {
    expect(resolveDreamSlug("gveli", "en", isDream)).toBe("gveli");
    expect(resolveEqSlug("ra-aris-emociuri-inteleqti", "en", isEq)).toBe(
      "ra-aris-emociuri-inteleqti",
    );
    expect(resolvePlanetSlug("mze", "en", isPlanet)).toBe("mze");
  });

  it("accepts only internal slugs on the Georgian host", () => {
    expect(resolveDreamSlug("gveli", "ka", isDream)).toBe("gveli");
    expect(resolveDreamSlug("snake", "ka", isDream)).toBeNull();
    expect(resolveDreamSlug("waz", "ka", isDream)).toBeNull();
    expect(resolveEqSlug("what-is-eq", "ka", isEq)).toBeNull();
    expect(resolvePlanetSlug("sun", "ka", isPlanet)).toBeNull();
  });

  it("rejects unknown slugs on all hosts", () => {
    expect(resolveDreamSlug("nope", "en", isDream)).toBeNull();
    expect(resolveDreamSlug("nope", "pl", isDream)).toBeNull();
    expect(resolveDreamSlug("nope", "ka", isDream)).toBeNull();
  });

  it("renders keyword slugs for localized links", () => {
    expect(dreamPublicSlug("gveli", "en")).toBe("snake");
    expect(dreamPublicSlug("gveli", "pl")).toBe("waz");
    expect(dreamPublicSlug("gveli", "ka")).toBe("gveli");
    expect(eqPublicSlug("ra-aris-emociuri-inteleqti", "en")).toBe("what-is-eq");
    expect(eqPublicSlug("ra-aris-emociuri-inteleqti", "pl")).toBe(
      "co-to-jest-inteligencja-emocjonalna",
    );
    expect(planetPublicSlug("mze", "en")).toBe("sun");
    expect(planetPublicSlug("mze", "pl")).toBe("slonce");
  });
});

describe("upgradeEnglishDetailSlug", () => {
  it("upgrades legacy transliterated detail slugs", () => {
    expect(upgradeEnglishDetailSlug("/dream-meanings/gveli")).toBe(
      "/dream-meanings/snake",
    );
    expect(
      upgradeEnglishDetailSlug(
        "/emotional-intelligence/ra-aris-emociuri-inteleqti",
      ),
    ).toBe("/emotional-intelligence/what-is-eq");
    expect(upgradeEnglishDetailSlug("/astrology-planets/mze")).toBe(
      "/astrology-planets/sun",
    );
  });

  it("leaves hubs, keyword slugs, unknown and nested paths alone", () => {
    expect(upgradeEnglishDetailSlug("/dream-meanings")).toBe("/dream-meanings");
    expect(upgradeEnglishDetailSlug("/dream-meanings/snake")).toBe(
      "/dream-meanings/snake",
    );
    expect(upgradeEnglishDetailSlug("/dream-meanings/nope")).toBe(
      "/dream-meanings/nope",
    );
    expect(upgradeEnglishDetailSlug("/dream-meanings/snake/extra")).toBe(
      "/dream-meanings/snake/extra",
    );
    expect(upgradeEnglishDetailSlug("/zodiac/aries")).toBe("/zodiac/aries");
    expect(upgradeEnglishDetailSlug("/sizmris-akhsna/gveli")).toBe(
      "/sizmris-akhsna/gveli",
    );
  });
});
