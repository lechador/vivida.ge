import type { UserLocale } from "@/lib/i18n/locale";

export async function performFollowup(
  _userId: string,
  _libraryId: string,
  question: string,
  locale: UserLocale = "ka",
): Promise<
  | {
      ok: true;
      followup: {
        question: string;
        answer: string;
        degraded: boolean;
        charged: number;
        free: boolean;
        balance: number;
      };
    }
  | {
      ok: false;
      error: "insufficient" | "not_found" | "bad_request";
      cost?: number;
      balance?: number;
    }
> {
  const en = locale === "en";
  return {
    ok: true,
    followup: {
      question,
      answer: en
        ? "Looking back at the cards drawn, patience and clear boundaries will serve you best as this unfolds."
        : "გაშლილი კარტების ჭრილში, სიმშვიდე და მკაფიო პრიორიტეტები საუკეთესო შედეგს მოგიტანს.",
      degraded: false,
      charged: 0,
      free: true,
      balance: 20,
    },
  };
}
