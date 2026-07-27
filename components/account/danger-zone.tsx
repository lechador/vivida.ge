"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteAccount } from "@/actions/account";
import {
  DELETE_ACCOUNT_CONFIRM_PHRASE,
  DELETE_ACCOUNT_CONFIRM_PHRASE_EN,
} from "@/lib/account-constants";
import type { UserLocale } from "@/lib/i18n/user-locale";

const DELETION_LIST = [
  "შენი პროფილი, ფოტოები და ბიო",
  "შენი ნატალური რუკა და AI ანალიზები",
  "მიმოწერა და მეგობრობის კავშირები",
  "გამოწერის ისტორია (ფინანსური ჩანაწერების გარდა)",
];
const DELETION_LIST_EN = [
  "Your profile, photos and bio",
  "Your natal chart and AI analyses",
  "Messages and friend connections",
  "Subscription history (except required financial records)",
];

export function DangerZone({ locale = "ka" }: { locale?: UserLocale }) {
  const en = locale === "en";
  const confirmPhrase = en
    ? DELETE_ACCOUNT_CONFIRM_PHRASE_EN
    : DELETE_ACCOUNT_CONFIRM_PHRASE;
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const matches = confirmation.trim() === confirmPhrase;

  const handleDelete = () => {
    setError(null);
    if (!matches) return;
    startTransition(async () => {
      try {
        const result = await deleteAccount({ confirmation });
        // Successful path is a redirect (signOut throws). If we reach the
        // result branch with ok:false, surface the error inline.
        if (result && !result.ok) {
          setError(result.error);
        }
      } catch (err) {
        // Server actions throw NEXT_REDIRECT errors as part of the happy
        // path — those propagate up and the navigation completes. Any
        // other error is real and worth surfacing.
        const message = (err as Error).message;
        if (!message?.includes("NEXT_REDIRECT")) {
          setError(en ? "Something went wrong. Please try again." : "რაღაც შეცდომა მოხდა. სცადე თავიდან.");
        }
      }
    });
  };

  return (
    <div className="rounded-2xl border border-destructive/60 bg-destructive/10 p-6 ring-1 ring-destructive/20 backdrop-blur-xl">
      <div className="mb-2 flex items-center gap-2">
        <AlertTriangle className="size-4 text-destructive" />
        <h2 className="text-base font-semibold text-destructive">
          {en ? "Danger zone" : "საშიში ზონა"}
        </h2>
      </div>
      <p className="mb-5 text-sm text-foreground/75">
        {en
          ? "Deleting your account is permanent and cannot be undone. Your data will be removed immediately."
          : "ანგარიშის წაშლა საბოლოოა და ვერ აღდგება. შენი ყველა მონაცემი წაიშლება დაუყოვნებლივ."}
      </p>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="destructive">
            <Trash2 className="size-4" />
            {en ? "Delete account" : "ანგარიშის წაშლა"}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{en ? "Delete account" : "ანგარიშის წაშლა"}</DialogTitle>
            <DialogDescription>
              {en
                ? "This action cannot be undone. Confirm that you really want to delete your account."
                : "ეს მოქმედება შეუქცევადია. მოწმდება, რომ მართლაც გსურს ანგარიშის წაშლა."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-sm">
            <div>
              <div className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                {en ? "Will be deleted" : "წაიშლება"}
              </div>
              <ul className="space-y-1.5 text-foreground/85">
                {(en ? DELETION_LIST_EN : DELETION_LIST).map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-destructive/70" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <Label htmlFor="delete-confirm">
                {en ? "To confirm, enter" : "დადასტურებისთვის შეიყვანე"}{" "}
                <span className="font-mono font-semibold text-destructive">
                  {confirmPhrase}
                </span>
              </Label>
              <Input
                id="delete-confirm"
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                autoComplete="off"
                placeholder={confirmPhrase}
                disabled={isPending}
              />
            </div>

            {error && (
              <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="ghost"
              onClick={() => {
                setOpen(false);
                setConfirmation("");
                setError(null);
              }}
              disabled={isPending}
            >
              {en ? "Cancel" : "გაუქმება"}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={!matches || isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {en ? "Deleting…" : "იშლება…"}
                </>
              ) : (
                <>
                  <Trash2 className="size-4" />
                  {en ? "Yes, delete it" : "დიახ, წაშალე"}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
