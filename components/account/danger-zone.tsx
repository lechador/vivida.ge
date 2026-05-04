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
import { DELETE_ACCOUNT_CONFIRM_PHRASE } from "@/lib/account-constants";

const DELETION_LIST = [
  "შენი პროფილი, ფოტოები და ბიო",
  "შენი ნატალური რუკა და AI ანალიზები",
  "მიმოწერა და მეგობრობის კავშირები",
  "გამოწერის ისტორია (ფინანსური ჩანაწერების გარდა)",
];

export function DangerZone() {
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const matches = confirmation.trim() === DELETE_ACCOUNT_CONFIRM_PHRASE;

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
          setError("რაღაც შეცდომა მოხდა. სცადე თავიდან.");
        }
      }
    });
  };

  return (
    <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-6 backdrop-blur-xl">
      <div className="mb-2 flex items-center gap-2">
        <AlertTriangle className="size-4 text-destructive" />
        <h2 className="text-base font-semibold text-destructive">
          საშიში ზონა
        </h2>
      </div>
      <p className="mb-5 text-sm text-muted-foreground">
        ანგარიშის წაშლა საბოლოოა და ვერ აღდგება. შენი ყველა მონაცემი
        წაიშლება დაუყოვნებლივ.
      </p>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="destructive">
            <Trash2 className="size-4" />
            ანგარიშის წაშლა
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ანგარიშის წაშლა</DialogTitle>
            <DialogDescription>
              ეს მოქმედება შეუქცევადია. მოწმდება, რომ მართლაც გსურს ანგარიშის
              წაშლა.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-sm">
            <div>
              <div className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                წაიშლება
              </div>
              <ul className="space-y-1.5 text-foreground/85">
                {DELETION_LIST.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-destructive/70" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <Label htmlFor="delete-confirm">
                დადასტურებისთვის შეიყვანე{" "}
                <span className="font-mono font-semibold text-destructive">
                  {DELETE_ACCOUNT_CONFIRM_PHRASE}
                </span>
              </Label>
              <Input
                id="delete-confirm"
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                autoComplete="off"
                placeholder={DELETE_ACCOUNT_CONFIRM_PHRASE}
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
              გაუქმება
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={!matches || isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  იშლება…
                </>
              ) : (
                <>
                  <Trash2 className="size-4" />
                  დიახ, წაშალე
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
