/**
 * Tiny Georgian noun inflection helpers for generated UI text (sign names,
 * planet names). Handles the regular declension patterns plus the one
 * syncopated sign name; anything unusual can be special-cased here.
 */

/** Irregular genitives (syncope etc.) that the suffix rules would get wrong. */
const GENITIVE_SPECIAL: Record<string, string> = {
  მშვილდოსანი: "მშვილდოსნის",
  "თხის რქა": "თხის რქის",
};

/** "ვერძი" → "ვერძის", "კურო" → "კუროს", "თხის რქა" → "თხის რქის". */
export function genitiveKa(nounKa: string): string {
  const special = GENITIVE_SPECIAL[nounKa];
  if (special) return special;
  if (nounKa.endsWith("ი")) return `${nounKa.slice(0, -1)}ის`;
  if (nounKa.endsWith("ა")) return `${nounKa.slice(0, -1)}ის`;
  if (nounKa.endsWith("ე")) return `${nounKa}ს`;
  return `${nounKa}ს`; // ო/უ etc. — "კუროს", "მთვარეს"
}

/** "ვერძი" → "ვერძში", "ტყუპები" → "ტყუპებში", "კურო" → "კუროში". */
export function locativeKa(nounKa: string): string {
  if (nounKa.endsWith("ი")) return `${nounKa.slice(0, -1)}ში`;
  return `${nounKa}ში`;
}
