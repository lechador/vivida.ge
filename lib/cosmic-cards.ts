/**
 * Daily "ცის ბანქო" — the playful one-tap card on the dashboard.
 * One per user per day, deterministic so the same card stays visible all
 * day and a fresh one appears at midnight. Pure data — the UI does the
 * flip animation + streak display in components/dashboard/cosmic-card.tsx.
 */

export type CosmicCard = {
  id: number;
  emoji: string;
  /** Single Georgian sentence — short enough to read at a glance, vivid
   *  enough to be its own little ritual. */
  text: string;
  /** Tone tag — drives the card's accent color in the UI. */
  tone: "love" | "growth" | "rest" | "action" | "mystery" | "gratitude";
};

const CARDS: CosmicCard[] = [
  // ── love (warm pink) ──────────────────────────────────────────────
  { id: 1, emoji: "💞", tone: "love",
    text: "ერთი წერილი, რომელიც ცოცხალი არ წაგიგზავნია — დღეს კარგი დრო გაქვს." },
  { id: 2, emoji: "🌹", tone: "love",
    text: "ვინც დღეს გელოდება, ცას უსმენდა და შენზე ფიქრობდა." },
  { id: 3, emoji: "💌", tone: "love",
    text: "მცირე ფლირტი, მცირე ღიმილი, მცირე გაბედვა — ცას სამივე უყვარს დღეს." },
  { id: 4, emoji: "🪞", tone: "love",
    text: "გული შენ გხედავს უკეთ, ვიდრე სარკე. დღეს მიხედე." },

  // ── growth (cyan) ────────────────────────────────────────────────
  { id: 5, emoji: "🌱", tone: "growth",
    text: "მცირე გადაწყვეტილება დიდი ცვლილების ფესვია — ნუ უკარგავ მნიშვნელობას." },
  { id: 6, emoji: "🪴", tone: "growth",
    text: "ერთი ნაბიჯი გადადგი იქით, სადაც გული გეუბნება — ცა გხვდება." },
  { id: 7, emoji: "🧭", tone: "growth",
    text: "გადაწყვეტა, რომელიც გვერდზე გქონდა, დღეს უცებ აშკარა იქცევა." },
  { id: 8, emoji: "🌊", tone: "growth",
    text: "შეფერხება დღეს არ არის წინააღმდეგობა — ცის მცირე შეჩერებაა, უკეთესი მომართო." },

  // ── rest (lavender) ──────────────────────────────────────────────
  { id: 9, emoji: "🌙", tone: "rest",
    text: "თუ გრძნობ, რომ უცაოდ მოგწყინდა — ეს არ არის სიზარმაცე, ეს მთვარის ფაზა." },
  { id: 10, emoji: "🛌", tone: "rest",
    text: "ენერგია დღეს ნელია — მცირე საქმე გააკეთე და მერე დაისვენე." },
  { id: 11, emoji: "🕯️", tone: "rest",
    text: "სიჩუმე დღეს არ არის სიცარიელე — შენიშვნაა." },
  { id: 12, emoji: "☁️", tone: "rest",
    text: "შენი მთვარე ლაქად ფიქრობს — შენი დილის გადაწყვეტა ყველაზე სუფთა იქნება." },

  // ── action (orange) ──────────────────────────────────────────────
  { id: 13, emoji: "⚡", tone: "action",
    text: "მცირე საქმე ნუ გადადებ — დღეს ეს მცირე საქმე ბევრს ნიშნავს." },
  { id: 14, emoji: "🎯", tone: "action",
    text: "შეცდომის შიში დღეს უფრო ძვირი გიჯდება, ვიდრე თვითონ შეცდომა." },
  { id: 15, emoji: "🚀", tone: "action",
    text: "ერთი მცირე ნაბიჯი წინ — დიდი ცვლილების მთიანი წყაროა." },
  { id: 16, emoji: "🔥", tone: "action",
    text: "მზე და მთვარე დღეს ერთად მუშაობენ — შენიც ერთად იმუშავე." },

  // ── mystery (violet) ─────────────────────────────────────────────
  { id: 17, emoji: "🔮", tone: "mystery",
    text: "ცა დღეს ერთ მცირე საიდუმლოს აჩვენებს — ვინც გესმის, ის გრძნობს." },
  { id: 18, emoji: "👁️", tone: "mystery",
    text: "ახალი იდეა შენთან მოვა იქიდან, საიდანაც არ ელოდი. ღია იყავი." },
  { id: 19, emoji: "✨", tone: "mystery",
    text: "ცა დღეს ერთ ფანჯარას გხსნის — შენ მხოლოდ შემოხვალ." },
  { id: 20, emoji: "🌌", tone: "mystery",
    text: "ვინც დღეს გაიცნო, ალბათ ცის რუკაში უკვე გელოდა." },

  // ── gratitude (gold) ─────────────────────────────────────────────
  { id: 21, emoji: "🌟", tone: "gratitude",
    text: "მცდელობა სავსე, შედეგი ცარიელი? ცა მცდელობის ფასს გაჩვენებს მოგვიანებით." },
  { id: 22, emoji: "🤍", tone: "gratitude",
    text: "მცირე ჟესტი დიდ ცვლილებას იწვევს. გაუგზავნე ვიღაცას ის სიტყვა, რომელიც ნახევარდრო წერი." },
  { id: 23, emoji: "🎁", tone: "gratitude",
    text: "ერთი წერილი დღეს — ცას გადასცემს ის, რასაც სხვათათვის ვერ ეუბნები." },
  { id: 24, emoji: "🌻", tone: "gratitude",
    text: "დღეს ვინც გაიღიმებს, შენ ხარ. გადაიტანე ეს ღიმილი ერთ ადამიანამდე." },
];

/** FNV-1a 32-bit string hash — small, deterministic, no deps. */
function hash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return h;
}

/** Pick today's card for this user. Same answer all day; new card at
 *  midnight in the user's local timezone. */
export function pickCardFor(userId: string, dateLocal: string): CosmicCard {
  const idx = hash(`${userId}|${dateLocal}`) % CARDS.length;
  return CARDS[idx];
}

export const COSMIC_CARD_TONE_COLOR: Record<CosmicCard["tone"], string> = {
  love: "oklch(0.72 0.22 350)",
  growth: "oklch(0.78 0.18 200)",
  rest: "oklch(0.75 0.14 285)",
  action: "oklch(0.78 0.20 50)",
  mystery: "oklch(0.65 0.24 305)",
  gratitude: "oklch(0.82 0.16 80)",
};
