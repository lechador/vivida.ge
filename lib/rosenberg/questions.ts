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
  textEn: string;
  /** Agreement lowers self-esteem for negatively worded items. */
  reverse: boolean;
  themeKa: string;
  themeEn: string;
  strengthKa: string;
  strengthEn: string;
  reflectionKa: string;
  reflectionEn: string;
};

export const ROSENBERG_OPTIONS = [
  { value: 4, labelKa: "სრულიად ვეთანხმები", labelEn: "Strongly agree" },
  { value: 3, labelKa: "ვეთანხმები", labelEn: "Agree" },
  { value: 2, labelKa: "არ ვეთანხმები", labelEn: "Disagree" },
  { value: 1, labelKa: "სრულიად არ ვეთანხმები", labelEn: "Strongly disagree" },
] as const;

export const ROSENBERG_QUESTIONS: RosenbergQuestion[] = [
  {
    id: 1,
    reverse: false,
    textKa: "ზოგადად, საკუთარი თავით კმაყოფილი ვარ.",
    textEn: "On the whole, I am satisfied with myself.",
    themeKa: "საკუთარი თავის მიღება",
    themeEn: "Self-acceptance",
    strengthKa:
      "შეგიძლია საკუთარი თავი მთლიანობაში მიიღო, მხოლოდ ცალკეული შეცდომებით არ განსაზღვრავ საკუთარ ღირებულებას.",
    strengthEn:
      "You can accept yourself as a whole instead of letting single mistakes define your worth.",
    reflectionKa:
      "დააკვირდი, ხომ არ ვრცელდება ერთი კონკრეტული უკმაყოფილება მთლიანად საკუთარ თავზე.",
    reflectionEn:
      "Notice whether one specific dissatisfaction is spreading to how you see yourself as a whole.",
  },
  {
    id: 2,
    reverse: true,
    textKa: "ზოგჯერ ვფიქრობ, რომ საერთოდ არაფრად ვვარგივარ.",
    textEn: "At times I think I am no good at all.",
    themeKa: "შინაგანი კრიტიკოსი",
    themeEn: "Inner critic",
    strengthKa: "მკაცრი თვითკრიტიკული აზრი შენთვის ფაქტად მარტივად არ იქცევა.",
    strengthEn:
      "Harsh self-critical thoughts do not easily turn into facts for you.",
    reflectionKa:
      "როცა აზრი „არაფრად ვვარგივარ“ ჩნდება, სცადე კონკრეტულად დაასახელო, რა ვერ გამოვიდა, ერთი შემთხვევა მთელ შენს პიროვნებას არ აღწერს.",
    reflectionEn:
      "When the thought “I am no good” appears, try naming specifically what did not work out. One occasion does not describe your whole personality.",
  },
  {
    id: 3,
    reverse: false,
    textKa: "ვფიქრობ, რომ არაერთი კარგი თვისება მაქვს.",
    textEn: "I feel that I have a number of good qualities.",
    themeKa: "კარგი თვისებების დანახვა",
    themeEn: "Seeing your good qualities",
    strengthKa: "საკუთარ ძლიერ მხარეებს ამჩნევ და მათ მნიშვნელობას აღიარებ.",
    strengthEn: "You notice your strengths and acknowledge that they matter.",
    reflectionKa:
      "გაიხსენე ერთი კარგი თვისება და ბოლო შემთხვევა, როცა ის რეალურ მოქმედებაში გამოავლინე.",
    reflectionEn:
      "Recall one good quality and a recent moment when you showed it in real action.",
  },
  {
    id: 4,
    reverse: false,
    textKa: "ვფიქრობ, საქმეებს ადამიანების უმეტესობასავით კარგად ვაკეთებ.",
    textEn: "I am able to do things as well as most other people.",
    themeKa: "საკუთარი შესაძლებლობების ნდობა",
    themeEn: "Trust in your abilities",
    strengthKa:
      "საკუთარ შესაძლებლობებს სხვებთან მუდმივი დაკნინების გარეშე აფასებ.",
    strengthEn:
      "You assess your abilities without constantly diminishing yourself next to others.",
    reflectionKa:
      "შეამოწმე, საკუთარ თავს სამართლიანი საზომით ადარებ თუ მხოლოდ სხვის საუკეთესო შედეგებს ხედავ.",
    reflectionEn:
      "Check whether you measure yourself by a fair standard or only notice other people's best results.",
  },
  {
    id: 5,
    reverse: true,
    textKa: "ვგრძნობ, რომ ბევრი არაფერი მაქვს საამაყო.",
    textEn: "I feel I do not have much to be proud of.",
    themeKa: "საკუთარი მიღწევების აღიარება",
    themeEn: "Recognizing your achievements",
    strengthKa: "შეგიძლია შენს ძალისხმევასა და მიღწევებს მნიშვნელობა მიანიჭო.",
    strengthEn:
      "You can give meaning to your effort and what you have achieved.",
    reflectionKa:
      "ჩამოწერე ერთი რამ, რომლისთვისაც ძალისხმევა გაიღე, მაშინაც კი, თუ შედეგი იდეალური არ ყოფილა.",
    reflectionEn:
      "Write down one thing you put effort into, even if the result was not ideal.",
  },
  {
    id: 6,
    reverse: true,
    textKa: "ზოგჯერ თავს მართლაც უსარგებლოდ ვგრძნობ.",
    textEn: "I certainly feel useless at times.",
    themeKa: "საკუთარი მნიშვნელობის განცდა",
    themeEn: "Sense of your own worth",
    strengthKa:
      "რთულ მომენტშიც შეგიძლია საკუთარი მნიშვნელობა მხოლოდ პროდუქტიულობას არ მიაბა.",
    strengthEn:
      "Even in difficult moments you can keep your sense of worth separate from your productivity.",
    reflectionKa:
      "შენი ღირებულება მხოლოდ იმით არ განისაზღვრება, რამდენს აკეთებ სხვებისთვის ან რამდენად პროდუქტიული ხარ.",
    reflectionEn:
      "Your worth is not determined only by how much you do for others or how productive you are.",
  },
  {
    id: 7,
    reverse: false,
    textKa: "ვგრძნობ, რომ მეც ისეთივე ღირებული ადამიანი ვარ, როგორიც სხვები.",
    textEn:
      "I feel that I am a person of worth, at least on an equal plane with others.",
    themeKa: "თანასწორი ღირებულების განცდა",
    themeEn: "Sense of equal worth",
    strengthKa: "საკუთარ თავს სხვების თანასწორად ღირებულ ადამიანად აღიქვამ.",
    strengthEn: "You see yourself as a person of worth, equal to others.",
    reflectionKa:
      "დააკვირდი ურთიერთობებსა და გარემოებებს, სადაც საკუთარ საჭიროებებს სხვისაზე ნაკლებად მნიშვნელოვნად მიიჩნევ.",
    reflectionEn:
      "Notice the relationships and situations where you treat your own needs as less important than other people's.",
  },
  {
    id: 8,
    reverse: true,
    textKa: "ვისურვებდი, საკუთარი თავის მიმართ მეტი პატივისცემა მქონდეს.",
    textEn: "I wish I could have more respect for myself.",
    themeKa: "საკუთარი თავის პატივისცემა",
    themeEn: "Self-respect",
    strengthKa:
      "საკუთარი თავის მიმართ პატივისცემას უკვე საკმაოდ მყარად გრძნობ.",
    strengthEn: "You already feel a fairly steady respect for yourself.",
    reflectionKa:
      "იფიქრე ერთ პატარა ქმედებაზე, რომლითაც საკუთარ საზღვრებს, საჭიროებებს ან შრომას მეტ პატივს სცემ.",
    reflectionEn:
      "Think of one small action through which you honor your boundaries, your needs or your work a little more.",
  },
  {
    id: 9,
    reverse: true,
    textKa: "საერთო ჯამში, მგონია, რომ წარუმატებელი ადამიანი ვარ.",
    textEn: "All in all, I am inclined to feel that I am a failure.",
    themeKa: "წარუმატებლობის განცდა",
    themeEn: "Sense of failure",
    strengthKa:
      "ცალკეულ წარუმატებლობას საკუთარი პიროვნების საბოლოო შეფასებად არ აქცევ.",
    strengthEn:
      "You do not turn individual setbacks into a final verdict on who you are.",
    reflectionKa:
      "სცადე ერთმანეთისგან გამიჯნო „რაღაც ვერ გამომივიდა“ და „მე წარუმატებელი ვარ“, პირველი გამოცდილებაა, მეორე კი მკაცრი განაჩენი.",
    reflectionEn:
      "Try separating “something did not work out” from “I am a failure”. The first is an experience, the second is a harsh verdict.",
  },
  {
    id: 10,
    reverse: false,
    textKa: "საკუთარი თავის მიმართ დადებითი დამოკიდებულება მაქვს.",
    textEn: "I take a positive attitude toward myself.",
    themeKa: "დადებითი დამოკიდებულება საკუთარი თავისადმი",
    themeEn: "Positive attitude toward yourself",
    strengthKa:
      "საკუთარ თავთან ურთიერთობაში დადებითი და მხარდამჭერი დამოკიდებულება ჩანს.",
    strengthEn:
      "Your relationship with yourself shows a positive and supportive attitude.",
    reflectionKa:
      "შეამჩნიე, როგორ ელაპარაკები საკუთარ თავს შეცდომის შემდეგ, იმავე ტონით დაელაპარაკებოდი ახლობელ ადამიანს?",
    reflectionEn:
      "Notice how you speak to yourself after a mistake. Would you speak to someone close to you in the same tone?",
  },
];

export const ROSENBERG_QUESTION_COUNT = ROSENBERG_QUESTIONS.length;
