/**
 * Georgian date formatting that does not depend on the runtime's ICU data.
 *
 * `Intl.DateTimeFormat("ka-GE", …)` is only Georgian where the runtime ships
 * Georgian locale data. Reduced-ICU builds resolve `ka-GE` to `en-GB` and
 * silently render English dates inside an otherwise Georgian UI — and when
 * such a browser hydrates a server-rendered page, its output disagrees with
 * Node's Georgian and React discards the server HTML for that subtree.
 *
 * These are the CLDR `ka` names, so full-ICU runtimes render exactly what
 * they rendered before.
 */

const KA_MONTHS = [
  "იანვარი",
  "თებერვალი",
  "მარტი",
  "აპრილი",
  "მაისი",
  "ივნისი",
  "ივლისი",
  "აგვისტო",
  "სექტემბერი",
  "ოქტომბერი",
  "ნოემბერი",
  "დეკემბერი",
];

const KA_MONTHS_SHORT = [
  "იან",
  "თებ",
  "მარ",
  "აპრ",
  "მაი",
  "ივნ",
  "ივლ",
  "აგვ",
  "სექ",
  "ოქტ",
  "ნოე",
  "დეკ",
];

/** Indexed by `getDay()` / `getUTCDay()` — 0 is Sunday. */
const KA_WEEKDAYS = [
  "კვირა",
  "ორშაბათი",
  "სამშაბათი",
  "ოთხშაბათი",
  "ხუთშაბათი",
  "პარასკევი",
  "შაბათი",
];

/**
 * "კვირა, 9 აგვისტო" from a plain YYYY-MM-DD.
 *
 * Daily dates are already stored local to the user, so the string is read
 * verbatim instead of being pushed through a timezone — which also drops an
 * off-by-one day for zones past UTC+12, where an anchored midday UTC instant
 * lands on the following date.
 *
 * Returns the input unchanged if it isn't a calendar date.
 */
export function kaLongDate(ymd: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
  if (!match) return ymd;
  const [, year, month, day] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  if (Number.isNaN(date.getTime())) return ymd;
  return `${KA_WEEKDAYS[date.getUTCDay()]}, ${date.getUTCDate()} ${
    KA_MONTHS[date.getUTCMonth()]
  }`;
}

/** "9 აგვ" for an instant, read in the runtime's own timezone. */
export function kaShortDate(date: Date): string {
  return `${date.getDate()} ${KA_MONTHS_SHORT[date.getMonth()]}`;
}

/** "1 სექტემბერი" for an instant, read in the runtime's own timezone. */
export function kaDayMonth(date: Date): string {
  return `${date.getDate()} ${KA_MONTHS[date.getMonth()]}`;
}

/**
 * Genitive month names — the form a date takes before a postposition, as in
 * "1 სექტემბრის ჩათვლით" (up to and including 1 September).
 *
 * Georgian does not build this by suffixing the nominative: "სექტემბერი" +
 * "-ის" gives "სექტემბერიის", which is simply wrong. Most months syncopate
 * the final vowel of the stem (სექტემბერი → სექტემბრის) and აგვისტო takes a
 * bare -ს, so the forms are listed rather than derived.
 */
const KA_MONTHS_GENITIVE = [
  "იანვრის",
  "თებერვლის",
  "მარტის",
  "აპრილის",
  "მაისის",
  "ივნისის",
  "ივლისის",
  "აგვისტოს",
  "სექტემბრის",
  "ოქტომბრის",
  "ნოემბრის",
  "დეკემბრის",
];

/** "1 სექტემბრის" — pair with a postposition, e.g. `${…} ჩათვლით`. */
export function kaDayMonthGenitive(date: Date): string {
  return `${date.getDate()} ${KA_MONTHS_GENITIVE[date.getMonth()]}`;
}
