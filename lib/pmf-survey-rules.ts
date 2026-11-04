/**
 * Pure rules for the Sean Ellis PMF survey, kept free of database and
 * transport imports so they can be unit-tested without an environment.
 *
 * The question is the standard one — "How would you feel if you could no
 * longer use Vivida?" — and the PMF signal is the share answering
 * "very disappointed". 40% is the conventional strong-PMF threshold.
 */

export const PMF_SURVEY_KIND = "pmf_survey";
export const PMF_RESPONSE_KIND = "pmf_survey_response";
export const PMF_WAVE = "2026-11";

export const PMF_ANSWERS = [
  "very_disappointed",
  "somewhat_disappointed",
  "not_disappointed",
] as const;

export type PmfAnswer = (typeof PMF_ANSWERS)[number];

export function isPmfAnswer(value: unknown): value is PmfAnswer {
  return (
    typeof value === "string" &&
    (PMF_ANSWERS as readonly string[]).includes(value)
  );
}

/** Share of "very disappointed" among responses, as a percentage (1 decimal). */
export function pmfScore(answers: readonly string[]): number {
  if (answers.length === 0) return 0;
  const very = answers.filter((a) => a === "very_disappointed").length;
  return Math.round((very / answers.length) * 1000) / 10;
}
