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
  themePl: string;
  strengthKa: string;
  strengthEn: string;
  strengthPl: string;
  reflectionKa: string;
  reflectionEn: string;
  reflectionPl: string;
};

export type RosenbergResult = {
  score: number;
  percentage: number;
  band: RosenbergBand;
  labelKa: string;
  labelEn: string;
  labelPl: string;
  summaryKa: string;
  summaryEn: string;
  summaryPl: string;
  nextStepsKa: string[];
  nextStepsEn: string[];
  nextStepsPl: string[];
  strengths: RosenbergItemResult[];
  reflections: RosenbergItemResult[];
};

const BAND_CONTENT: Record<
  RosenbergBand,
  {
    labelKa: string;
    labelEn: string;
    labelPl: string;
    summaryKa: string;
    summaryEn: string;
    summaryPl: string;
    nextStepsKa: string[];
    nextStepsEn: string[];
    nextStepsPl: string[];
  }
> = {
  lower: {
    labelKa: "თვითშეფასება ახლა მოწყვლადია",
    labelEn: "Your self-esteem feels vulnerable right now",
    labelPl: "Twoja samoocena jest w tym momencie wrażliwa",
    summaryKa:
      "შენი პასუხები მიანიშნებს, რომ ამ პერიოდში საკუთარ თავს ხშირად მკაცრად აფასებ და საკუთარი ღირებულების განცდა შეიძლება მყიფე იყოს. ეს ქულა შენს რეალურ ღირებულებას არ განსაზღვრავს, ის მხოლოდ იმას აღწერს, როგორ უყურებ საკუთარ თავს ახლა.",
    summaryEn:
      "Your answers suggest that lately you often judge yourself harshly, and your sense of your own worth may feel fragile. This score does not define your real worth. It only describes how you see yourself right now.",
    summaryPl:
      "Twoje odpowiedzi wskazują, że ostatnio często surowo siebie oceniasz, a poczucie własnej wartości może wydawać się kruche. Ten wynik nie określa Twojej prawdziwej wartości — opisuje jedynie, jak postrzegasz siebie w obecnym momencie.",
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
    nextStepsPl: [
      "Zauważ, kiedy ocena jednego błędu przekształca się w ocenę całej Twojej osoby.",
      "Każdego dnia zanotuj jedną konkretną cechę, wysiłek lub działanie w sobie, które szczerze doceniasz.",
      "Jeśli samokrytyka często Ci dokucza lub utrudnia codzienne życie, pomocna może być rozmowa z zaufaną osobą lub specjalistą zdrowia psychicznego.",
    ],
  },
  middle: {
    labelKa: "თვითშეფასება მეტწილად დაბალანსებულია",
    labelEn: "Your self-esteem is mostly balanced",
    labelPl: "Twoja samoocena jest w przeważającej mierze zrównoważona",
    summaryKa:
      "საკუთარი თავისადმი დამოკიდებულებაში ჩანს როგორც მიღება, ისე ეჭვის მომენტები. სავარაუდოდ, ზოგ ვითარებაში საკუთარ ძალებს ენდობი, ხოლო წნეხის, შედარების ან წარუმატებლობის დროს თვითკრიტიკა ძლიერდება.",
    summaryEn:
      "Your attitude toward yourself shows both acceptance and moments of doubt. You probably trust your abilities in some situations, while self-criticism grows stronger under pressure, comparison or failure.",
    summaryPl:
      "Twój stosunek do samego siebie łączy akceptację z chwilami wątpliwości. Prawdopodobnie w wielu sytuacjach ufasz swoim siłom, lecz pod wpływem presji, porównań lub niepowodzeń wewnętrzny krytyk staje się głośniejszy.",
    nextStepsKa: [
      "დააკვირდი, რომელ გარემოებებში ხდება შენი შინაგანი ხმა განსაკუთრებით მკაცრი.",
      "შეაფასე საკუთარი თავი არა მხოლოდ შედეგით, არამედ ძალისხმევით, არჩევანითა და წინსვლითაც.",
    ],
    nextStepsEn: [
      "Notice in which situations your inner voice becomes especially harsh.",
      "Judge yourself not only by results, but also by effort, choices and progress.",
    ],
    nextStepsPl: [
      "Obserwuj, w jakich okolicznościach Twój wewnętrzny głos staje się szczególnie surowy.",
      "Oceń siebie nie tylko na podstawie końcowych rezultatów, ale także włożonego wysiłku, wyborów i postępów.",
    ],
  },
  higher: {
    labelKa: "თვითშეფასება მყარია",
    labelEn: "Your self-esteem is steady",
    labelPl: "Twoja samoocena jest stabilna i ugruntowana",
    summaryKa:
      "შენი პასუხები აჩვენებს საკუთარი ღირებულებისა და შესაძლებლობების საკმაოდ მყარ განცდას. მაღალი თვითშეფასება აქ ნიშნავს საკუთარი თავის პატივისცემასა და მიღებას, და არა სხვებზე აღმატებულობის განცდას.",
    summaryEn:
      "Your answers show a fairly steady sense of your own worth and abilities. High self-esteem here means self-respect and self-acceptance, not a sense of superiority over others.",
    summaryPl:
      "Twoje odpowiedzi pokazują stabilne poczucie własnej wartości i wiary we własne możliwości. Wysoka samoocena oznacza tutaj szacunek i akceptację samego siebie, a nie poczucie wyższości nad innymi.",
    nextStepsKa: [
      "შეინარჩუნე საკუთარი თავისადმი მხარდამჭერი დამოკიდებულება მაშინაც, როცა შეცდომას უშვებ.",
      "მყარი თვითშეფასება ყველაზე სასარგებლოა, როცა მას რეალისტური თვითრეფლექსია და სხვისი ღირებულების პატივისცემაც ახლავს.",
    ],
    nextStepsEn: [
      "Keep a supportive attitude toward yourself even when you make a mistake.",
      "Steady self-esteem is most helpful when it comes with realistic self-reflection and respect for other people's worth.",
    ],
    nextStepsPl: [
      "Utrzymuj wspierający stosunek do siebie również wtedy, gdy popełnisz błąd.",
      "Stabilna samoocena jest najbardziej owocna, gdy towarzyszy jej realistyczna autorefleksja i szacunek dla godności innych ludzi.",
    ],
  },
};

export function scoreRosenbergItem(
  question: Pick<RosenbergQuestion, "reverse">,
  answer: number,
): number {
  if (!Number.isInteger(answer) || answer < 1 || answer > 4) {
    throw new RangeError(`Rosenberg answer must be 1..4, received: ${answer}`);
  }
  return question.reverse ? 4 - answer : answer - 1;
}

export function rosenbergBand(score: number): RosenbergBand {
  if (score < 15) return "lower";
  if (score <= 25) return "middle";
  return "higher";
}

export function calculateRosenberg(
  answers: Record<number, number>,
): RosenbergResult {
  const itemResults: RosenbergItemResult[] = ROSENBERG_QUESTIONS.map((q) => {
    const raw = answers[q.id];
    if (raw === undefined) {
      throw new RangeError(`Missing Rosenberg answer for question ${q.id}`);
    }
    const score = scoreRosenbergItem(q, raw);
    return {
      id: q.id,
      score,
      themeKa: q.themeKa,
      themeEn: q.themeEn,
      themePl: q.themePl,
      strengthKa: q.strengthKa,
      strengthEn: q.strengthEn,
      strengthPl: q.strengthPl,
      reflectionKa: q.reflectionKa,
      reflectionEn: q.reflectionEn,
      reflectionPl: q.reflectionPl,
    };
  });

  const totalScore = itemResults.reduce((sum, item) => sum + item.score, 0);
  const percentage = Math.round((totalScore / 30) * 100);
  const band = rosenbergBand(totalScore);
  const bandMeta = BAND_CONTENT[band];

  const strengths = itemResults.filter((item) => item.score === 3).slice(0, 3);
  const reflections = itemResults.filter((item) => item.score <= 1).slice(0, 3);

  return {
    score: totalScore,
    percentage,
    band,
    labelKa: bandMeta.labelKa,
    labelEn: bandMeta.labelEn,
    labelPl: bandMeta.labelPl,
    summaryKa: bandMeta.summaryKa,
    summaryEn: bandMeta.summaryEn,
    summaryPl: bandMeta.summaryPl,
    nextStepsKa: bandMeta.nextStepsKa,
    nextStepsEn: bandMeta.nextStepsEn,
    nextStepsPl: bandMeta.nextStepsPl,
    strengths,
    reflections,
  };
}
