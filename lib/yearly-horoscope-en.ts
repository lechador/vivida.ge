import { signMetaBySlug, type ZodiacSlug } from "@/lib/seo/zodiac-dates";

export function yearlyHoroscopeEnglish(sign: ZodiacSlug, year: number) {
  const meta = signMetaBySlug(sign);
  const name = meta?.labelEn ?? sign;
  return {
    title: `${name} ${year} Horoscope: Yearly Astrology Forecast`,
    description: `${name} ${year} horoscope for love, career, finances, and personal growth.`,
    tagline: `${year} invites ${name} to align daily habits with long-term vision.`,
    overview: [
      `Throughout ${year}, major planetary transits highlight renewal, purposeful relationships, and steady career momentum for ${name}.`,
    ],
    supportiveMonths: ["March", "July", "November"],
    reflectiveMonths: ["May", "September"],
    sections: [
      {
        title: "Love & Relationships",
        body: `Relationships deepen through honest dialogue and shared goals in ${year}.`,
      },
      {
        title: "Career & Finances",
        body: `Professional projects gain traction when you focus on sustainable priorities.`,
      },
      {
        title: "Wellbeing & Energy",
        body: `Consistent rest and mindful pacing keep your energy strong all year.`,
      },
    ],
    love: [`Relationships deepen through honest dialogue and shared goals in ${year}.`],
    career: [`Professional projects gain traction when you focus on sustainable priorities.`],
    healthAndEnergy: [`Consistent rest and mindful pacing keep your energy strong all year.`],
    keyMonths: [
      { month: "Spring", note: "Fresh momentum for personal initiatives and creative plans." },
      { month: "Autumn", note: "Clarity in partnerships and long-term commitments." },
    ],
    keyDates: [
      { date: `Spring ${year}`, note: "Fresh momentum for personal initiatives and creative plans." },
      { date: `Autumn ${year}`, note: "Clarity in partnerships and long-term commitments." },
    ],
    advice: `Focus on steady, authentic progress in ${year} and let your long-term priorities guide daily choices.`,
    faq: [
      {
        q: `What is the main theme for ${name} in ${year}?`,
        a: `${year} focuses on intentional growth, authentic relationships, and grounded progress for ${name}.`,
      },
    ],
  };
}
