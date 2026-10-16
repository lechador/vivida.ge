/**
 * First-purchase offer copy for credit shortfalls, client-safe and pure.
 *
 * Every gated surface used to improvise its own top-up label, and only tarot
 * named the outcome and price; everything else said "top up and return", so a
 * Georgian user hitting a locked PDF, test, or forecast could not tell what
 * the money bought. The primary action now always names the locked outcome,
 * the starter pack that covers it, and its one-time GEL price, with PRO kept
 * secondary for frequent use. No DB or server-only imports: paywall components
 * render this in the browser.
 */
import {
  creditPacksForCountry,
  formatBillingAmount,
  type CreditPack,
} from "@/lib/billing-config";
import { CREDIT_COST } from "@/lib/credits-config";
import type { UserLocale } from "@/lib/i18n/user-locale";

/** How many times the starter pack alone pays for this product, when the
 *  product has a fixed per-use credit cost and repeats naturally. */
function starterPackUses(product: string, pack: CreditPack): number | null {
  const costByProduct: Record<string, number> = {
    tarot: CREDIT_COST.tarot,
    tarot_followup: CREDIT_COST.tarotFollowup,
    dream: CREDIT_COST.dream,
    chat: CREDIT_COST.chat,
    ai_chart_chat: CREDIT_COST.chat,
  };
  const cost = costByProduct[product];
  if (!cost) return null;
  const uses = Math.floor(pack.credits / cost);
  return uses > 1 ? uses : null;
}

const OUTCOME: Record<string, { ka: string; en: string }> = {
  tarot: { ka: "დამატებითი ტარო კითხვა", en: "more tarot readings" },
  tarot_followup: { ka: "პასუხის დაზუსტება", en: "follow-up answers" },
  natal_pdf: { ka: "სრული PDF ანგარიში", en: "the full PDF report" },
  synastry: {
    ka: "თავსებადობის სრული გახსნა",
    en: "the full compatibility reading",
  },
  dream: { ka: "სიზმრის AI ახსნა", en: "AI dream interpretations" },
  chat: { ka: "AI ჩატის გაგრძელება", en: "more AI chat messages" },
  ai_chart_chat: { ka: "AI ჩატის გაგრძელება", en: "more AI chat messages" },
  weekly: { ka: "7-დღიანი პროგნოზი", en: "the 7-day forecast" },
  weekly_forecast: { ka: "7-დღიანი პროგნოზი", en: "the 7-day forecast" },
  iq: { ka: "ტესტის სრული შედეგი", en: "the full test result" },
  eq: { ka: "ტესტის სრული შედეგი", en: "the full test result" },
  "big-five": { ka: "ტესტის სრული შედეგი", en: "the full test result" },
  mbti: { ka: "ტესტის სრული შედეგი", en: "the full test result" },
};

export type PaywallPrimaryOffer = {
  pack: CreditPack;
  /** Button label naming the outcome and the one-time pack price. */
  label: string;
  /** Reassurance line under the buttons: pack size, one-time, no renewal. */
  detail: string;
};

/**
 * The single primary one-time offer for a credit shortfall on `product`.
 * Falls back to a generic unlock label for products without fixed copy so a
 * new gate never renders a bare "top up" again.
 */
export function paywallPrimaryOffer({
  product,
  countryCode,
  locale,
}: {
  product: string;
  countryCode?: string | null;
  locale: UserLocale;
}): PaywallPrimaryOffer {
  const en = locale === "en";
  const pack = creditPacksForCountry(countryCode)[0];
  const price = formatBillingAmount(pack.amountMinor, pack.currency, locale);
  const uses = starterPackUses(product, pack);
  const outcome =
    OUTCOME[product] ??
    (en ? { ka: "", en: "this result" } : { ka: "ეს შედეგი", en: "" });

  const label = uses
    ? en
      ? `${uses} ${outcome.en}, ${price}`
      : `${uses} ${outcome.ka}, ${price}`
    : en
      ? `Unlock ${outcome.en}, ${price}`
      : `გახსენი ${outcome.ka}, ${price}`;

  const detail = en
    ? `${pack.credits} credits · one-time payment · no auto-renewal`
    : `${pack.credits} კრედიტი · ერთჯერადი გადახდა · ავტოგანახლების გარეშე`;

  return { pack, label, detail };
}
