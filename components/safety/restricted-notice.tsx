import { Info } from "lucide-react";

/**
 * Gentle notice shown on the dashboard to a restricted (under-18) account.
 * Tone is deliberately soft — these are kids, not bad actors. Explains what's
 * limited, what still works, and that access opens automatically at 18.
 */
export function RestrictedNotice() {
  return (
    <div className="mb-6 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <Info className="mt-0.5 size-5 shrink-0 text-amber-300" />
        <div className="space-y-1">
          <p className="text-sm font-semibold text-amber-100">
            შენი ანგარიში დროებით შეზღუდულია
          </p>
          <p className="text-pretty text-sm leading-relaxed text-amber-100/85">
            Vivida-ს სოციალური ფუნქციები — ჩატი, მეგობრები და ფიდში პოსტები —
            ხელმისაწვდომია 18 წლიდან. შენი ნატალური რუკა და ყოველდღიური
            ჰოროსკოპი სრულად ღიაა. წვდომა ავტომატურად გაიხსნება, როცა 18 წელი
            შეგისრულდება. ✨
          </p>
        </div>
      </div>
    </div>
  );
}
