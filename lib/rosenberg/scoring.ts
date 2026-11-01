import {
  ROSENBERG_QUESTIONS,
  type RosenbergQuestion,
} from "@/lib/rosenberg/questions";

export type RosenbergBand = "lower" | "middle" | "higher";

export type RosenbergItemResult = {
  id: number;
  score: number;
  themeKa: string;
  themeEn: string;
  strengthKa: string;
  strengthEn: string;
  reflectionKa: string;
  reflectionEn: string;
};

export type RosenbergResult = {
  score: number;
  percentage: number;
  band: RosenbergBand;
  labelKa: string;
  labelEn: string;
  summaryKa: string;
  summaryEn: string;
  nextStepsKa: string[];
  nextStepsEn: string[];
  strengths: RosenbergItemResult[];
  reflections: RosenbergItemResult[];
};

const BAND_CONTENT: Record<
  RosenbergBand,
  {
    labelKa: string;
    labelEn: string;
    summaryKa: string;
    summaryEn: string;
    nextStepsKa: string[];
    nextStepsEn: string[];
  }
> = {
  lower: {
    labelKa: "თვითშეფასება ახლა მოწყვლადია",
    labelEn: "Your self-esteem feels vulnerable right now",
    summaryKa:
      "შენი პასუხები მიანიშნებს, რომ ამ პერიოდში საკუთარ თავს ხშირად მკაცრად აფასებ და საკუთარი ღირებულების განცდა შეიძლება მყიფე იყოს. ეს ქულა შენს რეალურ ღირებულებას არ განსაზღვრავს, ის მხოლოდ იმას აღწერს, როგორ უყურებ საკუთარ თავს ახლა.",
    summaryEn:
      "Your answers suggest that lately you often judge yourself harshly, and your sense of your own worth may feel fragile. This score does not define your real worth. It only describes how you see yourself right now.",
    nextStepsKa: [
      "შეამჩნიე, როდის გადადის ერთი შეცდომის შეფასება მთელი საკუთარი თავის შეფასებაში.",
      "ყოველდღე ჩაინიშნე ერთი კონკრეტული თვისება, ძალისხმევა ან მოქმედება, რომელსაც საკუთარ თავში აფასებ.",
      "თუ თვითდაკნინება ხშირად გაწუხებს ან ყოველდღიურ ცხოვრებას გირთულებს, სანდო ადამიანთან ან ფსიქიკური ჯანმრთელობის სპეციალისტთან საუბარი შეიძლება სასარგებლო იყოს.",
    ],
    nextStepsEn: [
      "Notice when judging one mistake turns into judging yourself as a whole.",
      "Each day, note one specific quality, effort or action in yourself that you value.",
      "If self-criticism troubles you often or makes daily life harder, talking with someone you trust or a mental health professional may help.",
    ],
  },
  middle: {
    labelKa: "თვითშეფასება მეტწილად დაბალანსებულია",
    labelEn: "Your self-esteem is mostly balanced",
    summaryKa:
      "საკუთარი თავისადმი დამოკიდებულებაში ჩანს როგორც მიღება, ისე ეჭვის მომენტები. სავარაუდოდ, ზოგ ვითარებაში საკუთარ ძალებს ენდობი, ხოლო წნეხის, შედარების ან წარუმატებლობის დროს თვითკრიტიკა ძლიერდება.",
    summaryEn:
      "Your attitude toward yourself shows both acceptance and moments of doubt. You probably trust your abilities in some situations, while self-criticism grows stronger under pressure, comparison or failure.",
    nextStepsKa: [
      "დააკვირდი, რომელ გარემოებებში ხდება შენი შინაგანი ხმა განსაკუთრებით მკაცრი.",
      "შეაფასე საკუთარი თავი არა მხოლოდ შედეგით, არამედ ძალისხმევით, არჩევანითა და წინსვლითაც.",
    ],
    nextStepsEn: [
      "Notice in which situations your inner voice becomes especially harsh.",
      "Judge yourself not only by results, but also by effort, choices and progress.",
    ],
  },
  higher: {
    labelKa: "თვითშეფასება მყარია",
    labelEn: "Your self-esteem is steady",
    summaryKa:
      "შენი პასუხები აჩვენებს საკუთარი ღირებულებისა და შესაძლებლობების საკმაოდ მყარ განცდას. მაღალი თვითშეფასება აქ ნიშნავს საკუთარი თავის პატივისცემასა და მიღებას, და არა სხვებზე აღმატებულობის განცდას.",
    summaryEn:
      "Your answers show a fairly steady sense of your own worth and abilities. High self-esteem here means self-respect and self-acceptance, not a sense of superiority over others.",
    nextStepsKa: [
      "შეინარჩუნე საკუთარი თავისადმი მხარდამჭერი დამოკიდებულება მაშინაც, როცა შეცდომას უშვებ.",
      "მყარი თვითშეფასება ყველაზე სასარგებლოა, როცა მას რეალისტური თვითრეფლექსია და სხვისი ღირებულების პატივისცემაც ახლავს.",
    ],
    nextStepsEn: [
      "Keep a supportive attitude toward yourself even when you make a mistake.",
      "Steady self-esteem is most helpful when it comes with realistic self-reflection and respect for other people's worth.",
    ],
  },
};

export function scoreRosenbergItem(
  question: Pick<RosenbergQuestion, "reverse">,
  answer: number,
): number {
  if (!Number.isInteger(answer) || answer < 1 || answer > 4) {
    throw new RangeError("Rosenberg answers must be integers from 1 to 4.");
  }
  return question.reverse ? 4 - answer : answer - 1;
}

export function rosenbergBand(score: number): RosenbergBand {
  if (score <= 14) return "lower";
  if (score <= 25) return "middle";
  return "higher";
}

export function calculateRosenberg(
  answers: Record<number, number>,
): RosenbergResult {
  const items = ROSENBERG_QUESTIONS.map((question) => {
    const answer = answers[question.id];
    if (answer === undefined) {
      throw new RangeError(
        "Missing Rosenberg answer for item " + question.id + ".",
      );
    }
    return {
      id: question.id,
      score: scoreRosenbergItem(question, answer),
      themeKa: question.themeKa,
      themeEn: question.themeEn,
      strengthKa: question.strengthKa,
      strengthEn: question.strengthEn,
      reflectionKa: question.reflectionKa,
      reflectionEn: question.reflectionEn,
    };
  });
  const score = items.reduce((sum, item) => sum + item.score, 0);
  const band = rosenbergBand(score);
  const content = BAND_CONTENT[band];

  return {
    score,
    percentage: Math.round((score / 30) * 100),
    band,
    ...content,
    strengths: items
      .filter((item) => item.score >= 2)
      .sort((a, b) => b.score - a.score || a.id - b.id)
      .slice(0, 2),
    reflections: items
      .filter((item) => item.score <= 1)
      .sort((a, b) => a.score - b.score || a.id - b.id)
      .slice(0, 2),
  };
}
