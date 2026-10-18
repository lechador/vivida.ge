import type { AstrologyCalendarDay, CalendarTone } from "@/lib/seo/astrology-calendar";
import { signByIndex } from "@/lib/zodiac";

export const TONE_EN: Record<
  CalendarTone,
  { label: string; color: string; icon: string }
> = {
  lucky: { label: "Supportive", color: "var(--vivida-cyan)", icon: "✦" },
  balanced: { label: "Balanced", color: "var(--vivida-violet)", icon: "◐" },
  careful: { label: "Extra care", color: "var(--vivida-pink)", icon: "△" },
};

const PLANET_EN_MAP: Record<string, string> = {
  მზე: "Sun",
  მთვარე: "Moon",
  მერკური: "Mercury",
  ვენერა: "Venus",
  მარსი: "Mars",
  იუპიტერი: "Jupiter",
  სატურნი: "Saturn",
  ურანი: "Uranus",
  ნეპტუნი: "Neptune",
  პლუტონი: "Pluto",
};

const ASPECT_EN_MAP: Record<string, string> = {
  შეერთება: "Conjunction",
  სექსტილი: "Sextile",
  კვადრატი: "Square",
  ტრინი: "Trine",
  ოპოზიცია: "Opposition",
};

export function planetEn(kaLabel: string): string {
  return PLANET_EN_MAP[kaLabel] ?? kaLabel;
}

export function aspectEn(kaKind: string): string {
  return ASPECT_EN_MAP[kaKind] ?? kaKind;
}

export function weekdayEn(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    timeZone: "UTC",
  }).format(date);
}

export function calendarDateLabelEn(date: Date, short = false): string {
  return new Intl.DateTimeFormat("en-US", {
    month: short ? "short" : "long",
    day: "numeric",
    ...(short ? {} : { year: "numeric" }),
    timeZone: "UTC",
  }).format(date);
}

export function calendarDaySeoEn(date: Date): {
  label: string;
  title: string;
  description: string;
} {
  const label = calendarDateLabelEn(date, false);
  return {
    label,
    title: `${label} Astrology: Planetary Positions & Daily Aspects`,
    description: `Explore the planetary positions, Moon sign, major transiting aspects, and practical astrology guidance for ${label}.`,
  };
}

export function dayLeadEn(day: AstrologyCalendarDay): string {
  const moon = day.sky.planets.find((p) => p.key === "moon");
  const moonSign = moon ? signByIndex(moon.signIndex).labelEn : "the zodiac";
  if (day.tone === "lucky") {
    return `Harmonious planetary aspects set a cooperative tone today while the Moon moves through ${moonSign}.`;
  }
  if (day.tone === "careful") {
    return `Tighter tense aspects call for patience and careful review today as the Moon transits ${moonSign}.`;
  }
  return `A balanced collective sky with the Moon in ${moonSign}, well suited for steady progress and grounded planning.`;
}

export function dayAdviceEn(day: AstrologyCalendarDay): {
  title: string;
  summary: string;
  do: string[];
  avoid: string[];
} {
  if (day.tone === "lucky") {
    return {
      title: "Supportive day",
      summary:
        "Harmonious aspects create a constructive backdrop for conversations, planning, and steady initiative.",
      do: [
        "Schedule important conversations or creative work",
        "Take a practical first step on a new plan",
        "Collaborate and share ideas openly",
      ],
      avoid: [
        "Overcommitting your schedule",
        "Skipping basic due diligence",
      ],
    };
  }
  if (day.tone === "careful") {
    return {
      title: "Day for extra care",
      summary:
        "Tense aspects favor slower pacing, double-checking details, and pausing before reacting.",
      do: [
        "Review agreements and details carefully",
        "Leave buffer time between commitments",
        "Focus on completing existing tasks",
      ],
      avoid: [
        "Impulsive financial or relationship decisions",
        "Escalating minor disagreements",
      ],
    };
  }
  return {
    title: "Balanced day",
    summary:
      "A steady astrological backdrop where consistent effort and clear priorities work best.",
    do: [
      "Follow your core priorities step by step",
      "Balance focused work with rest",
    ],
    avoid: [
      "Procrastinating on key tasks",
      "Scattering attention across too many tabs",
    ],
  };
}
