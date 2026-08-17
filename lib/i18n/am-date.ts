/**
 * Armenian date formatting that does not depend on runtime ICU data.
 *
 * Provides CLDR `hy` month and weekday names to ensure consistent
 * hydration and server rendering across all environments.
 */

export const AM_MONTHS = [
  "Հունվար",
  "Փետրվար",
  "Մարտ",
  "Ապրիլ",
  "Մայիս",
  "Հունիս",
  "Հուլիս",
  "Օգոստոս",
  "Սեպտեմբեր",
  "Հոկտեմբեր",
  "Նոյեմբեր",
  "Դեկտեմբեր",
];

export const AM_MONTHS_GENITIVE = [
  "հունվարի",
  "փետրվարի",
  "մարտի",
  "ապրիլի",
  "մայիսի",
  "հունիսի",
  "հուլիսի",
  "օգոստոսի",
  "սեպտեմբերի",
  "հոկտեմբերի",
  "նոյեմբերի",
  "դեկտեմբերի",
];

export const AM_MONTHS_SHORT = [
  "հնվ",
  "փտվ",
  "մրտ",
  "ապր",
  "մյս",
  "հնս",
  "հլս",
  "օգս",
  "սեպ",
  "հոկ",
  "նոյ",
  "դեկ",
];

/** Indexed by `getDay()` / `getUTCDay()` — 0 is Sunday. */
export const AM_WEEKDAYS = [
  "Կիրակի",
  "Երկուշաբթի",
  "Երեքշաբթի",
  "Չորեքշաբթի",
  "Հինգշաբթի",
  "Ուրբաթ",
  "Շաբաթ",
];

/**
 * "Կիրակի, 9 օգոստոսի" from a plain YYYY-MM-DD.
 */
export function amLongDate(ymd: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
  if (!match) return ymd;
  const [, year, month, day] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  if (Number.isNaN(date.getTime())) return ymd;
  return `${AM_WEEKDAYS[date.getUTCDay()]}, ${date.getUTCDate()} ${
    AM_MONTHS_GENITIVE[date.getUTCMonth()]
  }`;
}

/** "9 օգս" for an instant, read in the runtime's own timezone. */
export function amShortDate(date: Date): string {
  return `${date.getDate()} ${AM_MONTHS_SHORT[date.getMonth()]}`;
}
