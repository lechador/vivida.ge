/**
 * Life-path numerology math for the /numerologia SEO cluster. Pure functions,
 * shared by the client calculator and the server pages.
 *
 * Method (classic Pythagorean): sum all digits of the birth date (DDMMYYYY),
 * then repeatedly reduce by digit-summing until a single digit, unless the
 * intermediate total is a master number (11, 22, 33), which stays unreduced.
 */

export const LIFE_PATH_NUMBERS = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "11",
  "22",
  "33",
] as const;

export type LifePathNumber = (typeof LIFE_PATH_NUMBERS)[number];

const MASTER = new Set([11, 22, 33]);

function digitSum(n: number): number {
  let s = 0;
  while (n > 0) {
    s += n % 10;
    n = Math.floor(n / 10);
  }
  return s;
}

/** Reduce keeping master numbers (11/22/33) unreduced. */
export function reduceToLifePath(total: number): number {
  while (total > 9 && !MASTER.has(total)) {
    total = digitSum(total);
  }
  return total;
}

/**
 * Life path from a birth date. Reduces day, month, and year separately first
 * (the standard method, it preserves master numbers arising from components),
 * then reduces their sum.
 */
export function lifePathFromDate(
  year: number,
  month: number,
  day: number
): LifePathNumber {
  const d = reduceToLifePath(day);
  const m = reduceToLifePath(month);
  const y = reduceToLifePath(digitSum(year));
  return String(reduceToLifePath(d + m + y)) as LifePathNumber;
}

export function isLifePathNumber(s: string): s is LifePathNumber {
  return (LIFE_PATH_NUMBERS as readonly string[]).includes(s);
}
