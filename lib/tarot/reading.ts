import { tarotDetailDeck } from "@/lib/tarot/detail";
import { tarotSpreadById, type TarotSpreadId } from "@/lib/tarot/spreads";
import { normalizeTarotFollowupSuggestions } from "@/lib/tarot/followup-suggestions";
import type { UserLocale } from "@/lib/i18n/locale";

export async function performReading(
  _userId: string,
  question: string,
  locale: UserLocale = "ka",
  _requestId?: string,
  spreadId: TarotSpreadId = "situation",
  spreadOptions?: { a: string; b: string },
): Promise<
  | {
      ok: true;
      reading: {
        headline: string;
        cards: Array<{
          slug: string;
          name: string;
          glyph: string;
          image: string;
          reversed: boolean;
          position: string;
          interpretation: string;
        }>;
        reading: string;
        advice: string;
        followupSuggestions: string[];
        charged: number;
        free: boolean;
        balance: number;
        libraryId: string;
        degraded: boolean;
        followups: [];
        spreadId: string;
        spreadOptions?: { a: string; b: string };
      };
    }
  | {
      ok: false;
      error: "insufficient" | "bad_request";
      cost?: number;
      balance?: number;
      preview?: {
        spreadId: string;
        cards: Array<{
          slug: string;
          name: string;
          glyph: string;
          image: string;
          reversed: boolean;
          position: string;
        }>;
      };
    }
> {
  if (!question || question.trim().length < 3) {
    return { ok: false, error: "bad_request" };
  }
  const en = locale === "en";
  const deck = tarotDetailDeck(en ? "en" : "ka");
  const spread = tarotSpreadById(spreadId) ?? tarotSpreadById("situation")!;
  const positions = en ? spread.positions.en : spread.positions.ka;

  const cards = deck.slice(0, 3).map((c, idx) => ({
    slug: c.slug,
    name: c.name,
    glyph: c.glyph,
    image: c.image,
    reversed: false,
    position: positions[idx] ?? positions[0],
    interpretation: c.upright,
  }));

  return {
    ok: true,
    reading: {
      headline: en
        ? "Clarity through steady intuition and deliberate action"
        : "სიცხადე შინაგანი ინტუიციისა და გააზრებული ნაბიჯების გზით",
      cards,
      reading: en
        ? "The spread highlights a transition from uncertainty into grounded action. Trust what you already know and take one clear step at a time."
        : "გაშლილი კარტები მიუთითებს გადასვლას ეჭვიდან მკაფიო მოქმედებაზე. ენდე საკუთარ გამოცდილებას და ნაბიჯ-ნაბიჯ იმოქმედე.",
      advice: en
        ? "Focus on what is directly within your control today."
        : "ფოკუსირდი იმაზე, რაც დღეს უშუალოდ შენს ხელშია.",
      followupSuggestions: normalizeTarotFollowupSuggestions(null, locale),
      charged: 0,
      free: true,
      balance: 20,
      libraryId: `tarot_${Date.now()}`,
      degraded: false,
      followups: [],
      spreadId: spread.id,
      spreadOptions,
    },
  };
}
