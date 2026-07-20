/**
 * "რომელი ზოდიაქოს ნიშანი ხარ სინამდვილეში?" — a personality quiz that guesses
 * the sign you actually EMBODY (which may differ from your birth sign).
 *
 * Astrologically principled scoring: every sign is one (element × modality)
 * pair — 4 elements × 3 modalities = the 12 signs. So the quiz just measures
 * your dominant element (fire/earth/air/water) and modality (cardinal/fixed/
 * mutable), and their intersection is your "true" sign. This guarantees all 12
 * signs are reachable and balanced. A fun, free, shareable quiz — no scoring
 * dimensions to gate, no persistence.
 */

import { SIGNS, type ZodiacSign } from "@/lib/zodiac";

export type TsElement = ZodiacSign["element"]; // ცეცხლი | მიწა | ჰაერი | წყალი
export type TsModality = ZodiacSign["modality"]; // კარდინალური | ფიქსირებული | მუტაბელური

/** An option carries EITHER an element (element questions) or a modality. */
export type TsOption = {
  textKa: string;
  element?: TsElement;
  modality?: TsModality;
};
export type TsQuestion = { id: number; textKa: string; options: TsOption[] };

const F: TsElement = "ცეცხლი";
const E: TsElement = "მიწა";
const A: TsElement = "ჰაერი";
const W: TsElement = "წყალი";
const C: TsModality = "კარდინალური";
const X: TsModality = "ფიქსირებული";
const M: TsModality = "მუტაბელური";

export const TS_QUESTIONS: TsQuestion[] = [
  // ── Element questions ────────────────────────────────────────────────────
  {
    id: 1,
    textKa: "წვეულებაზე ხარ. სად გნახავენ?",
    options: [
      { textKa: "ცეკვის შუაგულში, ყველას ვამხნევებ", element: F },
      { textKa: "ყველასთან ვსაუბრობ, ახალ ხალხს ვეცნობი", element: A },
      { textKa: "კუთხეში, ერთ ადამიანთან ღრმა საუბარში", element: W },
      { textKa: "მასპინძელს ვეხმარები ან ადრე მივდივარ", element: E },
    ],
  },
  {
    id: 2,
    textKa: "რა გამოგიყვანს მწყობრიდან ყველაზე მალე?",
    options: [
      { textKa: "ნელი, უსაქმური ტემპი", element: F },
      { textKa: "ქაოსი და გაუთვალისწინებელი ცვლილებები", element: E },
      { textKa: "მოსაწყენი, ერთფეროვანი რუტინა", element: A },
      { textKa: "სიცივე და ემოციური სიშორე", element: W },
    ],
  },
  {
    id: 3,
    textKa: "გადაწყვეტილებას იღებ...",
    options: [
      { textKa: "ინსტინქტით, სწრაფად", element: F },
      { textKa: "ფაქტებისა და პრაქტიკულობის მიხედვით", element: E },
      { textKa: "ლოგიკით, ყველაფრის აწონ-დაწონვით", element: A },
      { textKa: "იმით, რასაც გული და ინტუიცია მკარნახობს", element: W },
    ],
  },
  {
    id: 4,
    textKa: "იდეალური დასვენება?",
    options: [
      { textKa: "თავგადასავალი, ადრენალინი, ახალი ქვეყანა", element: F },
      { textKa: "კომფორტი, ბუნება და გემრიელი საჭმელი", element: E },
      { textKa: "ახალი ხალხი, ფესტივალები, საუბრები", element: A },
      { textKa: "სიმშვიდე წყალთან, ახლობელთან ერთად", element: W },
    ],
  },
  {
    id: 5,
    textKa: "მეგობრები შენზე ამბობენ, რომ ხარ...",
    options: [
      { textKa: "მამაცი და ენერგიული", element: F },
      { textKa: "საიმედო და მიწიერი", element: E },
      { textKa: "ჭკვიანი და მხიარული", element: A },
      { textKa: "თბილი და გამგები", element: W },
    ],
  },
  {
    id: 6,
    textKa: "რა გიზიდავს ადამიანში ყველაზე მეტად?",
    options: [
      { textKa: "ვნება და თავდაჯერებულობა", element: F },
      { textKa: "სტაბილურობა და პატიოსნება", element: E },
      { textKa: "ინტელექტი და იუმორი", element: A },
      { textKa: "სიღრმე და მგრძნობელობა", element: W },
    ],
  },
  {
    id: 7,
    textKa: "როცა სტრესში ხარ...",
    options: [
      { textKa: "ვმოქმედებ, ენერგიას ვხარჯავ", element: F },
      { textKa: "ჩვეულ, კომფორტულ საქმეებს ვუბრუნდები", element: E },
      { textKa: "ბევრს ვსაუბრობ ან ვანალიზებ", element: A },
      { textKa: "ვიკეტები და განვიცდი", element: W },
    ],
  },

  // ── Modality questions ───────────────────────────────────────────────────
  {
    id: 8,
    textKa: "ახალი პროექტი. შენი როლი?",
    options: [
      { textKa: "ვიწყებ და სხვებს ვუძღვები", modality: C },
      { textKa: "ბოლომდე მიმყავს, არ ვნებდები", modality: X },
      { textKa: "ვეგუები და გეგმას საჭიროებისამებრ ვცვლი", modality: M },
    ],
  },
  {
    id: 9,
    textKa: "გეგმები ბოლო წუთს იცვლება. შენ...",
    options: [
      { textKa: "სწრაფად ვიღებ ინიციატივას", modality: C },
      { textKa: "ვღიზიანდები — მიყვარს, როცა წინასწარ ვგეგმავ", modality: X },
      { textKa: "მშვიდად ვეგუები, ისედაც მოქნილი ვარ", modality: M },
    ],
  },
  {
    id: 10,
    textKa: "როგორი ხარ ჩვევებში?",
    options: [
      { textKa: "მუდამ ახალ მიზნებს ვისახავ", modality: C },
      { textKa: "ჩემს რუტინას მტკიცედ ვიცავ", modality: X },
      { textKa: "განწყობის მიხედვით ვცვლი", modality: M },
    ],
  },
  {
    id: 11,
    textKa: "კამათში...",
    options: [
      { textKa: "საკითხს პირველი ვაყენებ და კამათს ვუძღვები", modality: C },
      { textKa: "ჩემს აზრზე მყარად ვდგავარ", modality: X },
      { textKa: "ვცდილობ, ორივე მხარეს გავუგო", modality: M },
    ],
  },
  {
    id: 12,
    textKa: "ცხოვრებას უფრო ხშირად...",
    options: [
      { textKa: "მე ვმართავ და ვქმნი", modality: C },
      { textKa: "გზას ვირჩევ და მივყვები", modality: X },
      { textKa: "ნაკადს მივყვები, საითაც წამიყვანს", modality: M },
    ],
  },
];

export const TS_QUESTION_COUNT = TS_QUESTIONS.length;

/** One punchy, flattering line per sign — the "why you're really this" reveal. */
export const TS_SIGN_BLURB: Record<ZodiacSign["key"], string> = {
  aries:
    "შენში ცეცხლი და ინიციატივა ერწყმის — პირველი ხარ ბრძოლაში, მამაცი და შეუჩერებელი. ვერძის ენერგია გამოგარჩევს.",
  leo:
    "ცეცხლი და სიმტკიცე — ბრწყინავ, ხარ ლიდერი დიდი გულით, რომელსაც სითბო და აღიარება უყვარს. ლომის სული გაქვს.",
  sagittarius:
    "ცეცხლი და თავისუფლება — ცნობისმოყვარე მოგზაური ხარ, გულახდილი და თავგადასავლების მოყვარული. მშვილდოსნის სული გამოგარჩევს.",
  capricorn:
    "მიწა და ამბიცია — მიზანდასახული, დისციპლინირებული და გამძლე. ნელა, მაგრამ მტკიცედ მიიწევ მწვერვალისკენ. თხის რქის ხასიათი გაქვს.",
  taurus:
    "მიწა და სიმტკიცე — საიმედო, მომთმენი და კომფორტის მოყვარული. ერთხელ რომ გადაწყვეტ, უკან აღარ იხევ. კუროს ბუნება გაქვს.",
  virgo:
    "მიწა და ზუსტი გონება — პრაქტიკული, დეტალების მიმართ ყურადღებიანი და მუდამ დამხმარე. ქალწულის ნიჭი გამოგარჩევს.",
  libra:
    "ჰაერი და ჰარმონია — დიპლომატი, სილამაზისა და სამართლიანობის მოყვარული, რომელიც კავშირებს აშენებს. სასწორის სული გაქვს.",
  aquarius:
    "ჰაერი და ორიგინალობა — დამოუკიდებელი მოაზროვნე, ორიგინალური და მომავალზე ორიენტირებული. მერწყულის სული გამოგარჩევს.",
  gemini:
    "ჰაერი და ცნობისმოყვარეობა — მახვილგონივრული, კომუნიკაბელური და ყველაფრით დაინტერესებული. ტყუპების ენერგია გაქვს.",
  cancer:
    "წყალი და მზრუნველობა — ემოციური, ერთგული და ახლობლებზე ორიენტირებული, ძლიერი ინტუიციით. კირჩხიბის გული გაქვს.",
  scorpio:
    "წყალი და ინტენსივობა — ღრმა, ვნებიანი და მიზანდასახული, ძლიერი ნებით. მორიელის სული გამოგარჩევს.",
  pisces:
    "წყალი და წარმოსახვა — მგრძნობიარე, თანამგრძნობი და შემოქმედი, მდიდარი შინაგანი სამყაროთი. თევზების სული გაქვს.",
};

export type TsResult = {
  sign: ZodiacSign;
  element: TsElement;
  modality: TsModality;
  blurbKa: string;
};

const ELEMENT_ORDER: TsElement[] = ["ცეცხლი", "მიწა", "ჰაერი", "წყალი"];
const MODALITY_ORDER: TsModality[] = [
  "კარდინალური",
  "ფიქსირებული",
  "მუტაბელური",
];

function topKey<T extends string>(tally: Record<string, number>, order: T[]): T {
  let best = order[0];
  let bestCount = -1;
  for (const key of order) {
    const count = tally[key] ?? 0;
    if (count > bestCount) {
      best = key;
      bestCount = count;
    }
  }
  return best;
}

/** answers: questionId → chosen option index. */
export function scoreTrueSign(answers: Record<number, number>): TsResult {
  const elementTally: Record<string, number> = {};
  const modalityTally: Record<string, number> = {};

  for (const q of TS_QUESTIONS) {
    const choice = answers[q.id];
    const opt = q.options[choice];
    if (!opt) continue;
    if (opt.element) elementTally[opt.element] = (elementTally[opt.element] ?? 0) + 1;
    if (opt.modality) modalityTally[opt.modality] = (modalityTally[opt.modality] ?? 0) + 1;
  }

  const element = topKey(elementTally, ELEMENT_ORDER);
  const modality = topKey(modalityTally, MODALITY_ORDER);
  const sign =
    SIGNS.find((s) => s.element === element && s.modality === modality) ?? SIGNS[0];

  return { sign, element, modality, blurbKa: TS_SIGN_BLURB[sign.key] };
}

/** localStorage key so a share-back link or refresh can reopen the result. */
export const TS_ANSWERS_STORAGE_KEY = "vivida_truesign_answers";
