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
  textEn?: string;
  element?: TsElement;
  modality?: TsModality;
};
export type TsQuestion = { id: number; textKa: string; textEn?: string; options: TsOption[] };

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
    textKa: "წვეულებაზე ხარ. სად უფრო სავარაუდოა, რომ გნახონ?",
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
      { textKa: "საქმის ნელი და გაწელილი ტემპი", element: F },
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
      { textKa: "ფაქტებსა და პრაქტიკულ მოსაზრებებზე დაყრდნობით", element: E },
      { textKa: "ლოგიკურად, ყველა მხარის აწონ-დაწონით", element: A },
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
      { textKa: "თბილი და გულისხმიერი", element: W },
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
      { textKa: "ნაცნობ და კომფორტულ საქმეებს ვუბრუნდები", element: E },
      { textKa: "ბევრს ვსაუბრობ ან ვანალიზებ", element: A },
      { textKa: "საკუთარ თავში ვიკეტები და ყველაფერს მძაფრად განვიცდი", element: W },
    ],
  },

  // ── Modality questions ───────────────────────────────────────────────────
  {
    id: 8,
    textKa: "ახალი პროექტი. შენი როლი?",
    options: [
      { textKa: "ვიწყებ და სხვებს ვუძღვები", modality: C },
      { textKa: "ბოლომდე მიმყავს, არ ვნებდები", modality: X },
      { textKa: "ვითარებას ვერგები და გეგმას საჭიროებისამებრ ვცვლი", modality: M },
    ],
  },
  {
    id: 9,
    textKa: "გეგმები ბოლო წუთს იცვლება. შენ...",
    options: [
      { textKa: "სწრაფად ვიღებ ინიციატივას", modality: C },
      { textKa: "ვღიზიანდები — მიყვარს, როცა წინასწარ ვგეგმავ", modality: X },
      { textKa: "ცვლილებას მშვიდად ვხვდები — ადვილად ვერგები", modality: M },
    ],
  },
  {
    id: 10,
    textKa: "როგორ ეკიდები საკუთარ ჩვევებს?",
    options: [
      { textKa: "მუდამ ახალ მიზნებს ვისახავ", modality: C },
      { textKa: "ჩემს რუტინას მტკიცედ ვიცავ", modality: X },
      { textKa: "ვითარებისა და განწყობის მიხედვით ვცვლი", modality: M },
    ],
  },
  {
    id: 11,
    textKa: "კამათში...",
    options: [
      { textKa: "ჩემს პოზიციას პირველი ვაფიქსირებ და კამათს მიმართულებას ვაძლევ", modality: C },
      { textKa: "ჩემს აზრზე მყარად ვდგავარ", modality: X },
      { textKa: "ვცდილობ, ორივე მხარეს გავუგო", modality: M },
    ],
  },
  {
    id: 12,
    textKa: "ცხოვრებაში უფრო ხშირად...",
    options: [
      { textKa: "ინიციატივას ვიღებ და მიმართულებას თავად ვქმნი", modality: C },
      { textKa: "გზას ვირჩევ და მას მტკიცედ მივყვები", modality: X },
      { textKa: "ვითარებას ვერგები და დინებას მივყვები", modality: M },
    ],
  },
];

const TS_TEXT_EN = [
  "You are at a party. Where are people most likely to find you?",
  "What throws you off balance most quickly?",
  "You usually make a decision…",
  "What sounds like an ideal break?",
  "Your friends are most likely to describe you as…",
  "What attracts you most strongly to another person?",
  "When you are under stress…",
  "A new project begins. What role do you take?",
  "Plans change at the last minute. What do you do?",
  "How do you relate to your habits?",
  "During a disagreement…",
  "In life, you are more likely to…",
];

const TS_OPTIONS_EN = [
  ["In the middle of the dance floor, energizing everyone", "Talking to everyone and meeting new people", "In a corner, having a deep conversation with one person", "Helping the host—or leaving early"],
  ["A slow, drawn-out pace", "Chaos and unexpected changes", "A dull, repetitive routine", "Coldness and emotional distance"],
  ["Quickly, by instinct", "By relying on facts and practical considerations", "Logically, after weighing every side", "By following my feelings and intuition"],
  ["Adventure, adrenaline and a new country", "Comfort, nature and excellent food", "New people, festivals and conversation", "Peace by the water with someone close"],
  ["Bold and energetic", "Reliable and grounded", "Clever and entertaining", "Warm and considerate"],
  ["Passion and confidence", "Stability and honesty", "Intelligence and humor", "Depth and sensitivity"],
  ["I act and burn off the energy", "I return to familiar, comforting activities", "I talk a lot or analyze everything", "I withdraw and feel everything intensely"],
  ["I start it and lead others", "I carry it through and refuse to give up", "I adapt and revise the plan as needed"],
  ["I quickly take the initiative", "I get irritated—I like plans to stay settled", "I take it calmly and adapt with ease"],
  ["I am always setting a new goal", "I stick firmly to my routine", "I change them with circumstances and mood"],
  ["I state my position first and set the direction", "I hold firmly to my view", "I try to understand both sides"],
  ["Take initiative and create the direction", "Choose a path and follow it steadily", "Adapt to circumstances and move with the flow"],
];

export const TS_QUESTIONS_EN: TsQuestion[] = TS_QUESTIONS.map((question, index) => ({
  ...question,
  textEn: TS_TEXT_EN[index],
  options: question.options.map((option, optionIndex) => ({ ...option, textEn: TS_OPTIONS_EN[index]?.[optionIndex] })),
}));

export const TS_QUESTION_COUNT = TS_QUESTIONS.length;

/** One punchy, flattering line per sign — the "why you're really this" reveal. */
export const TS_SIGN_BLURB: Record<ZodiacSign["key"], string> = {
  aries:
    "შენში ცეცხლი და ინიციატივა ერთმანეთს ერწყმის — გამოწვევას პირველი ხვდები, მამაცი და შეუჩერებელი ხარ. ვერძის ენერგია გამოგარჩევს.",
  leo:
    "შენში ცეცხლი და სიმტკიცე ერთიანდება — ბრწყინავ და დიდი გულის მქონე ლიდერი ხარ, რომელსაც სითბო და აღიარება უყვარს. ლომის სული გაქვს.",
  sagittarius:
    "შენში ცეცხლი და თავისუფლების სიყვარული ერთიანდება — ცნობისმოყვარე, გულახდილი და თავგადასავლების მოყვარული ხარ. მშვილდოსნის სული გამოგარჩევს.",
  capricorn:
    "შენში მიწის სიმტკიცე და ამბიცია ერთიანდება — მიზანდასახული, დისციპლინირებული და გამძლე ხარ. მწვერვალისკენ აუჩქარებლად, მაგრამ მტკიცედ მიიწევ. თხის რქის ხასიათი გაქვს.",
  taurus:
    "შენში მიწის ენერგია და სიმტკიცე ერთიანდება — საიმედო, მომთმენი და კომფორტის მოყვარული ხარ. გადაწყვეტილებას რომ მიიღებ, უკან იშვიათად იხევ. კუროს ბუნება გაქვს.",
  virgo:
    "შენში მიწის პრაქტიკულობა და ზუსტი გონება ერთიანდება — დეტალებს ამჩნევ და ყოველთვის მზად ხარ სხვების დასახმარებლად. ქალწულის ნიჭი გამოგარჩევს.",
  libra:
    "შენში ჰაერის სიმსუბუქე და ჰარმონიის სურვილი ერთიანდება — დიპლომატიური ხარ, სილამაზესა და სამართლიანობას აფასებ და ადამიანებს შორის კავშირებს ქმნი. სასწორის სული გაქვს.",
  aquarius:
    "შენში ჰაერის თავისუფლება და ორიგინალობა ერთიანდება — დამოუკიდებლად აზროვნებ, განსხვავებულ იდეებს არ უშინდები და მომავალზე ხარ ორიენტირებული. მერწყულის სული გამოგარჩევს.",
  gemini:
    "შენში ჰაერის სიმსუბუქე და ცნობისმოყვარეობა ერთიანდება — მახვილგონივრული, კომუნიკაბელური და მრავალფეროვანი საკითხებით დაინტერესებული ხარ. ტყუპების ენერგია გაქვს.",
  cancer:
    "შენში წყლის სიღრმე და მზრუნველობა ერთიანდება — ემოციური ხარ, ახლობლებისადმი ერთგული და ძლიერი ინტუიცია გაქვს. კირჩხიბის გული გაქვს.",
  scorpio:
    "შენში წყლის სიღრმე და ძლიერი ვნება ერთიანდება — მიზანდასახული ხარ, მტკიცე ნება გაქვს და მოვლენებს ზედაპირულად არ უყურებ. მორიელის სული გამოგარჩევს.",
  pisces:
    "შენში წყლის სიღრმე და წარმოსახვა ერთიანდება — მგრძნობიარე, თანამგრძნობი და შემოქმედებითი ხარ, მდიდარი შინაგანი სამყარო გაქვს. თევზების სული გაქვს.",
};

export const TS_SIGN_BLURB_EN: Record<ZodiacSign["key"], string> = {
  aries: "Fire and initiative meet in you: you face a challenge first, move boldly and create momentum. Your personality carries unmistakable Aries energy.",
  leo: "Fire and steadiness meet in you: you are expressive, generous and naturally ready to lead. Your personality carries the warm confidence of Leo.",
  sagittarius: "Fire and freedom meet in you: you are candid, curious and drawn toward discovery. Your personality carries the adventurous spirit of Sagittarius.",
  capricorn: "Earth and initiative meet in you: you are ambitious, disciplined and willing to climb patiently. Your personality carries Capricorn determination.",
  taurus: "Earth and steadiness meet in you: you are reliable, patient and appreciative of real comfort. Your personality carries the grounded resolve of Taurus.",
  virgo: "Earth and adaptability meet in you: you notice details, improve what is practical and readily make yourself useful. Your personality carries Virgo precision.",
  libra: "Air and initiative meet in you: you seek fairness, create connection and notice the balance within a room. Your personality carries Libra diplomacy.",
  aquarius: "Air and steadiness meet in you: you think independently, hold to original ideas and look toward the future. Your personality carries Aquarius vision.",
  gemini: "Air and adaptability meet in you: you are quick-minded, communicative and interested in many directions at once. Your personality carries Gemini curiosity.",
  cancer: "Water and initiative meet in you: you are intuitive, protective and deeply loyal to the people you trust. Your personality carries the caring heart of Cancer.",
  scorpio: "Water and steadiness meet in you: you feel intensely, commit deeply and rarely accept a surface-level answer. Your personality carries Scorpio focus.",
  pisces: "Water and adaptability meet in you: you are sensitive, imaginative and naturally receptive to other people. Your personality carries the creative spirit of Pisces.",
};

export type TsResult = {
  sign: ZodiacSign;
  element: TsElement;
  modality: TsModality;
  blurbKa: string;
  blurbEn: string;
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

  return { sign, element, modality, blurbKa: TS_SIGN_BLURB[sign.key], blurbEn: TS_SIGN_BLURB_EN[sign.key] };
}

export const TS_ELEMENT_EN: Record<TsElement, string> = { ცეცხლი: "Fire", მიწა: "Earth", ჰაერი: "Air", წყალი: "Water" };
export const TS_MODALITY_EN: Record<TsModality, string> = { კარდინალური: "Cardinal", ფიქსირებული: "Fixed", მუტაბელური: "Mutable" };

/** localStorage key so a share-back link or refresh can reopen the result. */
export const TS_ANSWERS_STORAGE_KEY = "vivida_truesign_answers";
