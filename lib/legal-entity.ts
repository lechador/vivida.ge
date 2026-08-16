/**
 * The legal entity that operates Vivida.
 *
 * Stated in six places (Georgian + English privacy and terms, plus the
 * English-domain legal component), so the facts live here once — six
 * hand-maintained copies of a legal disclosure drift, and a privacy policy
 * that contradicts itself is worse than a terse one.
 *
 * Source of truth: the Wyoming Articles of Organization filed 11 May 2026
 * (Original ID 2026-001973944).
 *
 * The company's EIN is deliberately absent — from the site AND from this repo.
 * No privacy or consumer law requires publishing a tax identifier, it does
 * nothing for users, and it hands an impersonator one more genuine detail. The
 * Wyoming filing ID below serves the same "this company is real, go check"
 * purpose and is already a public registry record.
 */
export const LEGAL_ENTITY = {
  name: "CoreShift Apps LLC",
  /** Public Wyoming Secretary of State filing ID — verifiable, unlike an EIN. */
  filingId: "2026-001973944",
  address: "30 N Gould St, Ste R, Sheridan, WY 82801, United States",
  addressKa: "30 N Gould St, Ste R, Sheridan, WY 82801, აშშ",
  contactEmail: "hello@vivida.ge",
} as const;

/** "…registered in Wyoming, United States (filing ID …), at <address>." */
export const OPERATOR_SENTENCE_EN = `The service is operated by ${LEGAL_ENTITY.name}, a limited liability company registered in Wyoming, United States (filing ID ${LEGAL_ENTITY.filingId}), with its registered address at ${LEGAL_ENTITY.address}.`;
