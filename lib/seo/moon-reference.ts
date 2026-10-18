/**
 * Reference content for the moon calendar page.
 *
 * Why this exists: GSC shows /mtvaris-kalendari carrying 1,501 impressions
 * at position ~10 with a 1.3% CTR, the site's 4th-biggest impression source
 * and its worst converter. Breaking the query band down, the page ranks for
 * "მთვარე დღეს" / "მთვარის ფაზა დღეს" (p≈8, which it answers well) but
 * drifts to p16-23 on two intents it does NOT actually cover:
 *
 *   - "მთვარის ფაზები" / "mtvaris fazebi", wants the eight phases as a
 *     reference, not just today's one. The page had a single paragraph.
 *   - "მთვარის დღეების კალენდარი", wants the lunar DAY (1-30 within the
 *     cycle), a distinct traditional system the page never mentioned.
 *
 * Both are reference content, so it lives here as hand-written data rather
 * than in the page component, same convention as the tarot deck and the
 * numerology cluster.
 */

import type { PhaseKey } from "@/lib/moon-phase";

export type PhaseGuide = {
  key: PhaseKey;
  symbol: string;
  labelKa: string;
  labelEn: string;
  /** Human-readable illumination band, e.g. "0-2%". */
  illuminationKa: string;
  /** Where in the ~29.5-day cycle this falls. */
  daysKa: string;
  meaningKa: string;
};

export const PHASE_GUIDE: PhaseGuide[] = [
  {
    key: "new_moon",
    symbol: "🌑",
    labelKa: "ახალი მთვარე",
    labelEn: "New Moon",
    illuminationKa: "0-2%",
    daysKa: "1-2 დღე",
    meaningKa:
      "ციკლის დასაწყისი, მთვარე მზასთან ერთ ხაზზეა და ცაზე პრაქტიკულად არ ჩანს. ბნელი ცის გამო ეს საუკეთესო პერიოდია ვარსკვლავებზე დასაკვირვებლად. ტრადიციულად ახალ მთვარეს ახალი საქმის დაწყებასა და მიზნების დასახვას უკავშირებენ.",
  },
  {
    key: "waxing_crescent",
    symbol: "🌒",
    labelKa: "მზარდი ნამგალი",
    labelEn: "Waxing Crescent",
    illuminationKa: "3-33%",
    daysKa: "3-6 დღე",
    meaningKa:
      "თხელი ნამგალი დასავლეთით, მზის ჩასვლისთანავე. მთვარე იზრდება, ტრადიციულად ეს დაწყებული საქმის გაგრძელებისა და პირველი ნაბიჯების პერიოდია.",
  },
  {
    key: "first_quarter",
    symbol: "🌓",
    labelKa: "პირველი მეოთხედი",
    labelEn: "First Quarter",
    illuminationKa: "≈50%",
    daysKa: "7-9 დღე",
    meaningKa:
      "ზუსტად ნახევარი დისკოა განათებული. კრატერების დასაკვირვებლად საუკეთესო დროა, ტერმინატორის ხაზზე ჩრდილები ყველაზე მკვეთრია. სიმბოლურად გადაწყვეტილებისა და წინააღმდეგობის გადალახვის ფაზაა.",
  },
  {
    key: "waxing_gibbous",
    symbol: "🌔",
    labelKa: "მზარდი გიბუსი",
    labelEn: "Waxing Gibbous",
    illuminationKa: "66-96%",
    daysKa: "10-14 დღე",
    meaningKa:
      "ნახევარზე მეტი განათებულია და მთვარე სავსისკენ მიდის. დახვეწისა და დასრულებამდე მიყვანის პერიოდად ითვლება.",
  },
  {
    key: "full_moon",
    symbol: "🌕",
    labelKa: "სავსე მთვარე",
    labelEn: "Full Moon",
    illuminationKa: "97-100%",
    daysKa: "15-16 დღე",
    meaningKa:
      "მთელი დისკო განათებულია, მთვარე მზის საპირისპიროდ დგას და მთელი ღამე ჩანს. ყველაზე ნათელი ფაზა და ამიტომ ყველაზე ცუდი დრო სუსტი ობიექტების სანახავად. ტრადიციულად შეჯამების, კულმინაციისა და ემოციური სიმძაფრის დროა.",
  },
  {
    key: "waning_gibbous",
    symbol: "🌖",
    labelKa: "კლებადი გიბუსი",
    labelEn: "Waning Gibbous",
    illuminationKa: "96-66%",
    daysKa: "17-21 დღე",
    meaningKa:
      "განათება იკლებს. მთვარე გვიან ამოდის, ამიტომ საღამო კვლავ ბნელია. სიმბოლურად მადლიერებისა და ნაპოვნის გაზიარების პერიოდი.",
  },
  {
    key: "last_quarter",
    symbol: "🌗",
    labelKa: "ბოლო მეოთხედი",
    labelEn: "Last Quarter",
    illuminationKa: "≈50%",
    daysKa: "22-24 დღე",
    meaningKa:
      "ისევ ნახევარი დისკო, ოღონდ მეორე მხრიდან განათებული. მთვარე შუაღამის შემდეგ ამოდის. ტრადიციულად ჩამოშორებისა და ზედმეტის გაწმენდის ფაზაა.",
  },
  {
    key: "waning_crescent",
    symbol: "🌘",
    labelKa: "კლებადი ნამგალი",
    labelEn: "Waning Crescent",
    illuminationKa: "33-3%",
    daysKa: "25-29 დღე",
    meaningKa:
      "თხელი ნამგალი აღმოსავლეთით, ცისკრისას. ციკლის დასასრული, დასვენების, აღდგენისა და ახალი მთვარისთვის მომზადების პერიოდად ითვლება.",
  },
];

/**
 * The lunar day ("მთვარის დღე") is the count of days since the last new
 * moon, a traditional system that is NOT the same as the eight phases,
 * even though the two are related. We only annotate the turning points
 * rather than inventing 30 distinct prescriptions: the honest version is
 * that the tradition is symbolic, and pretending to per-day precision
 * would be padding.
 */
export const LUNAR_DAY_NOTES: { range: string; titleKa: string; bodyKa: string }[] =
  [
    {
      range: "1-7",
      titleKa: "პირველი მეოთხედი, დაწყება",
      bodyKa:
        "ახალი მთვარიდან პირველ მეოთხედამდე. ტრადიციულად ახალი საქმის, გეგმისა და განზრახვის ჩამოყალიბების დროდ ითვლება, მაშინ, როცა ენერგია ჯერ იზრდება.",
    },
    {
      range: "8-14",
      titleKa: "მეორე მეოთხედი, ზრდა",
      bodyKa:
        "აქტიური მოქმედების პერიოდი: დაწყებული საქმე ვითარდება და ძალისხმევა ყველაზე თვალსაჩინო შედეგს იძლევა. ხალხურად ამ დღეებს მზარდ დღეებს უწოდებდნენ.",
    },
    {
      range: "15-21",
      titleKa: "სავსე მთვარე და შემდეგ, კულმინაცია",
      bodyKa:
        "მე-15 მთვარის დღე სავსე მთვარეს ემთხვევა. კულმინაციისა და შეჯამების პერიოდია; ტრადიციულად ითვლება, რომ ემოციები ყველაზე მძაფრია და ძილი ყველაზე მოუსვენარი.",
    },
    {
      range: "22-29",
      titleKa: "ბოლო მეოთხედი, დასრულება",
      bodyKa:
        "კლებადი მთვარე. ჩამოშორების, გაწმენდისა და დასვენების დღეებად ითვლება, ახალი ციკლისთვის მომზადება, და არა ახლის დაწყება.",
    },
  ];

/** Lunar day number (1-30) from the snapshot's age in days. */
export function lunarDayFromAge(ageDays: number): number {
  return Math.floor(ageDays) + 1;
}

export const MOON_LATIN_QUERIES = [
  "mtvaris kalendari",
  "mtvaris fazebi",
  "mtvare dges",
  "mtvaris faza dges",
  "akhali mtvare",
  "savse mtvare",
  "mtvaris dgeebi",
  "mtvaris kalendari 2026",
];
