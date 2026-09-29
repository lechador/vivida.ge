/**
 * Latin spellings of zodiac sign names for the site's own search.
 * These aliases are match tokens, not page content or structured-data names.
 */

import type { ZodiacSlug } from "./zodiac-dates";

/** Latin spellings used in real Georgian search-on-QWERTY queries. */
export const SIGN_LATIN_NAMES: Record<ZodiacSlug, string[]> = {
  aries: ["verci", "vercis", "verdzi"],
  taurus: ["kuro", "kuros"],
  gemini: ["tyupebi", "tyupebis"],
  cancer: ["kirchkhibi", "kirchxibi", "kirchkhibis"],
  leo: ["lomi", "lomis"],
  virgo: ["qalwuli", "qalwulis"],
  libra: ["sastsori", "saswori", "sastsoris"],
  scorpio: ["morieli", "morielis"],
  sagittarius: ["mshvildosani", "mshvildosnis"],
  capricorn: ["txis rqa", "tkhis rqa", "txis rqis"],
  aquarius: ["mertskvuli", "merwyuli", "merqwuli"],
  pisces: ["tevzebi", "tevzebis"],
};
