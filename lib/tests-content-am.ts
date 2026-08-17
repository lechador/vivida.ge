import content from "@/lib/tests-content-am.json";
import { MBTI_QUESTIONS_EN, type MbtiQuestion } from "@/lib/mbti-questions";
import { EQ_QUESTIONS_EN, type EqQuestion } from "@/lib/eq/questions";
import { BIG5_QUESTIONS_EN, type BigFiveQuestion } from "@/lib/big-five/questions";

type TextItem = { id: number; text: string };
type IqTextItem = { id: string; text: string; options: string[] };
type ArmenianTestContent = {
  mbti: TextItem[];
  eq: TextItem[];
  bigFive: TextItem[];
  iq: IqTextItem[];
};

const am = content as ArmenianTestContent;

function translatedQuestions<T extends { id: number; textKa: string; textEn?: string }>(
  source: T[],
  translations: TextItem[],
): T[] {
  const byId = new Map(translations.map((item) => [item.id, item.text]));
  return source.map((question) => {
    const text = byId.get(question.id);
    if (!text) throw new Error(`Missing Armenian assessment item ${question.id}`);
    return { ...question, textKa: text, textEn: text };
  });
}

export const MBTI_QUESTIONS_AM: MbtiQuestion[] = translatedQuestions(MBTI_QUESTIONS_EN, am.mbti);
export const EQ_QUESTIONS_AM: EqQuestion[] = translatedQuestions(EQ_QUESTIONS_EN, am.eq);
export const BIG5_QUESTIONS_AM: BigFiveQuestion[] = translatedQuestions(BIG5_QUESTIONS_EN, am.bigFive);

export const MBTI_LIKERT_AM = [
  { value: 3, labelKa: "Լիովին համաձայն եմ", labelEn: "Լիովին համաձայն եմ" },
  { value: 2, labelKa: "Համաձայն եմ", labelEn: "Համաձայն եմ" },
  { value: 1, labelKa: "Մասամբ համաձայն եմ", labelEn: "Մասամբ համաձայն եմ" },
  { value: 0, labelKa: "Չեզոք", labelEn: "Չեզոք" },
  { value: -1, labelKa: "Մասամբ համաձայն չեմ", labelEn: "Մասամբ համաձայն չեմ" },
  { value: -2, labelKa: "Համաձայն չեմ", labelEn: "Համաձայն չեմ" },
  { value: -3, labelKa: "Բոլորովին համաձայն չեմ", labelEn: "Բոլորովին համաձայն չեմ" },
];

export const FIVE_POINT_LIKERT_AM = [
  { value: 1, labelKa: "Բոլորովին համաձայն չեմ", labelEn: "Բոլորովին համաձայն չեմ" },
  { value: 2, labelKa: "Համաձայն չեմ", labelEn: "Համաձայն չեմ" },
  { value: 3, labelKa: "Ո՛չ համաձայն եմ, ո՛չ համաձայն չեմ", labelEn: "Ո՛չ համաձայն եմ, ո՛չ համաձայն չեմ" },
  { value: 4, labelKa: "Համաձայն եմ", labelEn: "Համաձայն եմ" },
  { value: 5, labelKa: "Լիովին համաձայն եմ", labelEn: "Լիովին համաձայն եմ" },
];

export const IQ_TEXT_AM: ReadonlyMap<string, IqTextItem> = new Map(
  am.iq.map((item) => [item.id, item]),
);

export const IQ_STEM_PROMPT_AM = {
  "number-series": "Ո՞ր թիվն է շարունակում հաջորդականությունը։",
  matrix: "Ո՞ր պատկերն է պատկանում բաց թողնված վանդակին։",
  analogy: "Առաջին զույգի կանոնը կիրառեք երկրորդի նկատմամբ։ Ո՞ր պատկերն է բացակայում։",
  "odd-one-out": "Ընտրեք այն պատկերը, որը չի համապատասխանում մյուսներին։",
  logic: "",
} as const;

export const IQ_DOMAINS_AM = {
  numeric: "Թվային տրամաբանություն",
  logic: "Տրամաբանական մտածողություն",
  spatial: "Տարածական մտածողություն",
  pattern: "Օրինաչափությունների ճանաչում",
} as const;

export const EQ_DOMAINS_AM = {
  "self-awareness": { name: "Ինքնագիտակցություն", tagline: "Սեփական հույզերը ճանաչելու և հասկանալու կարողություն" },
  "self-regulation": { name: "Ինքնակարգավորում", tagline: "Հույզերի կառավարում և ազդակների վերահսկում" },
  motivation: { name: "Մոտիվացիա", tagline: "Ներքին մղում, լավատեսություն և հաստատակամություն" },
  empathy: { name: "Ապրումակցում", tagline: "Ուրիշների հույզերը ճանաչելու և հասկանալու կարողություն" },
  "social-skills": { name: "Սոցիալական հմտություններ", tagline: "Հարաբերություններ կառուցելու և կառավարելու կարողություն" },
} as const;

export const BIG5_TRAITS_AM = {
  openness: { name: "Բացություն", tagline: "Երևակայություն, հետաքրքրասիրություն և նորի հանդեպ բացություն" },
  conscientiousness: { name: "Բարեխղճություն", tagline: "Կազմակերպվածություն, կարգապահություն և պատասխանատվություն" },
  extraversion: { name: "Էքստրավերսիա", tagline: "Շփվողականություն, եռանդ և ինքնավստահություն" },
  agreeableness: { name: "Բարյացակամություն", tagline: "Կարեկցանք, վստահություն և համագործակցություն" },
  neuroticism: { name: "Նևրոտիզմ", tagline: "Հուզական զգայունություն և սթրեսի նկատմամբ արձագանք" },
} as const;
