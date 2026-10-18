import { ZODIAC_SIGNS, type ZodiacSign } from "@/lib/zodiac";

export type TsOption = {
  textKa: string;
  textEn: string;
  element: "ცეცხლი" | "მიწა" | "ჰაერი" | "წყალი";
  modality: "კარდინალური" | "ფიქსირებული" | "მუტაბელური";
};

export type TsQuestion = {
  id: number;
  textKa: string;
  textEn: string;
  options: TsOption[];
};

export const TS_ELEMENT_EN: Record<string, string> = {
  ცეცხლი: "Fire",
  მიწა: "Earth",
  ჰაერი: "Air",
  წყალი: "Water",
};

export const TS_MODALITY_EN: Record<string, string> = {
  კარდინალური: "Cardinal",
  ფიქსირებული: "Fixed",
  მუტაბელური: "Mutable",
};

export const TS_QUESTIONS: TsQuestion[] = [
  {
    id: 1,
    textKa: "როცა მოულოდნელი ცვლილება ხდება, შენი პირველი რეაქციაა:",
    textEn: "When an unexpected change happens, your first reaction is:",
    options: [
      {
        textKa: "მაშინვე მოქმედებაზე გადავდივარ",
        textEn: "I jump straight into action",
        element: "ცეცხლი",
        modality: "კარდინალური",
      },
      {
        textKa: "მშვიდად ვადგენ ახალ პრაქტიკულ გეგმას",
        textEn: "I calmly build a practical new plan",
        element: "მიწა",
        modality: "ფიქსირებული",
      },
      {
        textKa: "ყველა ვარიანტს ვაანალიზებ და განვიხილავ",
        textEn: "I analyze and discuss every angle",
        element: "ჰაერი",
        modality: "მუტაბელური",
      },
      {
        textKa: "ჯერ შინაგანად ვგრძნობ სიტუაციის განწყობას",
        textEn: "I tune in to how the situation feels first",
        element: "წყალი",
        modality: "კარდინალური",
      },
    ],
  },
  {
    id: 2,
    textKa: "მეგობრების წრეში ყველაზე ხშირად შენ ხარ ის, ვინც:",
    textEn: "Among friends, you are most often the one who:",
    options: [
      {
        textKa: "ახალ თავგადასავლებს და იდეებს იწყებს",
        textEn: "Sparks new adventures and bold ideas",
        element: "ცეცხლი",
        modality: "ფიქსირებული",
      },
      {
        textKa: "საიმედო საყრდენია და ყველაფერს ბოლომდე მიიყვანს",
        textEn: "Provides steady support and follows through",
        element: "მიწა",
        modality: "კარდინალური",
      },
      {
        textKa: "საუბარს აცოცხლებს და ადამიანებს აკავშირებს",
        textEn: "Keeps the conversation lively and connects people",
        element: "ჰაერი",
        modality: "კარდინალური",
      },
      {
        textKa: "უსიტყვოდ ხვდება, ვინ როგორ გრძნობს თავს",
        textEn: "Senses how everyone is feeling without words",
        element: "წყალი",
        modality: "მუტაბელური",
      },
    ],
  },
  {
    id: 3,
    textKa: "რთული გადაწყვეტილების მიღებისას ყველაზე მეტად ეყრდნობი:",
    textEn: "When making a tough decision, you rely most on:",
    options: [
      {
        textKa: "შინაგან ცეცხლს და სითამამეს",
        textEn: "Instinct, courage, and momentum",
        element: "ცეცხლი",
        modality: "მუტაბელური",
      },
      {
        textKa: "ფაქტებს, გამოცდილებას და რეალურ შედეგს",
        textEn: "Facts, experience, and tangible outcomes",
        element: "მიწა",
        modality: "მუტაბელური",
      },
      {
        textKa: "ობიექტურ ლოგიკას და სამართლიანობას",
        textEn: "Objective logic and fairness",
        element: "ჰაერი",
        modality: "ფიქსირებული",
      },
      {
        textKa: "ღრმა ინტუიციას და გულის ხმას",
        textEn: "Deep intuition and emotional truth",
        element: "წყალი",
        modality: "ფიქსირებული",
      },
    ],
  },
];

export const TS_QUESTIONS_EN = TS_QUESTIONS;
export const TS_QUESTION_COUNT = TS_QUESTIONS.length;

export type TsResult = {
  sign: ZodiacSign;
  element: string;
  modality: string;
  blurbKa: string;
  blurbEn: string;
};

export function scoreTrueSign(answers: Record<number, number>): TsResult {
  const elCount: Record<string, number> = {
    ცეცხლი: 0,
    მიწა: 0,
    ჰაერი: 0,
    წყალი: 0,
  };
  const modCount: Record<string, number> = {
    კარდინალური: 0,
    ფიქსირებული: 0,
    მუტაბელური: 0,
  };

  for (const q of TS_QUESTIONS) {
    const idx = answers[q.id] ?? 0;
    const opt = q.options[idx] ?? q.options[0];
    if (opt) {
      elCount[opt.element] = (elCount[opt.element] ?? 0) + 1;
      modCount[opt.modality] = (modCount[opt.modality] ?? 0) + 1;
    }
  }

  const topElement = Object.keys(elCount).reduce((a, b) =>
    elCount[b] > elCount[a] ? b : a,
  );
  const topModality = Object.keys(modCount).reduce((a, b) =>
    modCount[b] > modCount[a] ? b : a,
  );

  const matched =
    ZODIAC_SIGNS.find(
      (s) => s.element === topElement && s.modality === topModality,
    ) ?? ZODIAC_SIGNS[0];

  return {
    sign: matched,
    element: matched.element,
    modality: matched.modality,
    blurbKa: `შენი პასუხები ყველაზე მეტად ${matched.labelKa}-ის ენერგიას ეხმიანება — ${matched.element}ს სტიქია და ${matched.modality} ბუნება შენს ყოველდღიურ არჩევანში აშკარად ჩანს.`,
    blurbEn: `Your responses align most closely with ${matched.labelEn} — combining ${TS_ELEMENT_EN[matched.element]} energy with a ${TS_MODALITY_EN[matched.modality]} approach to life.`,
  };
}
