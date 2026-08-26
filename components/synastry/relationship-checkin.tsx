"use client";

import { useState, useTransition } from "react";
import { Check, Loader2, MessageCircleHeart, Send } from "lucide-react";

import { saveRelationshipAnswer } from "@/actions/relationships";
import { Button } from "@/components/ui/button";
import type { RelationshipWeeklyJson } from "@/db/schema";
import type { UserLocale } from "@/lib/i18n/user-locale";
import type { RelationshipAnswerView } from "@/lib/relationship-core";

export function RelationshipCheckin({
  partnerId,
  weekStart,
  questions,
  initialAnswers,
  currentUserId,
  connected,
  locale,
}: {
  partnerId: string;
  weekStart: string;
  questions: RelationshipWeeklyJson["questions"];
  initialAnswers: RelationshipAnswerView[];
  currentUserId: string;
  connected: boolean;
  locale: UserLocale;
}) {
  const en = locale !== "ka";
  const [answers, setAnswers] = useState(initialAnswers);
  const [drafts, setDrafts] = useState<Record<string, string>>(() => Object.fromEntries(
    questions.map((question) => [
      question.key,
      initialAnswers.find((answer) => answer.questionKey === question.key && answer.userId === currentUserId)?.answer ?? "",
    ]),
  ));
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const save = (questionKey: string) => startTransition(async () => {
    setSavingKey(questionKey);
    setError(null);
    const result = await saveRelationshipAnswer(partnerId, weekStart, questionKey, drafts[questionKey] ?? "");
    setSavingKey(null);
    if (!result.ok) return setError(result.error);
    setAnswers((current) => {
      const own = current.find((answer) => answer.questionKey === questionKey && answer.userId === currentUserId);
      const next = current.filter((answer) => !(answer.questionKey === questionKey && answer.userId === currentUserId));
      return [...next, {
        questionKey,
        userId: currentUserId,
        answer: drafts[questionKey].trim(),
        name: own?.name ?? (en ? "You" : "შენ"),
      }];
    });
    setSavedKey(questionKey);
    window.setTimeout(() => setSavedKey(null), 1600);
  });

  return (
    <div className="mt-6 border-t border-border/60 pt-5">
      <div className="flex items-center gap-2">
        <MessageCircleHeart className="size-5 text-[var(--vivida-pink)]" aria-hidden />
        <h3 className="font-semibold">{en ? "Questions for both of you" : "კითხვები ორივესთვის"}</h3>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        {connected
          ? en ? "Your answers are visible only to the two participants in this relationship." : "პასუხებს მხოლოდ ამ ურთიერთობის ორი მონაწილე ხედავს."
          : en ? "Answer now, then invite your partner so they can add theirs." : "უპასუხე ახლა, შემდეგ მოიწვიე პარტნიორი თავისი პასუხის დასამატებლად."}
      </p>

      <div className="mt-4 space-y-4">
        {questions.map((question, index) => {
          const questionAnswers = answers.filter((answer) => answer.questionKey === question.key);
          return (
            <div key={question.key} className="rounded-xl border border-border/60 bg-background/30 p-4">
              <div className="flex gap-3">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[var(--vivida-violet)]/15 text-xs font-semibold text-[var(--vivida-violet)]">{index + 1}</span>
                <p className="pt-0.5 text-sm font-medium leading-relaxed">{question.text}</p>
              </div>
              {questionAnswers.filter((answer) => answer.userId !== currentUserId).map((answer) => (
                <blockquote key={answer.userId} className="ml-10 mt-3 rounded-lg border-l-2 border-[var(--vivida-cyan)] bg-[var(--vivida-cyan)]/5 px-3 py-2 text-sm leading-relaxed">
                  <span className="mb-1 block text-xs font-medium text-[var(--vivida-cyan)]">{answer.name}</span>
                  {answer.answer}
                </blockquote>
              ))}
              <div className="ml-10 mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
                <textarea
                  value={drafts[question.key] ?? ""}
                  onChange={(event) => setDrafts((current) => ({ ...current, [question.key]: event.target.value.slice(0, 500) }))}
                  maxLength={500}
                  rows={2}
                  placeholder={en ? "Your answer…" : "შენი პასუხი…"}
                  className="min-h-20 flex-1 resize-y rounded-xl border border-border bg-background/55 px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-[var(--vivida-violet)]"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isPending || !(drafts[question.key] ?? "").trim()}
                  onClick={() => save(question.key)}
                >
                  {savingKey === question.key ? <Loader2 className="animate-spin" /> : savedKey === question.key ? <Check /> : <Send />}
                  {savedKey === question.key ? (en ? "Saved" : "შენახულია") : (en ? "Save" : "შენახვა")}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
    </div>
  );
}
