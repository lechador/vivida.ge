/**
 * მიჯაჭვულობის სტილის ტესტის კითხვარი (KA-only).
 *
 * მეთოდოლოგია, ორიგინალური ქართული დებულებები, ორგანზომილებიანი
 * მოდელით (შფოთი × აცილება): თითო ღერძზე 12 პუნქტი, 5-ქულიანი Likert,
 * ღერძზე ~4 შებრუნებული პუნქტით (თანხმობის-ბაიასის კონტროლი:
 * შებრუნებული პუნქტი ფასდება `6 - raw`). ECR/ECR-R-ის ფორმულირებები
 * საავტოროა, ამიტომ აქ მეთოდი ვისესხეთ და ტექსტი თავიდან დავწერეთ,
 * ისევე, როგორც EQ-ტესტში SSEIT-თან მოვიქეცით.
 * ქულების დათვლა, ./scoring.ts.
 */

export type AttachmentAxis = "anxiety" | "avoidance";

export type AttachmentQuestion = {
  /** სტაბილური 1..24, შენახული პასუხების გასაღები. */
  id: number;
  axis: AttachmentAxis;
  textKa: string;
  /** შებრუნებული: ართანხმება მაღალ ქულას ნიშნავს (6 - raw). */
  reverse: boolean;
};

/** 5-ქულიანი თანხმობის სკალა (EQ/Big Five-ის იგივე ფორმატი). */
export const ATTACHMENT_OPTIONS = [
  { value: 1, labelKa: "სრულიად არ ვეთანხმები" },
  { value: 2, labelKa: "არ ვეთანხმები" },
  { value: 3, labelKa: "ნეიტრალურად" },
  { value: 4, labelKa: "ვეთანხმები" },
  { value: 5, labelKa: "სრულიად ვეთანხმები" },
] as const;

export const ATTACHMENT_QUESTIONS: AttachmentQuestion[] = [
  // --- შფოთი (anxiety): მიტოვების შიში, დ reassurance-ის საჭიროება ---
  {
    id: 1,
    axis: "anxiety",
    reverse: false,
    textKa:
      "ხშირად ვღელავ, რომ პარტნიორს ჩემზე ნაკლებად ადარდებს ჩვენი ურთიერთობა.",
  },
  {
    id: 2,
    axis: "anxiety",
    reverse: false,
    textKa: "მჭირდება დარწმუნება, რომ ურთიერთობაში ყველაფერი კარგადაა.",
  },
  {
    id: 3,
    axis: "anxiety",
    reverse: false,
    textKa: "როცა პარტნიორი გვიან მპასუხობს, მაშინვე ცუდზე ვფიქრობ.",
  },
  {
    id: 4,
    axis: "anxiety",
    reverse: false,
    textKa: "კონფლიქტის შემდეგ მომხდარს გონებაში დიდხანს ვატრიალებ.",
  },
  {
    id: 5,
    axis: "anxiety",
    reverse: false,
    textKa: "ვშიშობ, რომ პარტნიორი მიმატოვებს, თუ ჩემს სისუსტეებს დავანახებ.",
  },
  {
    id: 6,
    axis: "anxiety",
    reverse: false,
    textKa: "ურთიერთობის მომავალზე ხშირად ვფიქრობ და ვნერვიულობ.",
  },
  {
    id: 7,
    axis: "anxiety",
    reverse: false,
    textKa: "როცა პარტნიორის ყურადღება მაკლდება, თავს მიტოვებულად ვგრძნობ.",
  },
  {
    id: 8,
    axis: "anxiety",
    reverse: false,
    textKa: "პატარა დისტანციასაც ხშირად სერიოზულ სიგნალად აღვიქვამ.",
  },
  {
    id: 9,
    axis: "anxiety",
    reverse: true,
    textKa: "იშვიათად ვღელავ იმაზე, ნამდვილად ვუყვარვარ თუ არა.",
  },
  {
    id: 10,
    axis: "anxiety",
    reverse: true,
    textKa: "კონფლიქტის შემდეგ სიმშვიდეს საკმაოდ სწრაფად ვუბრუნდები.",
  },
  {
    id: 11,
    axis: "anxiety",
    reverse: true,
    textKa: "მშვიდად ვარ, როცა პარტნიორი ჩემ გარეშე საკუთარ საქმეებს აკეთებს.",
  },
  {
    id: 12,
    axis: "anxiety",
    reverse: true,
    textKa: "არ მჭირდება მუდმივი დადასტურება, რომ ყველაფერი კარგადაა.",
  },
  // --- აცილება (avoidance): სიახლოვის დისკომფორტი, დამოუკიდებლობა ---
  {
    id: 13,
    axis: "avoidance",
    reverse: false,
    textKa: "მიჭირს პარტნიორისთვის ღრმა გრძნობების გაზიარება.",
  },
  {
    id: 14,
    axis: "avoidance",
    reverse: false,
    textKa: "ემოციურ სიახლოვესთან შედარებით დამოუკიდებლობა მირჩევნია.",
  },
  {
    id: 15,
    axis: "avoidance",
    reverse: false,
    textKa: "როცა პარტნიორი ძალიან მიახლოვდება, უკან დახევის სურვილი მიჩნდება.",
  },
  {
    id: 16,
    axis: "avoidance",
    reverse: false,
    textKa: "სისუსტეების ჩვენება ახლო ურთიერთობაშიც არ მიყვარს.",
  },
  {
    id: 17,
    axis: "avoidance",
    reverse: false,
    textKa:
      "პრობლემების მარტო მოგვარება მირჩევნია, ვიდრე პარტნიორისთვის დახმარების თხოვნა.",
  },
  {
    id: 18,
    axis: "avoidance",
    reverse: false,
    textKa: "ხშირი ემოციური და ფიზიკური სიახლოვე ზოგჯერ მღლის.",
  },
  {
    id: 19,
    axis: "avoidance",
    reverse: false,
    textKa: "ურთიერთობაშიც ჩემს პირად სივრცეს მკაცრად ვიცავ.",
  },
  {
    id: 20,
    axis: "avoidance",
    reverse: false,
    textKa: "რთული საუბრების გადადება მჩვევია.",
  },
  {
    id: 21,
    axis: "avoidance",
    reverse: true,
    textKa: "პარტნიორთან ღიაობა ბუნებრივად და ადვილად გამომდის.",
  },
  {
    id: 22,
    axis: "avoidance",
    reverse: true,
    textKa: "პარტნიორზე დაყრდნობა ჩემთვის ბუნებრივი და მარტივია.",
  },
  {
    id: 23,
    axis: "avoidance",
    reverse: true,
    textKa: "როცა რამე მაწუხებს, პირველ რიგში პარტნიორისთვის გაზიარება მსურს.",
  },
  {
    id: 24,
    axis: "avoidance",
    reverse: true,
    textKa: "ჩახუტება და სიახლოვე მამშვიდებს.",
  },
];

export const ATTACHMENT_QUESTION_COUNT = ATTACHMENT_QUESTIONS.length;
