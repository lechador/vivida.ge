"use client";

import { useState, useTransition } from "react";
import { Check, Loader2, NotebookPen } from "lucide-react";

import { saveLibraryNote } from "@/actions/library";
import { Button } from "@/components/ui/button";
import { ANALYTICS_EVENT, productEventBase, trackEvent } from "@/lib/analytics";
import type { UserLocale } from "@/lib/i18n/user-locale";

export function LibraryNoteEditor({
  entryId,
  initialNote,
  locale,
}: {
  entryId: string;
  initialNote: string | null;
  locale: UserLocale;
}) {
  const [note, setNote] = useState(initialNote ?? "");
  const [savedNote, setSavedNote] = useState(initialNote ?? "");
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();
  const en = locale === "en";

  return (
    <section className="rounded-3xl border border-border bg-card/55 p-5 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-6">
      <div className="flex items-center gap-2">
        <NotebookPen className="size-5 text-[var(--vivida-cyan)]" />
        <h2 className="font-semibold">{en ? "My note" : "ჩემი ჩანაწერი"}</h2>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        {en
          ? "This note is private and visible only to you."
          : "ეს ჩანაწერი პირადია და მხოლოდ შენ ხედავ."}
      </p>
      <textarea
        value={note}
        onChange={(event) => {
          setNote(event.target.value);
          setSaved(false);
        }}
        maxLength={2000}
        rows={5}
        placeholder={
          en
            ? "What felt important in this reading?"
            : "რა იყო ამ კითხვაში შენთვის მნიშვნელოვანი?"
        }
        className="mt-4 w-full resize-y rounded-2xl border border-border bg-background/35 px-4 py-3 text-sm leading-relaxed outline-none transition-colors placeholder:text-muted-foreground focus:border-[var(--vivida-violet)]/55"
      />
      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="text-xs tabular-nums text-muted-foreground">
          {note.length} / 2000
        </span>
        <Button
          type="button"
          size="sm"
          disabled={pending || note === savedNote}
          onClick={() => {
            startTransition(async () => {
              await saveLibraryNote(entryId, note);
              setSavedNote(note.trim());
              setNote(note.trim());
              setSaved(true);
              // Note content never leaves the device in analytics — only the
              // fact that a (non-empty) note was saved.
              if (note.trim().length > 0) {
                trackEvent(ANALYTICS_EVENT.libraryNoteSaved, {
                  ...productEventBase("library", "library_detail", locale),
                  outcome: "saved",
                });
              }
            });
          }}
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : saved ? (
            <Check className="size-4" />
          ) : (
            <NotebookPen className="size-4" />
          )}
          {pending
            ? en
              ? "Saving…"
              : "ინახება…"
            : saved
              ? en
                ? "Saved"
                : "შენახულია"
              : en
                ? "Save note"
                : "ჩანაწერის შენახვა"}
        </Button>
      </div>
    </section>
  );
}
