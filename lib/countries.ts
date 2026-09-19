/** Client-safe ISO 3166-1 alpha-2 country catalogue. */
export const COUNTRY_CODES = `
AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ
BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ
CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ
DE DJ DK DM DO DZ
EC EE EG EH ER ES ET
FI FJ FK FM FO FR
GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY
HK HM HN HR HT HU
ID IE IL IM IN IO IQ IR IS IT
JE JM JO JP
KE KG KH KI KM KN KP KR KW KY KZ
LA LB LC LI LK LR LS LT LU LV LY
MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ
NA NC NE NF NG NI NL NO NP NR NU NZ
OM
PA PE PF PG PH PK PL PM PN PR PS PT PW PY
QA
RE RO RS RU RW
SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ
TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ
UA UG UM US UY UZ
VA VC VE VG VI VN VU
WF WS
YE YT
ZA ZM ZW
`
  .trim()
  .split(/\s+/);

const COUNTRY_CODE_SET = new Set(COUNTRY_CODES);

export function isCountryCode(value: string): boolean {
  return COUNTRY_CODE_SET.has(value.trim().toUpperCase());
}

/**
 * CLDR `ka` region names, for the same reason lib/i18n/ka-date.ts carries its
 * own month names: browsers ship no Georgian locale data, so
 * `Intl.DisplayNames(["ka"])` silently falls back to English there and
 * disagrees with Node's Georgian when the page hydrates.
 */
const KA_COUNTRY_NAMES: Record<string, string> = {
  AD: "ანდორა",
  AE: "არაბთა გაერთიანებული საამიროები",
  AF: "ავღანეთი",
  AG: "ანტიგუა და ბარბუდა",
  AI: "ანგილია",
  AL: "ალბანეთი",
  AM: "სომხეთი",
  AO: "ანგოლა",
  AQ: "ანტარქტიკა",
  AR: "არგენტინა",
  AS: "ამერიკის სამოა",
  AT: "ავსტრია",
  AU: "ავსტრალია",
  AW: "არუბა",
  AX: "ალანდის კუნძულები",
  AZ: "აზერბაიჯანი",
  BA: "ბოსნია და ჰერცეგოვინა",
  BB: "ბარბადოსი",
  BD: "ბანგლადეში",
  BE: "ბელგია",
  BF: "ბურკინა-ფასო",
  BG: "ბულგარეთი",
  BH: "ბაჰრეინი",
  BI: "ბურუნდი",
  BJ: "ბენინი",
  BL: "სენ-ბართელმი",
  BM: "ბერმუდა",
  BN: "ბრუნეი",
  BO: "ბოლივია",
  BQ: "კარიბის ნიდერლანდები",
  BR: "ბრაზილია",
  BS: "ბაჰამის კუნძულები",
  BT: "ბუტანი",
  BV: "ბუვე",
  BW: "ბოტსვანა",
  BY: "ბელარუსი",
  BZ: "ბელიზი",
  CA: "კანადა",
  CC: "ქოქოსის (კილინგის) კუნძულები",
  CD: "კონგო - კინშასა",
  CF: "ცენტრალური აფრიკის რესპუბლიკა",
  CG: "კონგო - ბრაზავილი",
  CH: "შვეიცარია",
  CI: "კოტ-დივუარი",
  CK: "კუკის კუნძულები",
  CL: "ჩილე",
  CM: "კამერუნი",
  CN: "ჩინეთი",
  CO: "კოლუმბია",
  CR: "კოსტა-რიკა",
  CU: "კუბა",
  CV: "კაბო-ვერდე",
  CW: "კიურასაო",
  CX: "შობის კუნძული",
  CY: "კვიპროსი",
  CZ: "ჩეხეთი",
  DE: "გერმანია",
  DJ: "ჯიბუტი",
  DK: "დანია",
  DM: "დომინიკა",
  DO: "დომინიკელთა რესპუბლიკა",
  DZ: "ალჟირი",
  EC: "ეკვადორი",
  EE: "ესტონეთი",
  EG: "ეგვიპტე",
  EH: "დასავლეთ საჰარა",
  ER: "ერიტრეა",
  ES: "ესპანეთი",
  ET: "ეთიოპია",
  FI: "ფინეთი",
  FJ: "ფიჯი",
  FK: "ფოლკლენდის კუნძულები",
  FM: "მიკრონეზია",
  FO: "ფარერის კუნძულები",
  FR: "საფრანგეთი",
  GA: "გაბონი",
  GB: "გაერთიანებული სამეფო",
  GD: "გრენადა",
  GE: "საქართველო",
  GF: "საფრანგეთის გვიანა",
  GG: "გერნსი",
  GH: "განა",
  GI: "გიბრალტარი",
  GL: "გრენლანდია",
  GM: "გამბია",
  GN: "გვინეა",
  GP: "გვადელუპა",
  GQ: "ეკვატორული გვინეა",
  GR: "საბერძნეთი",
  GS: "სამხრეთ ჯორჯია და სამხრეთ სენდვიჩის კუნძულები",
  GT: "გვატემალა",
  GU: "გუამი",
  GW: "გვინეა-ბისაუ",
  GY: "გაიანა",
  HK: "ჰონკონგის სპეციალური ადმინისტრაციული რეგიონი, ჩინეთი",
  HM: "ჰერდი და მაკდონალდის კუნძულები",
  HN: "ჰონდურასი",
  HR: "ხორვატია",
  HT: "ჰაიტი",
  HU: "უნგრეთი",
  ID: "ინდონეზია",
  IE: "ირლანდია",
  IL: "ისრაელი",
  IM: "მენის კუნძული",
  IN: "ინდოეთი",
  IO: "ბრიტანეთის ტერიტორია ინდოეთის ოკეანეში",
  IQ: "ერაყი",
  IR: "ირანი",
  IS: "ისლანდია",
  IT: "იტალია",
  JE: "ჯერსი",
  JM: "იამაიკა",
  JO: "იორდანია",
  JP: "იაპონია",
  KE: "კენია",
  KG: "ყირგიზეთი",
  KH: "კამბოჯა",
  KI: "კირიბატი",
  KM: "კომორის კუნძულები",
  KN: "სენტ-კიტსი და ნევისი",
  KP: "ჩრდილოეთ კორეა",
  KR: "სამხრეთ კორეა",
  KW: "ქუვეითი",
  KY: "კაიმანის კუნძულები",
  KZ: "ყაზახეთი",
  LA: "ლაოსი",
  LB: "ლიბანი",
  LC: "სენტ-ლუსია",
  LI: "ლიხტენშტაინი",
  LK: "შრი-ლანკა",
  LR: "ლიბერია",
  LS: "ლესოთო",
  LT: "ლიეტუვა",
  LU: "ლუქსემბურგი",
  LV: "ლატვია",
  LY: "ლიბია",
  MA: "მაროკო",
  MC: "მონაკო",
  MD: "მოლდოვა",
  ME: "მონტენეგრო",
  MF: "სენ-მარტენი",
  MG: "მადაგასკარი",
  MH: "მარშალის კუნძულები",
  MK: "ჩრდილოეთ მაკედონია",
  ML: "მალი",
  MM: "მიანმარი (ბირმა)",
  MN: "მონღოლეთი",
  MO: "მაკაოს სპეციალური ადმინისტრაციული რეგიონი, ჩინეთი",
  MP: "ჩრდილოეთ მარიანას კუნძულები",
  MQ: "მარტინიკა",
  MR: "მავრიტანია",
  MS: "მონსერატი",
  MT: "მალტა",
  MU: "მავრიკი",
  MV: "მალდივები",
  MW: "მალავი",
  MX: "მექსიკა",
  MY: "მალაიზია",
  MZ: "მოზამბიკი",
  NA: "ნამიბია",
  NC: "ახალი კალედონია",
  NE: "ნიგერი",
  NF: "ნორფოლკის კუნძული",
  NG: "ნიგერია",
  NI: "ნიკარაგუა",
  NL: "ნიდერლანდები",
  NO: "ნორვეგია",
  NP: "ნეპალი",
  NR: "ნაურუ",
  NU: "ნიუე",
  NZ: "ახალი ზელანდია",
  OM: "ომანი",
  PA: "პანამა",
  PE: "პერუ",
  PF: "საფრანგეთის პოლინეზია",
  PG: "პაპუა-ახალი გვინეა",
  PH: "ფილიპინები",
  PK: "პაკისტანი",
  PL: "პოლონეთი",
  PM: "სენ-პიერი და მიკელონი",
  PN: "პიტკერნის კუნძულები",
  PR: "პუერტო-რიკო",
  PS: "პალესტინის ტერიტორიები",
  PT: "პორტუგალია",
  PW: "პალაუ",
  PY: "პარაგვაი",
  QA: "კატარი",
  RE: "რეუნიონი",
  RO: "რუმინეთი",
  RS: "სერბეთი",
  RU: "რუსეთი",
  RW: "რუანდა",
  SA: "საუდის არაბეთი",
  SB: "სოლომონის კუნძულები",
  SC: "სეიშელის კუნძულები",
  SD: "სუდანი",
  SE: "შვედეთი",
  SG: "სინგაპური",
  SH: "წმინდა ელენეს კუნძული",
  SI: "სლოვენია",
  SJ: "შპიცბერგენი და იან-მაიენი",
  SK: "სლოვაკეთი",
  SL: "სიერა-ლეონე",
  SM: "სან-მარინო",
  SN: "სენეგალი",
  SO: "სომალი",
  SR: "სურინამი",
  SS: "სამხრეთ სუდანი",
  ST: "სან-ტომე და პრინსიპი",
  SV: "სალვადორი",
  SX: "სინტ-მარტენი",
  SY: "სირია",
  SZ: "სვაზილენდი",
  TC: "თერქს-ქაიქოსის კუნძულები",
  TD: "ჩადი",
  TF: "ფრანგული სამხრეთის ტერიტორიები",
  TG: "ტოგო",
  TH: "ტაილანდი",
  TJ: "ტაჯიკეთი",
  TK: "ტოკელაუ",
  TL: "ტიმორ-ლესტე",
  TM: "თურქმენეთი",
  TN: "ტუნისი",
  TO: "ტონგა",
  TR: "თურქეთი",
  TT: "ტრინიდადი და ტობაგო",
  TV: "ტუვალუ",
  TW: "ტაივანი",
  TZ: "ტანზანია",
  UA: "უკრაინა",
  UG: "უგანდა",
  UM: "აშშ-ის შორეული კუნძულები",
  US: "ამერიკის შეერთებული შტატები",
  UY: "ურუგვაი",
  UZ: "უზბეკეთი",
  VA: "ქალაქი ვატიკანი",
  VC: "სენტ-ვინსენტი და გრენადინები",
  VE: "ვენესუელა",
  VG: "ბრიტანეთის ვირჯინის კუნძულები",
  VI: "აშშ-ის ვირჯინის კუნძულები",
  VN: "ვიეტნამი",
  VU: "ვანუატუ",
  WF: "უოლისი და ფუტუნა",
  WS: "სამოა",
  YE: "იემენი",
  YT: "მაიოტა",
  ZA: "სამხრეთ აფრიკის რესპუბლიკა",
  ZM: "ზამბია",
  ZW: "ზიმბაბვე",
};

export function countryOptions(locale: "ka" | "en" | string) {
  if (locale === "en") {
    const displayNames = new Intl.DisplayNames(["en"], { type: "region" });
    return COUNTRY_CODES.map((code) => ({
      code,
      name: displayNames.of(code) ?? code,
    })).sort((a, b) => a.name.localeCompare(b.name, "en"));
  }
  // Georgian letters sort in code-point order, so a plain comparison matches
  // the CLDR `ka` collation without depending on the runtime's locale data.
  return COUNTRY_CODES.map((code) => ({
    code,
    name: KA_COUNTRY_NAMES[code] ?? code,
  })).sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
}

export function countryFlagEmoji(countryCode: string): string {
  const code = countryCode.trim().toUpperCase();
  if (!isCountryCode(code)) return "🌍";
  return String.fromCodePoint(
    ...[...code].map((letter) => letter.charCodeAt(0) + 127397),
  );
}
