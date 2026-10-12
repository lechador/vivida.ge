import type { UserLocale } from "./i18n/user-locale";

/**
 * PRO-only daily reflection question. A static fortnightly rotation,
 * original copy, no AI, no DB, no cost. Deterministic per calendar date so
 * every PRO user reflects on the same question each day (shared ritual
 * feel), and answers stay in the browser like the static-test pattern.
 */

const QUESTIONS_KA: readonly string[] = [
  "დღეს რა ერთი რამ შეგიძლია გაუშვა, რაც უკვე აღარ გჭირდება?",
  "რა გაღიმებს დღეს, თუნდაც სულ ცოტათი?",
  "ვის მიმართ მადლიერებას გრძნობ დღეს და რატომ?",
  "რა ერთი პატარა ნაბიჯი მიგიყვანს დღეს შენს მიზანთან უფრო ახლოს?",
  "როდის იგრძენი ბოლოს, რომ ნამდვილად საკუთარი თავი იყავი?",
  "რის გეშინია დღეს, და რას გეტყოდა ეს შიში, ხმამაღლა რომ ეთქვა?",
  "რა გჭირდება დღეს მოსასმენად, სხვისგან თუ საკუთარი თავისგან?",
  "რომელი შენი თვისებით ამაყობ ყველაზე მეტად ამ კვირაში?",
  "დღეს ვის შეგიძლია ერთი კეთილი სიტყვით დღე გაუნათო?",
  "რა გააკეთე ბოლოს პირველად და რას გასწავლა?",
  "შენი სხეული რას გეუბნება დღეს, უსმენ მას?",
  "რაზე ოცნებობდი ბავშვობაში, რაც დღესაც გაღელვებს?",
  "რა ერთი რამ გაამარტივებდა შენს დღეს ახლავე?",
  "საღამოს დღეს რომ შეაჯამებ, რა გინდა რომ გახსოვდეს?",
];

const QUESTIONS_EN: readonly string[] = [
  "What's one thing you can let go of today that you no longer need?",
  "What's making you smile today, even just a little?",
  "Who are you grateful for today, and why?",
  "What's one small step that would move you closer to your goal today?",
  "When did you last feel fully yourself?",
  "What are you afraid of today, and what would that fear say out loud?",
  "What do you need to hear today, from someone else or yourself?",
  "Which of your qualities are you proudest of this week?",
  "Whose day could you brighten with one kind word today?",
  "When did you last do something for the first time, and what did it teach you?",
  "What is your body telling you today, are you listening?",
  "What did you dream of as a child that still excites you?",
  "What one thing would simplify your day right now?",
  "When you look back on today tonight, what do you want to remember?",
];

export const PRO_RITUAL_QUESTION_COUNT = QUESTIONS_KA.length;

/** Day-of-year rotation over the local calendar date (`YYYY-MM-DD`). */
export function proRitualQuestion(
  dateIso: string,
  locale: UserLocale = "ka",
): string {
  const questions = locale === "ka" ? QUESTIONS_KA : QUESTIONS_EN;
  const day = new Date(`${dateIso}T00:00:00Z`).getTime();
  const index = Number.isNaN(day)
    ? 0
    : Math.abs(Math.floor(day / 86_400_000) % questions.length);
  return questions[index];
}

const PREFIX = "vivida_pro_ritual_v1";

function key(userId: string, date: string): string {
  return `${PREFIX}:${encodeURIComponent(userId)}:${date}`;
}

export function readProRitualAnswer(userId: string, date: string): string {
  if (typeof window === "undefined") return "";
  try {
    const value = localStorage.getItem(key(userId, date));
    return typeof value === "string" ? value.slice(0, 2000) : "";
  } catch {
    return "";
  }
}

export function saveProRitualAnswer(
  userId: string,
  date: string,
  answer: string,
): void {
  if (typeof window === "undefined") return;
  try {
    if (!answer.trim()) localStorage.removeItem(key(userId, date));
    else localStorage.setItem(key(userId, date), answer.slice(0, 2000));
  } catch {
    // Private browsing/storage quotas must never block the ritual.
  }
}
