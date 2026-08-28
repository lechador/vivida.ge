import {
  ROSENBERG_QUESTIONS,
  type RosenbergQuestion,
} from "@/lib/rosenberg/questions";

export type RosenbergBand = "lower" | "middle" | "higher";

export type RosenbergItemResult = {
  id: number;
  score: number;
  themeKa: string;
  strengthKa: string;
  reflectionKa: string;
};

export type RosenbergResult = {
  score: number;
  percentage: number;
  band: RosenbergBand;
  labelKa: string;
  summaryKa: string;
  nextStepsKa: string[];
  strengths: RosenbergItemResult[];
  reflections: RosenbergItemResult[];
};

const BAND_CONTENT: Record<
  RosenbergBand,
  { labelKa: string; summaryKa: string; nextStepsKa: string[] }
> = {
  lower: {
    labelKa: "თვითშეფასება ახლა მოწყვლადია",
    summaryKa:
      "შენი პასუხები მიანიშნებს, რომ ამ პერიოდში საკუთარ თავს ხშირად მკაცრად აფასებ და საკუთარი ღირებულების განცდა შეიძლება მყიფე იყოს. ეს ქულა შენს რეალურ ღირებულებას არ განსაზღვრავს — ის მხოლოდ იმას აღწერს, როგორ უყურებ საკუთარ თავს ახლა.",
    nextStepsKa: [
      "შეამჩნიე, როდის გადადის ერთი შეცდომის შეფასება მთელი საკუთარი თავის შეფასებაში.",
      "ყოველდღე ჩაინიშნე ერთი კონკრეტული თვისება, ძალისხმევა ან მოქმედება, რომელსაც საკუთარ თავში აფასებ.",
      "თუ თვითდაკნინება ხშირად გაწუხებს ან ყოველდღიურ ცხოვრებას გირთულებს, სანდო ადამიანთან ან ფსიქიკური ჯანმრთელობის სპეციალისტთან საუბარი შეიძლება სასარგებლო იყოს.",
    ],
  },
  middle: {
    labelKa: "თვითშეფასება მეტწილად დაბალანსებულია",
    summaryKa:
      "საკუთარი თავისადმი დამოკიდებულებაში ჩანს როგორც მიღება, ისე ეჭვის მომენტები. სავარაუდოდ, ზოგ ვითარებაში საკუთარ ძალებს ენდობი, ხოლო წნეხის, შედარების ან წარუმატებლობის დროს თვითკრიტიკა ძლიერდება.",
    nextStepsKa: [
      "დააკვირდი, რომელ გარემოებებში ხდება შენი შინაგანი ხმა განსაკუთრებით მკაცრი.",
      "შეაფასე საკუთარი თავი არა მხოლოდ შედეგით, არამედ ძალისხმევით, არჩევანითა და წინსვლითაც.",
    ],
  },
  higher: {
    labelKa: "თვითშეფასება მყარია",
    summaryKa:
      "შენი პასუხები აჩვენებს საკუთარი ღირებულებისა და შესაძლებლობების საკმაოდ მყარ განცდას. მაღალი თვითშეფასება აქ ნიშნავს საკუთარი თავის პატივისცემასა და მიღებას — და არა სხვებზე აღმატებულობის განცდას.",
    nextStepsKa: [
      "შეინარჩუნე საკუთარი თავისადმი მხარდამჭერი დამოკიდებულება მაშინაც, როცა შეცდომას უშვებ.",
      "მყარი თვითშეფასება ყველაზე სასარგებლოა, როცა მას რეალისტური თვითრეფლექსია და სხვისი ღირებულების პატივისცემაც ახლავს.",
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
      strengthKa: question.strengthKa,
      reflectionKa: question.reflectionKa,
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
