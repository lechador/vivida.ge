"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send } from "lucide-react";

import { createPost, POST_BODY_MAX } from "@/actions/feed";
import { Button } from "@/components/ui/button";

/**
 * Rotating placeholder prompts. One is picked per mount so a fresh
 * /feed page-load shows a new opener — cheap blank-page-friction
 * killer that doesn't need any state machinery.
 */
const PROMPTS = [
  "რას ფიქრობ ცაში დღეს? გააზიარე...",
  "რა მთვარის ფაზაში ხარ შენ?",
  "გააზიარე დღევანდელი ცის რუკის ერთი ემოცია.",
  "მოგვიყევი, რა შეიცვალა ბოლო რეტროგრადის შემდეგ.",
  "შენი ნიშანი დღეს — როგორ მუშაობს?",
  "ერთი წინადადება დღევანდელ კოსმოსზე.",
  "რომელი პლანეტა გრძნობს ყველაზე მეტად?",
  "მზე, მთვარე, ამომავალი — შენი დიდი სამეული რას ამბობს?",
];

/**
 * Top-of-feed composer. Plain textarea + submit. No attachments, no
 * markdown — product spec is text only. Submits via the createPost
 * server action; refresh on success picks up the freshly-revalidated
 * page so the new post slides in at the top.
 */
export function PostComposer({
  authorImage,
  authorName,
}: {
  authorImage: string | null;
  authorName: string | null;
}) {
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Picked once per mount. Memo so the choice survives re-renders.
  const placeholder = useMemo(
    () => PROMPTS[Math.floor(Math.random() * PROMPTS.length)],
    []
  );

  const remaining = POST_BODY_MAX - body.length;
  const overflow = remaining < 0;
  const disabled = isPending || body.trim().length === 0 || overflow;
  const initial = (authorName ?? "?")[0]?.toUpperCase() ?? "?";

  function submit() {
    if (disabled) return;
    setError(null);
    startTransition(async () => {
      const res = await createPost(body);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setBody("");
      router.refresh();
    });
  }

  return (
    <div className="rounded-2xl border border-border bg-card/65 p-4 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-5">
      <div className="flex gap-3">
        {authorImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={authorImage}
            alt=""
            className="size-10 shrink-0 rounded-full border border-border/80 object-cover"
          />
        ) : (
          <div className="grid size-10 shrink-0 place-items-center rounded-full border border-border bg-card/60 text-sm text-muted-foreground">
            {initial}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submit();
            }}
            placeholder={placeholder}
            rows={3}
            maxLength={POST_BODY_MAX + 50 /* let counter go red gently */}
            className="block w-full resize-y rounded-xl border border-border/60 bg-background/40 px-3 py-2.5 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus:border-[var(--vivida-violet)]/60 focus:outline-none focus:ring-1 focus:ring-[var(--vivida-violet)]/40"
            disabled={isPending}
          />
          <div className="mt-2 flex items-center justify-between gap-3">
            <span
              className={`text-xs tabular-nums ${
                overflow
                  ? "text-[var(--vivida-pink)]"
                  : "text-muted-foreground/70"
              }`}
            >
              {remaining}
            </span>
            <div className="flex items-center gap-3">
              {error && (
                <span className="text-xs text-[var(--vivida-pink)]">
                  {error}
                </span>
              )}
              <Button
                onClick={submit}
                disabled={disabled}
                variant="mystic"
                size="sm"
              >
                {isPending ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Send className="size-3.5" />
                )}
                გაგზავნა
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
