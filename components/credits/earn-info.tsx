import { Camera, PenLine, Sparkles, UserPlus } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { CREDIT_REWARD, REFERRAL_REWARD } from "@/lib/credits-config";

type EarnRow = {
  Icon: LucideIcon;
  title: string;
  detail: string;
  amount: number;
};

/**
 * "How to earn credits" — the free side of the economy, shown above the paid
 * top-up options so users see they don't have to pay. Amounts read straight
 * from the economy config so copy never drifts from the real rewards.
 */
const ROWS_KA: EarnRow[] = [
  {
    Icon: UserPlus,
    title: "მოიწვიე მეგობარი",
    detail: "როცა მოწვეული დარეგისტრირდება და შეავსებს პროფილს",
    amount: REFERRAL_REWARD,
  },
  {
    Icon: PenLine,
    title: "დაწერე პოსტი ფიდში",
    detail: "დღეში პირველ პოსტზე",
    amount: CREDIT_REWARD.feedPost,
  },
  {
    Icon: Camera,
    title: "დაამატე პროფილის ფოტო",
    detail: "ერთხელ, ხარისხიანი ფოტოს ატვირთვისას",
    amount: CREDIT_REWARD.profilePhoto,
  },
];

const ROWS_EN: EarnRow[] = [
  {
    Icon: UserPlus,
    title: "Invite a friend",
    detail: "When they sign up and complete their profile",
    amount: REFERRAL_REWARD,
  },
  {
    Icon: PenLine,
    title: "Write a feed post",
    detail: "For your first post each day",
    amount: CREDIT_REWARD.feedPost,
  },
  {
    Icon: Camera,
    title: "Add a profile photo",
    detail: "Once, when you upload a quality photo",
    amount: CREDIT_REWARD.profilePhoto,
  },
];

import type { UserLocale } from "@/lib/i18n/user-locale";

export function CreditEarnInfo({ locale }: { locale: UserLocale }) {
  const en = locale !== "ka";
  const rows = en ? ROWS_EN : ROWS_KA;
  return (
    <div className="rounded-3xl border border-[var(--vivida-cyan)]/30 bg-card/55 p-5 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-6">
      <div className="mb-1 flex items-center gap-2">
        <Sparkles className="size-4 text-[var(--vivida-cyan)]" />
        <h2 className="text-base font-semibold tracking-tight">
          {en ? "How to earn free credits" : "როგორ დააგროვო კრედიტები უფასოდ"}
        </h2>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">
        {en
          ? "You don't have to buy credits—you can earn them by being active."
          : "კრედიტების ყიდვა სავალდებულო არ არის — შეგიძლია დააგროვო აქტიურობით."}
      </p>

      <ul className="space-y-2.5">
        {rows.map((r) => (
          <li
            key={r.title}
            className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background/40 p-3 sm:p-3.5"
          >
            <div className="grid size-9 shrink-0 place-items-center rounded-full bg-[var(--vivida-cyan)]/12 text-[var(--vivida-cyan)]">
              <r.Icon className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-foreground/95">
                {r.title}
              </div>
              <div className="truncate text-xs text-muted-foreground">
                {r.detail}
              </div>
            </div>
            <span className="shrink-0 rounded-full bg-[var(--vivida-cyan)]/15 px-2.5 py-1 text-sm font-semibold tabular-nums text-[var(--vivida-cyan)]">
              +{r.amount}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
