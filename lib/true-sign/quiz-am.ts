import content from "@/lib/true-sign/quiz-am.json";
import type { ZodiacSign } from "@/lib/zodiac";
import type { TsElement, TsModality, TsQuestion } from "@/lib/true-sign/quiz";

type ArmenianQuizContent = {
  questions: {
    id: number;
    textEn: string;
    options: { textEn: string; element?: TsElement; modality?: TsModality }[];
  }[];
  blurbs: Record<ZodiacSign["key"], string>;
};

const armenian = content as unknown as ArmenianQuizContent;

export const TS_QUESTIONS_AM: TsQuestion[] = armenian.questions.map((question) => ({
  id: question.id,
  textKa: question.textEn,
  textEn: question.textEn,
  options: question.options.map((option) => ({
    ...option,
    textKa: option.textEn,
  })),
}));
export const TS_SIGN_BLURB_AM = armenian.blurbs;
