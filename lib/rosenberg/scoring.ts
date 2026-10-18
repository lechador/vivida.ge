import { ROSENBERG_QUESTIONS } from "@/lib/rosenberg/questions";

export type RosenbergBand = "lower" | "moderate" | "higher";

export type RosenbergResult = {
  score: number;
  percentage: number;
  band: RosenbergBand;
  labelKa: string;
  summaryKa: string;
  strengths: Array<{ themeKa: string; strengthKa: string }>;
  reflections: Array<{ themeKa: string; reflectionKa: string }>;
  nextStepsKa: string[];
};

export function calculateRosenberg(
  answers: Record<number, number>,
): RosenbergResult {
  let score = 0;
  const strengths: Array<{ themeKa: string; strengthKa: string }> = [];
  const reflections: Array<{ themeKa: string; reflectionKa: string }> = [];

  for (const q of ROSENBERG_QUESTIONS) {
    const raw = answers[q.id] ?? 2;
    const itemScore = q.reversed ? 3 - raw : raw;
    score += itemScore;
    if (itemScore >= 2) {
      strengths.push({ themeKa: q.themeKa, strengthKa: q.strengthKa });
    } else {
      reflections.push({ themeKa: q.themeKa, reflectionKa: q.reflectionKa });
    }
  }

  const percentage = Math.round((score / 30) * 100);
  const band: RosenbergBand =
    score < 15 ? "lower" : score <= 25 ? "moderate" : "higher";

  const labelKa =
    band === "higher"
      ? "მყარი და მაღალი თვითშეფასება"
      : band === "moderate"
        ? "დაბალანსებული თვითშეფასება"
        : "მომატებული თვითკრიტიკა";

  const summaryKa =
    band === "higher"
      ? "შენი პასუხები მიუთითებს ძლიერ შინაგან საყრდენსა და საკუთარი თავის მიმართ კეთილგანწყობილ დამოკიდებულებაზე."
      : band === "moderate"
        ? "შენი თვითშეფასება საერთო ჯამში მდგრადია, თუმცა ზოგიერთ სიტუაციაში შინაგანი კრიტიკოსი უფრო აქტიურდება."
        : "ამ ეტაპზე საკუთარი თავის მიმართ საკმაოდ მკაცრი ხარ. მეტი თვითთანაგრძნობა და მცირე ნაბიჯების დაფასება დაგეხმარება საყრდენის გაძლიერებაში.";

  return {
    score,
    percentage,
    band,
    labelKa,
    summaryKa,
    strengths: strengths.slice(0, 4),
    reflections: reflections.slice(0, 4),
    nextStepsKa: [
      "დააკვირდი, როგორ ესაუბრები საკუთარ თავს შეცდომის დროს და შეცვალე მკაცრი ტონი მხარდამჭერი სიტყვებით.",
      "დღის ბოლოს ჩამოწერე ერთი რამ, რაც დღეს კარგად გამოგივიდა.",
    ],
  };
}
