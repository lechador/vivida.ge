import type { AstrologyCalendarDay, CalendarTone } from "@/lib/seo/astrology-calendar";

const PLANET_EN: Record<string, string> = {
  მზე: "Sun", მთვარე: "Moon", მერკური: "Mercury", ვენერა: "Venus", მარსი: "Mars",
  იუპიტერი: "Jupiter", სატურნი: "Saturn", ურანი: "Uranus", ნეპტუნი: "Neptune", პლუტონი: "Pluto",
};

const ASPECT_EN: Record<string, string> = {
  შეერთება: "conjunction", სექსტილი: "sextile", კვადრატი: "square", ტრიგონი: "trine", ოპოზიცია: "opposition",
};

export const TONE_EN: Record<CalendarTone, { label: string; color: string; icon: string }> = {
  lucky: { label: "Supportive", color: "var(--vivida-cyan)", icon: "✦" },
  balanced: { label: "Balanced", color: "var(--vivida-violet)", icon: "◐" },
  careful: { label: "Use extra care", color: "var(--vivida-pink)", icon: "△" },
};

export function calendarDateLabelEn(date: Date, short = false) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    ...(short ? {} : { year: "numeric" as const }),
    timeZone: "UTC",
  }).format(date);
}

/**
 * Keep the search snippet and the visible English calendar page aligned.
 * Search Console shows that date-led queries use both "astrology" and
 * "ephemeris / planetary positions", so each day should answer that intent
 * explicitly instead of presenting itself as only a generic forecast.
 */
export function calendarDaySeoEn(date: Date) {
  const label = calendarDateLabelEn(date);
  return {
    label,
    title: `${label} Astrology: Planetary Positions & Aspects`,
    description: `${label} astrology and ephemeris: see planetary positions by zodiac sign, major aspects, the daily energy index, and practical guidance.`,
  };
}

export function weekdayEn(date: Date) {
  return new Intl.DateTimeFormat("en-US", { weekday: "long", timeZone: "UTC" }).format(date);
}

export function planetEn(labelKa: string) { return PLANET_EN[labelKa] ?? labelKa; }
export function aspectEn(kindKa: string) { return ASPECT_EN[kindKa] ?? kindKa; }

export function dayLeadEn(day: AstrologyCalendarDay) {
  const strongest = day.sky.aspects[0];
  return strongest
    ? `${planetEn(strongest.aKa)}–${planetEn(strongest.bKa)} ${aspectEn(strongest.kindKa)} sets the day's strongest astrological tone.`
    : "With no tight major aspects, the day's overall rhythm is relatively calm and flexible.";
}

export function dayAdviceEn(day: AstrologyCalendarDay) {
  if (day.tone === "lucky") return {
    title: "Supportive day",
    summary: "Harmonious aspects outweigh tense ones. The collective sky supports initiative, useful conversations, and steady progress, though outcomes still depend on your choices and preparation.",
    do: ["Take one concrete step toward an important goal", "Use opportunities for cooperation and honest conversation", "Record ideas and proposals that emerge naturally"],
    avoid: ["Do not rely on luck alone", "Avoid making financial or personal promises without thinking them through"],
  };
  if (day.tone === "careful") return {
    title: "Day for extra care",
    summary: "Tense aspects call for closer attention. Double-check decisions, give emotional reactions time to settle, and avoid escalating conflict unnecessarily.",
    do: ["Verify facts and deadlines before deciding", "Leave extra time for travel and important tasks", "Respond after strong emotions have settled"],
    avoid: ["Avoid impulsive confrontation", "Do not treat an astrological rating as an inevitable prediction"],
  };
  return {
    title: "Balanced day",
    summary: "Harmonious and tense influences are fairly even. A moderate pace, clear priorities, and attention to changing circumstances will serve you best.",
    do: ["Finish work already in progress", "Keep your plan flexible", "Separate essential tasks from distractions"],
    avoid: ["Do not rush only because of external pressure", "Avoid scattering energy across too many directions"],
  };
}
