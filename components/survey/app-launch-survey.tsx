"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Smartphone } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FEEDBACK_MAX, type SurveyChoice } from "@/lib/survey-config";

type Bootstrap = { surveyKey: string; locale: "ka" | "en" };

/** Let the page paint and settle before interrupting. */
const OPEN_DELAY_MS = 2500;

/**
 * Routes where a popup would hijack something the user is mid-way through.
 * Signing up and onboarding are the ones that actually cost us if interrupted;
 * the survey simply waits for the next page view.
 */
const MUTED_PREFIXES = ["/signup", "/onboarding", "/api"];

const COPY = {
  ka: {
    title: "სექტემბრიდან ვივიდას მობილურის აპლიკაცია ჩაეშვება",
    body: "გაგვიზიარე შენი აზრი ჩვენს პლატფორმასთან დაკავშირებით, რას შეცვლიდი, რას დაამატებდი.",
    question: "ჩამოტვირთავ აპლიკაციას?",
    choices: {
      yes: "აუცილებლად",
      maybe: "შესაძლოა",
      web: "ვებგვერდი მირჩევნია",
    },
    placeholder: "რას შეცვლიდი ან დაამატებდი? (არასავალდებულო)",
    skip: "გამოტოვება",
    send: "გაგზავნა",
    sending: "იგზავნება…",
    optional: "შევსება არასავალდებულოა — ფანჯარა მხოლოდ ერთხელ გამოჩნდება.",
    thanksTitle: "მადლობა!",
    thanksBody: "შენი აზრი მიღებულია და აპლიკაციის შექმნისას გავითვალისწინებთ.",
    close: "დახურვა",
  },
  en: {
    title: "The Vivida mobile app launches in September",
    body: "Tell us what you think of the platform — what would you change, what would you add?",
    question: "Will you install the app?",
    choices: {
      yes: "Definitely",
      maybe: "Maybe",
      web: "I prefer the website",
    },
    placeholder: "What would you change or add? (optional)",
    skip: "Skip",
    send: "Send",
    sending: "Sending…",
    optional: "Answering is optional — this only appears once.",
    thanksTitle: "Thank you!",
    thanksBody: "We've got your feedback and will use it while building the app.",
    close: "Close",
  },
} as const;

const CHOICE_ORDER: SurveyChoice[] = ["yes", "maybe", "web"];

/**
 * One-shot "mobile app is coming" survey.
 *
 * Mounted from the root layout and deliberately client-side, exactly like
 * ChatShell: it resolves auth by fetching after hydration (204 for anonymous
 * visitors and for anyone who has already met it), so public/SEO pages stay
 * statically prerendered. Once-per-user is enforced server-side by the
 * survey_response row, not by storage the user can clear.
 */
export function AppLaunchSurvey() {
  const pathname = usePathname();
  const [survey, setSurvey] = useState<Bootstrap | null>(null);
  const [open, setOpen] = useState(false);
  const [choice, setChoice] = useState<SurveyChoice | null>(null);
  const [feedback, setFeedback] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  /** Guards against a second write when React re-runs effects (StrictMode). */
  const recorded = useRef(false);

  const muted = MUTED_PREFIXES.some((p) => pathname?.startsWith(p));

  useEffect(() => {
    if (muted) return;
    let alive = true;
    fetch("/api/survey/app-launch", { headers: { accept: "application/json" } })
      .then((r) => (r.ok && r.status !== 204 ? r.json() : null))
      .then((d: Bootstrap | null) => {
        if (alive && d?.surveyKey) setSurvey(d);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [muted]);

  // Open on a delay, and mark it shown the moment it actually appears — that
  // write is what spends the user's single showing, so it happens here rather
  // than on fetch (a user who never sees it shouldn't burn their turn).
  useEffect(() => {
    if (!survey || open || recorded.current) return;
    const t = setTimeout(() => {
      recorded.current = true;
      setOpen(true);
      void send("shown");
    }, OPEN_DELAY_MS);
    return () => clearTimeout(t);
  }, [survey, open]);

  async function send(
    action: "shown" | "dismissed" | "submitted",
    payload?: { choice: SurveyChoice | null; feedback: string }
  ) {
    try {
      await fetch("/api/survey/app-launch", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action,
          choice: payload?.choice ?? null,
          feedback: payload?.feedback?.trim() || null,
        }),
        keepalive: true,
      });
    } catch {
      // Best-effort: a failed write only risks showing the survey once more.
    }
  }

  /** Any close that isn't a submit — X, Esc, backdrop, or the skip button. */
  function dismiss() {
    setOpen(false);
    if (!done) void send("dismissed");
  }

  function submit() {
    setSending(true);
    void send("submitted", { choice, feedback }).then(() => {
      setSending(false);
      setDone(true);
      // Let the thank-you land, then get out of the way.
      setTimeout(() => setOpen(false), 2200);
    });
  }

  if (!survey) return null;
  const t = COPY[survey.locale] ?? COPY.ka;
  const canSubmit = !!choice || feedback.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? setOpen(true) : dismiss())}>
      <DialogContent className="max-w-md">
        {done ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl">{t.thanksTitle}</DialogTitle>
              <DialogDescription>{t.thanksBody}</DialogDescription>
            </DialogHeader>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setOpen(false)}>
                {t.close}
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <div className="mb-1 flex size-11 items-center justify-center rounded-xl bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink))] text-white">
                <Smartphone className="size-5" />
              </div>
              <DialogTitle className="text-xl">{t.title}</DialogTitle>
              <DialogDescription>{t.body}</DialogDescription>
            </DialogHeader>

            <div>
              <p className="mb-2 text-sm font-medium text-foreground">
                {t.question}
              </p>
              <div className="flex flex-wrap gap-2">
                {CHOICE_ORDER.map((c) => (
                  <button
                    key={c}
                    type="button"
                    aria-pressed={choice === c}
                    onClick={() => setChoice(choice === c ? null : c)}
                    className={cn(
                      "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      choice === c
                        ? "border-[var(--vivida-violet)] bg-[var(--vivida-violet)]/15 text-foreground"
                        : "border-border text-muted-foreground hover:bg-accent/10 hover:text-foreground"
                    )}
                  >
                    {t.choices[c]}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              maxLength={FEEDBACK_MAX}
              rows={4}
              placeholder={t.placeholder}
              className="w-full resize-none rounded-lg border border-border bg-card/60 p-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
            />

            <p className="-mt-1 text-xs text-muted-foreground">{t.optional}</p>

            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={dismiss}>
                {t.skip}
              </Button>
              <Button variant="mystic" onClick={submit} disabled={sending || !canSubmit}>
                {sending ? t.sending : t.send}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
