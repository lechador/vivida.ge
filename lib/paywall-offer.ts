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
  impulsePackForCountry,
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
    tarot_love_5: CREDIT_COST.tarotLove5,
    tarot_yes_no: CREDIT_COST.tarotYesNo,
    dream: CREDIT_COST.dream,
    chat: CREDIT_COST.chat,
    ai_chart_chat: CREDIT_COST.chat,
  };
  const cost = costByProduct[product];
  if (!cost) return null;
  const uses = Math.floor(pack.credits / cost);
  return uses > 1 ? uses : null;
}

const OUTCOME: Record<string, { ka: string; en: string; pl: string }> = {
  tarot: {
    ka: "დამატებითი ტარო კითხვა",
    en: "more tarot readings",
    pl: "dodatkowe rozkłady tarota",
  },
  tarot_followup: {
    ka: "პასუხის დაზუსტება",
    en: "follow-up answers",
    pl: "doprecyzowanie odpowiedzi",
  },
  tarot_love_5: {
    ka: "სიყვარულის ტარო განლაგება",
    en: "love tarot spread",
    pl: "rozkład miłosny tarota",
  },
  tarot_yes_no: {
    ka: "დიახ/არა ტარო განლაგება",
    en: "yes/no tarot readings",
    pl: "rozkłady tarota Tak/Nie",
  },
  natal_pdf: {
    ka: "სრული PDF ანგარიში",
    en: "the full PDF report",
    pl: "pełny raport PDF",
  },
  synastry: {
    ka: "თავსებადობის სრული გახსნა",
    en: "the full compatibility reading",
    pl: "pełna analiza zgodności",
  },
  dream: {
    ka: "სიზმრის AI ახსნა",
    en: "AI dream interpretations",
    pl: "interpretacje snów AI",
  },
  chat: {
    ka: "AI ჩატის გაგრძელება",
    en: "more AI chat messages",
    pl: "kolejne wiadomości na czacie AI",
  },
  ai_chart_chat: {
    ka: "AI ჩატის გაგრძელება",
    en: "more AI chat messages",
    pl: "kolejne wiadomości na czacie AI",
  },
  weekly: {
    ka: "7-დღიანი პროგნოზი",
    en: "the 7-day forecast",
    pl: "prognoza 7-dniowa",
  },
  weekly_forecast: {
    ka: "7-დღიანი პროგნოზი",
    en: "the 7-day forecast",
    pl: "prognoza 7-dniowa",
  },
  iq: {
    ka: "ტესტის სრული შედეგი",
    en: "the full test result",
    pl: "pełny wynik testu",
  },
  eq: {
    ka: "ტესტის სრული შედეგი",
    en: "the full test result",
    pl: "pełny wynik testu",
  },
  "big-five": {
    ka: "ტესტის სრული შედეგი",
    en: "the full test result",
    pl: "pełny wynik testu",
  },
  mbti: {
    ka: "ტესტის სრული შედეგი",
    en: "the full test result",
    pl: "pełny wynik testu",
  },
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
  const effectiveCountry = countryCode || (locale === "pl" ? "PL" : undefined);
  const pack = creditPacksForCountry(effectiveCountry)[0];
  const price = formatBillingAmount(pack.amountMinor, pack.currency, locale);
  const uses = starterPackUses(product, pack);
  const outcomeText =
    OUTCOME[product]?.[locale] ??
    (locale === "pl"
      ? "ten wynik"
      : locale === "en"
        ? "this result"
        : "ეს შედეგი");

  let label: string;
  if (uses) {
    if (locale === "pl") {
      label = `${uses}x ${outcomeText}, ${price}`;
    } else if (locale === "en") {
      label = `${uses} ${outcomeText}, ${price}`;
    } else {
      label = `${uses} ${outcomeText}, ${price}`;
    }
  } else {
    if (locale === "pl") {
      label = `Odblokuj: ${outcomeText}, ${price}`;
    } else if (locale === "en") {
      label = `Unlock ${outcomeText}, ${price}`;
    } else {
      label = `გახსენი ${outcomeText}, ${price}`;
    }
  }

  const detail =
    locale === "pl"
      ? `${pack.credits} kredytów · płatność jednorazowa · bez autoodnawiania`
      : locale === "en"
        ? `${pack.credits} credits · one-time payment · no auto-renewal`
        : `${pack.credits} კრედიტი · ერთჯერადი გადახდა · ავტოგანახლების გარეშე`;

  return { pack, label, detail };
}

/**
 * Low-friction impulse offer (12 credits — ₾3.90 / £1.99 / $1.99) shown when
 * the user's credit shortfall is small enough (≤ 12 credits) to be covered by
 * the micro pack. Returns null when the shortfall exceeds the impulse pack.
 */
export function paywallImpulseOffer({
  product,
  countryCode,
  locale,
  missing,
}: {
  product: string;
  countryCode?: string | null;
  locale: UserLocale;
  missing: number;
}): PaywallPrimaryOffer | null {
  const effectiveCountry = countryCode || (locale === "pl" ? "PL" : undefined);
  const pack = impulsePackForCountry(effectiveCountry);
  if (missing > pack.credits) return null;
  const price = formatBillingAmount(pack.amountMinor, pack.currency, locale);
  const outcomeText =
    OUTCOME[product]?.[locale] ??
    (locale === "pl"
      ? "ten wynik"
      : locale === "en"
        ? "this result"
        : "ეს შედეგი");

  const label =
    locale === "pl"
      ? `Szybkie odblokowanie (${pack.credits} kred.), ${price}`
      : locale === "en"
        ? `Quick unlock ${outcomeText} (${pack.credits} cr), ${price}`
        : `სწრაფი გახსნა (${pack.credits} კრ.), ${price}`;

  const detail =
    locale === "pl"
      ? `${pack.credits} kredytów · jednorazowo · natychmiastowy dostęp`
      : locale === "en"
        ? `${pack.credits} credits · one-time · instant unlock`
        : `${pack.credits} კრედიტი · ერთჯერადი გადახდა · მყისიერი გახსნა`;

  return { pack, label, detail };
}
