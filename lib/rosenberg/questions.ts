/**
 * Rosenberg Self-Esteem Scale (RSES).
 *
 * Morris Rosenberg's original ten-item order is preserved. The scale is in the
 * public domain; this Georgian translation is written for Vivida. Responses
 * use the original four-point agreement format with no neutral option.
 *
 * Public-domain notice and scoring references:
 * https://socy.umd.edu/about-us/using-rosenberg-self-esteem-scale
 * https://www.apa.org/obesity-guideline/rosenberg-self-esteem.pdf
 */

export type RosenbergQuestion = {
  id: number;
  textKa: string;
  /** Agreement lowers self-esteem for negatively worded items. */
  reverse: boolean;
  themeKa: string;
  strengthKa: string;
  reflectionKa: string;
};

export const ROSENBERG_OPTIONS = [
  { value: 4, labelKa: "სრულიად ვეთანხმები" },
  { value: 3, labelKa: "ვეთანხმები" },
  { value: 2, labelKa: "არ ვეთანხმები" },
  { value: 1, labelKa: "სრულიად არ ვეთანხმები" },
] as const;

export const ROSENBERG_QUESTIONS: RosenbergQuestion[] = [
  {
    id: 1,
    reverse: false,
    textKa: "ზოგადად, საკუთარი თავით კმაყოფილი ვარ.",
    themeKa: "საკუთარი თავის მიღება",
    strengthKa: "შეგიძლია საკუთარი თავი მთლიანობაში მიიღო — მხოლოდ ცალკეული შეცდომებით არ განსაზღვრავ საკუთარ ღირებულებას.",
    reflectionKa: "დააკვირდი, ხომ არ ვრცელდება ერთი კონკრეტული უკმაყოფილება მთლიანად საკუთარ თავზე.",
  },
  {
    id: 2,
    reverse: true,
    textKa: "ზოგჯერ ვფიქრობ, რომ საერთოდ არაფრად ვვარგივარ.",
    themeKa: "შინაგანი კრიტიკოსი",
    strengthKa: "მკაცრი თვითკრიტიკული აზრი შენთვის ფაქტად მარტივად არ იქცევა.",
    reflectionKa: "როცა აზრი „არაფრად ვვარგივარ“ ჩნდება, სცადე კონკრეტულად დაასახელო, რა ვერ გამოვიდა — ერთი შემთხვევა მთელ შენს პიროვნებას არ აღწერს.",
  },
  {
    id: 3,
    reverse: false,
    textKa: "ვფიქრობ, რომ არაერთი კარგი თვისება მაქვს.",
    themeKa: "კარგი თვისებების დანახვა",
    strengthKa: "საკუთარ ძლიერ მხარეებს ამჩნევ და მათ მნიშვნელობას აღიარებ.",
    reflectionKa: "გაიხსენე ერთი კარგი თვისება და ბოლო შემთხვევა, როცა ის რეალურ მოქმედებაში გამოავლინე.",
  },
  {
    id: 4,
    reverse: false,
    textKa: "ვფიქრობ, საქმეებს ადამიანების უმეტესობასავით კარგად ვაკეთებ.",
    themeKa: "საკუთარი შესაძლებლობების ნდობა",
    strengthKa: "საკუთარ შესაძლებლობებს სხვებთან მუდმივი დაკნინების გარეშე აფასებ.",
    reflectionKa: "შეამოწმე, საკუთარ თავს სამართლიანი საზომით ადარებ თუ მხოლოდ სხვის საუკეთესო შედეგებს ხედავ.",
  },
  {
    id: 5,
    reverse: true,
    textKa: "ვგრძნობ, რომ ბევრი არაფერი მაქვს საამაყო.",
    themeKa: "საკუთარი მიღწევების აღიარება",
    strengthKa: "შეგიძლია შენს ძალისხმევასა და მიღწევებს მნიშვნელობა მიანიჭო.",
    reflectionKa: "ჩამოწერე ერთი რამ, რომლისთვისაც ძალისხმევა გაიღე — მაშინაც კი, თუ შედეგი იდეალური არ ყოფილა.",
  },
  {
    id: 6,
    reverse: true,
    textKa: "ზოგჯერ თავს მართლაც უსარგებლოდ ვგრძნობ.",
    themeKa: "საკუთარი მნიშვნელობის განცდა",
    strengthKa: "რთულ მომენტშიც შეგიძლია საკუთარი მნიშვნელობა მხოლოდ პროდუქტიულობას არ მიაბა.",
    reflectionKa: "შენი ღირებულება მხოლოდ იმით არ განისაზღვრება, რამდენს აკეთებ სხვებისთვის ან რამდენად პროდუქტიული ხარ.",
  },
  {
    id: 7,
    reverse: false,
    textKa: "ვგრძნობ, რომ მეც ისეთივე ღირებული ადამიანი ვარ, როგორიც სხვები.",
    themeKa: "თანასწორი ღირებულების განცდა",
    strengthKa: "საკუთარ თავს სხვების თანასწორად ღირებულ ადამიანად აღიქვამ.",
    reflectionKa: "დააკვირდი ურთიერთობებსა და გარემოებებს, სადაც საკუთარ საჭიროებებს სხვისაზე ნაკლებად მნიშვნელოვნად მიიჩნევ.",
  },
  {
    id: 8,
    reverse: true,
    textKa: "ვისურვებდი, საკუთარი თავის მიმართ მეტი პატივისცემა მქონდეს.",
    themeKa: "საკუთარი თავის პატივისცემა",
    strengthKa: "საკუთარი თავის მიმართ პატივისცემას უკვე საკმაოდ მყარად გრძნობ.",
    reflectionKa: "იფიქრე ერთ პატარა ქმედებაზე, რომლითაც საკუთარ საზღვრებს, საჭიროებებს ან შრომას მეტ პატივს სცემ.",
  },
  {
    id: 9,
    reverse: true,
    textKa: "საერთო ჯამში, მგონია, რომ წარუმატებელი ადამიანი ვარ.",
    themeKa: "წარუმატებლობის განცდა",
    strengthKa: "ცალკეულ წარუმატებლობას საკუთარი პიროვნების საბოლოო შეფასებად არ აქცევ.",
    reflectionKa: "სცადე ერთმანეთისგან გამიჯნო „რაღაც ვერ გამომივიდა“ და „მე წარუმატებელი ვარ“ — პირველი გამოცდილებაა, მეორე კი მკაცრი განაჩენი.",
  },
  {
    id: 10,
    reverse: false,
    textKa: "საკუთარი თავის მიმართ დადებითი დამოკიდებულება მაქვს.",
    themeKa: "დადებითი დამოკიდებულება საკუთარი თავისადმი",
    strengthKa: "საკუთარ თავთან ურთიერთობაში დადებითი და მხარდამჭერი დამოკიდებულება ჩანს.",
    reflectionKa: "შეამჩნიე, როგორ ელაპარაკები საკუთარ თავს შეცდომის შემდეგ — იმავე ტონით დაელაპარაკებოდი ახლობელ ადამიანს?",
  },
];

export const ROSENBERG_QUESTION_COUNT = ROSENBERG_QUESTIONS.length;
