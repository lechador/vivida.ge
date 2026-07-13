"use client";

import { useState } from "react";
import { Check, Loader2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";

type Result = { uploaded: { id: string; url: string }[]; failed: { id: string; error: string }[] };

/** One-click trigger for the fixed production R2 quiz-asset seed. */
export function QuizAssetsSeed() {
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function seed() {
    setPending(true);
    setResult(null);
    setError(null);
    try {
      const response = await fetch("/api/admin/quiz-assets/zodiac-famous", { method: "POST" });
      const data = (await response.json()) as Result & { error?: string };
      if (!response.ok) throw new Error(data.error ?? "ატვირთვა ვერ მოხერხდა");
      setResult(data);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "ატვირთვა ვერ მოხერხდა");
    } finally {
      setPending(false);
    }
  }

  return <div className="rounded-3xl border border-border bg-card/60 p-6 ring-1 ring-foreground/5 sm:p-8">
    <h1 className="text-xl font-semibold tracking-tight">ქვიზის ფოტოები</h1>
    <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">ჩამოტვირთავს წინასწარ დამოწმებულ Wikimedia Commons ფოტოებს და შეინახავს მათ R2-ში. პროცესი უსაფრთხოდ შეიძლება განმეორდეს.</p>
    <Button type="button" variant="mystic" className="mt-5 gap-2" onClick={seed} disabled={pending}>
      {pending ? <Loader2 className="size-4 animate-spin" /> : result && result.failed.length === 0 ? <Check className="size-4" /> : <Upload className="size-4" />}
      {pending ? "იტვირთება…" : "R2-ში ატვირთვა"}
    </Button>
    {error && <p className="mt-4 text-sm text-rose-400">{error}</p>}
    {result && <div className="mt-5 rounded-2xl border border-border bg-background/35 p-4 text-sm"><p className="font-medium text-emerald-400">ატვირთულია: {result.uploaded.length} ფოტო</p>{result.failed.length > 0 && <p className="mt-2 text-rose-400">ვერ აიტვირთა: {result.failed.map((item) => item.id).join(", ")}</p>}</div>}
  </div>;
}
