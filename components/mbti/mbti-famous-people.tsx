import Image from "next/image";

import { mbtiBaseType } from "@/lib/mbti-questions";
import { mbtiCharacterSrc, mbtiFamousFor } from "@/lib/mbti-characters";
import type { UserLocale } from "@/lib/i18n/user-locale";

/**
 * "Famous people commonly typed as X" — names shown with the type's own
 * character avatar (we don't render real faces). Framed as popular, unofficial
 * associations rather than fact.
 */
export function MbtiFamousPeople({ type, locale = "ka" }: { type: string; locale?: UserLocale }) {
  const en = locale === "en";
  const people = mbtiFamousFor(type);
  if (people.length === 0) return null;

  return (
    <div className="mt-4 rounded-2xl border border-border bg-card/50 p-6 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-7">
      <h3 className="text-lg font-semibold tracking-tight">
        {en ? `Famous people often associated with ${mbtiBaseType(type)}` : `ცნობილი ${mbtiBaseType(type)}-ები`}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {en ? "Unofficial public-figure typings for comparison and entertainment." : "პიროვნებები, რომლებსაც ხშირად ამ ტიპს მიაწერენ."}
      </p>
      <ul className="mt-5 grid gap-3 sm:grid-cols-2">
        {people.map((name) => (
          <li
            key={name}
            className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/30 p-2.5"
          >
            <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-full bg-[var(--vivida-violet)]/15 ring-1 ring-[var(--vivida-violet)]/30">
              <Image
                src={mbtiCharacterSrc(type)}
                alt=""
                width={44}
                height={44}
                className="size-11 object-cover"
              />
            </span>
            <span className="text-[15px] font-medium text-foreground/90">{name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
