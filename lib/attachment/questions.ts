/**
 * მიჯაჭვულობის სტილის ტესტის კითხვარი (bilingual KA/EN).
 *
 * მეთოდოლოგია, ორიგინალური ქართული დებულებები, ორგანზომილებიანი
 * მოდელით (შფოთი × აცილება): თითო ღერძზე 12 პუნქტი, 5-ქულიანი Likert,
 * ღერძზე ~4 შებრუნებული პუნქტით (თანხმობის-ბაიასის კონტროლი:
 * შებრუნებული პუნქტი ფასდება `6 - raw`). ECR/ECR-R-ის ფორმულირებები
 * საავტოროა, ამიტომ აქ მეთოდი ვისესხეთ და ტექსტი თავიდან დავწერეთ,
 * ისევე, როგორც EQ-ტესტში SSEIT-თან მოვიქეცით.
 * ინგლისური ტექსტები (`textEn`, `labelEn`) ორიგინალური ქართული დებულებების
 * თარგმანია. ქულების დათვლა, ./scoring.ts.
 */

export type AttachmentAxis = "anxiety" | "avoidance";

export type AttachmentQuestion = {
  /** სტაბილური 1..24, შენახული პასუხების გასაღები. */
  id: number;
  axis: AttachmentAxis;
  textKa: string;
  /** იგივე დებულების ორიგინალური ინგლისური ვერსია. */
  textEn: string;
  /** შებრუნებული: ართანხმება მაღალ ქულას ნიშნავს (6 - raw). */
  reverse: boolean;
};

/** 5-ქულიანი თანხმობის სკალა (EQ/Big Five-ის იგივე ფორმატი). */
export const ATTACHMENT_OPTIONS = [
  { value: 1, labelKa: "სრულიად არ ვეთანხმები", labelEn: "Strongly disagree" },
  { value: 2, labelKa: "არ ვეთანხმები", labelEn: "Disagree" },
  { value: 3, labelKa: "ნეიტრალურად", labelEn: "Neither agree nor disagree" },
  { value: 4, labelKa: "ვეთანხმები", labelEn: "Agree" },
  { value: 5, labelKa: "სრულიად ვეთანხმები", labelEn: "Strongly agree" },
] as const;

export const ATTACHMENT_QUESTIONS: AttachmentQuestion[] = [
  // --- შფოთი (anxiety): მიტოვების შიში, დ reassurance-ის საჭიროება ---
  {
    id: 1,
    axis: "anxiety",
    reverse: false,
    textKa:
      "ხშირად ვღელავ, რომ პარტნიორს ჩემზე ნაკლებად ადარდებს ჩვენი ურთიერთობა.",
    textEn:
      "I often worry that my partner cares less about our relationship than I do.",
  },
  {
    id: 2,
    axis: "anxiety",
    reverse: false,
    textKa: "მჭირდება დარწმუნება, რომ ურთიერთობაში ყველაფერი კარგადაა.",
    textEn: "I need reassurance that everything is all right between us.",
  },
  {
    id: 3,
    axis: "anxiety",
    reverse: false,
    textKa: "როცა პარტნიორი გვიან მპასუხობს, მაშინვე ცუდზე ვფიქრობ.",
    textEn:
      "When my partner replies late, my mind jumps straight to the worst.",
  },
  {
    id: 4,
    axis: "anxiety",
    reverse: false,
    textKa: "კონფლიქტის შემდეგ მომხდარს გონებაში დიდხანს ვატრიალებ.",
    textEn:
      "After a conflict, I keep replaying what happened in my head for a long time.",
  },
  {
    id: 5,
    axis: "anxiety",
    reverse: false,
    textKa: "ვშიშობ, რომ პარტნიორი მიმატოვებს, თუ ჩემს სისუსტეებს დავანახებ.",
    textEn: "I fear my partner would leave me if I showed my weaknesses.",
  },
  {
    id: 6,
    axis: "anxiety",
    reverse: false,
    textKa: "ურთიერთობის მომავალზე ხშირად ვფიქრობ და ვნერვიულობ.",
    textEn: "I often think and worry about the future of the relationship.",
  },
  {
    id: 7,
    axis: "anxiety",
    reverse: false,
    textKa: "როცა პარტნიორის ყურადღება მაკლდება, თავს მიტოვებულად ვგრძნობ.",
    textEn: "When I miss my partner's attention, I feel abandoned.",
  },
  {
    id: 8,
    axis: "anxiety",
    reverse: false,
    textKa: "პატარა დისტანციასაც ხშირად სერიოზულ სიგნალად აღვიქვამ.",
    textEn: "I often read even small distance as a serious warning sign.",
  },
  {
    id: 9,
    axis: "anxiety",
    reverse: true,
    textKa: "იშვიათად ვღელავ იმაზე, ნამდვილად ვუყვარვარ თუ არა.",
    textEn: "I rarely worry about whether I am truly loved.",
  },
  {
    id: 10,
    axis: "anxiety",
    reverse: true,
    textKa: "კონფლიქტის შემდეგ სიმშვიდეს საკმაოდ სწრაფად ვუბრუნდები.",
    textEn: "I return to calm fairly quickly after a conflict.",
  },
  {
    id: 11,
    axis: "anxiety",
    reverse: true,
    textKa: "მშვიდად ვარ, როცა პარტნიორი ჩემ გარეშე საკუთარ საქმეებს აკეთებს.",
    textEn: "I feel at ease when my partner does their own things without me.",
  },
  {
    id: 12,
    axis: "anxiety",
    reverse: true,
    textKa: "არ მჭირდება მუდმივი დადასტურება, რომ ყველაფერი კარგადაა.",
    textEn: "I do not need constant confirmation that everything is fine.",
  },
  // --- აცილება (avoidance): სიახლოვის დისკომფორტი, დამოუკიდებლობა ---
  {
    id: 13,
    axis: "avoidance",
    reverse: false,
    textKa: "მიჭირს პარტნიორისთვის ღრმა გრძნობების გაზიარება.",
    textEn: "I find it hard to share deep feelings with my partner.",
  },
  {
    id: 14,
    axis: "avoidance",
    reverse: false,
    textKa: "ემოციურ სიახლოვესთან შედარებით დამოუკიდებლობა მირჩევნია.",
    textEn: "I prefer independence over emotional closeness.",
  },
  {
    id: 15,
    axis: "avoidance",
    reverse: false,
    textKa: "როცა პარტნიორი ძალიან მიახლოვდება, უკან დახევის სურვილი მიჩნდება.",
    textEn: "When my partner gets very close, I feel like pulling back.",
  },
  {
    id: 16,
    axis: "avoidance",
    reverse: false,
    textKa: "სისუსტეების ჩვენება ახლო ურთიერთობაშიც არ მიყვარს.",
    textEn: "I dislike showing vulnerability even in a close relationship.",
  },
  {
    id: 17,
    axis: "avoidance",
    reverse: false,
    textKa:
      "პრობლემების მარტო მოგვარება მირჩევნია, ვიდრე პარტნიორისთვის დახმარების თხოვნა.",
    textEn:
      "I would rather solve problems on my own than ask my partner for help.",
  },
  {
    id: 18,
    axis: "avoidance",
    reverse: false,
    textKa: "ხშირი ემოციური და ფიზიკური სიახლოვე ზოგჯერ მღლის.",
    textEn: "Frequent emotional and physical closeness sometimes exhausts me.",
  },
  {
    id: 19,
    axis: "avoidance",
    reverse: false,
    textKa: "ურთიერთობაშიც ჩემს პირად სივრცეს მკაცრად ვიცავ.",
    textEn: "I guard my personal space strictly, even in a relationship.",
  },
  {
    id: 20,
    axis: "avoidance",
    reverse: false,
    textKa: "რთული საუბრების გადადება მჩვევია.",
    textEn: "I tend to put off difficult conversations.",
  },
  {
    id: 21,
    axis: "avoidance",
    reverse: true,
    textKa: "პარტნიორთან ღიაობა ბუნებრივად და ადვილად გამომდის.",
    textEn: "Opening up to my partner comes naturally and easily to me.",
  },
  {
    id: 22,
    axis: "avoidance",
    reverse: true,
    textKa: "პარტნიორზე დაყრდნობა ჩემთვის ბუნებრივი და მარტივია.",
    textEn: "Leaning on my partner feels natural and easy to me.",
  },
  {
    id: 23,
    axis: "avoidance",
    reverse: true,
    textKa: "როცა რამე მაწუხებს, პირველ რიგში პარტნიორისთვის გაზიარება მსურს.",
    textEn:
      "When something troubles me, my first instinct is to share it with my partner.",
  },
  {
    id: 24,
    axis: "avoidance",
    reverse: true,
    textKa: "ჩახუტება და სიახლოვე მამშვიდებს.",
    textEn: "Hugs and closeness calm me down.",
  },
];

export const ATTACHMENT_QUESTION_COUNT = ATTACHMENT_QUESTIONS.length;
