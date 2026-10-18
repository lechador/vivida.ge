import type { PhaseKey } from "@/lib/moon-phase";

export type PhaseGuideItem = {
  key: PhaseKey;
  symbol: string;
  labelKa: string;
  labelEn: string;
  illuminationKa: string;
  daysKa: string;
  meaningKa: string;
};

export const PHASE_GUIDE: PhaseGuideItem[] = [
  {
    key: "new_moon",
    symbol: "🌑",
    labelKa: "ახალი მთვარე",
    labelEn: "New Moon",
    illuminationKa: "0–2%",
    daysKa: "1–2 დღე",
    meaningKa:
      "მთვარის ციკლის დასაწყისი. მთვარე მზესთან ახლოსაა და ღამის ცაზე თითქმის არ ჩანს. ტრადიციულად უკავშირდება დაგეგმვასა და ახალი მიზნების ჩამოყალიბებას.",
  },
  {
    key: "waxing_crescent",
    symbol: "🌒",
    labelKa: "მზარდი ნამგალი",
    labelEn: "Waxing Crescent",
    illuminationKa: "3–33%",
    daysKa: "3–6 დღე",
    meaningKa:
      "საღამოს ცაზე ჩნდება წვრილი ნამგალი. ეს ფაზა პირველი პრაქტიკული ნაბიჯების, ინიციატივისა და იმპულსის აკრეფის პერიოდად ითვლება.",
  },
  {
    key: "first_quarter",
    symbol: "🌓",
    labelKa: "პირველი მეოთხედი",
    labelEn: "First Quarter",
    illuminationKa: "დაახლ. 50%",
    daysKa: "7–8 დღე",
    meaningKa:
      "მთვარის დისკოს ნახევარია განათებული. მოქმედების, გადაწყვეტილების მიღებისა და პირველი წინააღმდეგობების გადალახვის ფაზაა.",
  },
  {
    key: "waxing_gibbous",
    symbol: "🌔",
    labelKa: "მზარდი მთვარე",
    labelEn: "Waxing Gibbous",
    illuminationKa: "66–96%",
    daysKa: "9–13 დღე",
    meaningKa:
      "სავსე მთვარის წინა ფაზა. ხელს უწყობს დაწყებული საქმეების დახვეწას, დეტალების გასწორებასა და მომზადებას კულმინაციისთვის.",
  },
  {
    key: "full_moon",
    symbol: "🌕",
    labelKa: "სავსე მთვარე",
    labelEn: "Full Moon",
    illuminationKa: "97–100%",
    daysKa: "14–16 დღე",
    meaningKa:
      "ციკლის პიკი, როცა მთვარე სრულად განათებულია. ტრადიციულად უკავშირდება შედეგების გამოჩენას, ემოციურ სისავსესა და სიცხადეს.",
  },
  {
    key: "waning_gibbous",
    symbol: "🌖",
    labelKa: "კლებადი მთვარე",
    labelEn: "Waning Gibbous",
    illuminationKa: "96–66%",
    daysKa: "17–21 დღე",
    meaningKa:
      "განათება ნელ-ნელა იკლებს. კარგი დროა მიღებული გამოცდილების გააზრებისთვის, ცოდნის გაზიარებისა და მადლიერებისთვის.",
  },
  {
    key: "last_quarter",
    symbol: "🌗",
    labelKa: "ბოლო მეოთხედი",
    labelEn: "Last Quarter",
    illuminationKa: "დაახლ. 50%",
    daysKa: "22–23 დღე",
    meaningKa:
      "გადახედვის, პრიორიტეტების გადალაგებისა და ზედმეტი ვალდებულებებისგან გათავისუფლების ფაზა.",
  },
  {
    key: "waning_crescent",
    symbol: "🌘",
    labelKa: "კლებადი ნამგალი",
    labelEn: "Waning Crescent",
    illuminationKa: "33–3%",
    daysKa: "24–29 დღე",
    meaningKa:
      "ციკლის დასასრული. ხელს უწყობს დასვენებას, ძალების აღდგენასა და მშვიდ მომზადებას მომდევნო ახალი მთვარისთვის.",
  },
];

export const LUNAR_DAY_NOTES: Array<{
  range: string;
  titleKa: string;
  bodyKa: string;
}> = [
  {
    range: "1–7 დღე",
    titleKa: "დასაწყისი და ჩანაფიქრი",
    bodyKa:
      "ახალი მთვარიდან პირველი მეოთხედისკენ მიმავალი დღეები. ყურადღება გადადის მიზნის ფორმულირებიდან პირველ პრაქტიკულ მოქმედებებზე.",
  },
  {
    range: "8–14 დღე",
    titleKa: "ზრდა და გამყარება",
    bodyKa:
      "მზარდი განათების პერიოდი, როცა ტემპი მატულობს და დაწყებული საქმეები კონკრეტულ ფორმას იღებს.",
  },
  {
    range: "15–22 დღე",
    titleKa: "პიკი და შეფასება",
    bodyKa:
      "სავსე მთვარისა და კლებადი გიბუსის დღეები. ჩანს რეალური სურათი — რა ამართლებს და რა საჭიროებს კორექტირებას.",
  },
  {
    range: "23–30 დღე",
    titleKa: "დასრულება და განტვირთვა",
    bodyKa:
      "ციკლის ბოლო მონაკვეთი. ჯობს დაასრულო მიმდინარე წვრილმანები და ახალი დიდი სტარტი მომდევნო ახალ მთვარეს დაუკავშირო.",
  },
];

export function lunarDayFromAge(ageDays: number): number {
  if (!Number.isFinite(ageDays) || ageDays < 0) return 1;
  return Math.min(30, Math.max(1, Math.floor(ageDays) + 1));
}
