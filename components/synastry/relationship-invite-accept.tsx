"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { HeartHandshake, Loader2 } from "lucide-react";

import { acceptRelationshipInvite } from "@/actions/relationships";
import { Button } from "@/components/ui/button";
import type { UserLocale } from "@/lib/i18n/user-locale";

export function RelationshipInviteAccept({ token, locale }: { token: string; locale: UserLocale }) {
  const en = locale !== "ka";
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const accept = () => startTransition(async () => {
    setError(null);
    const result = await acceptRelationshipInvite(token);
    if (!result.ok) return setError(result.error);
    router.replace(`/synastry/${result.partnerId}`);
    router.refresh();
  });
  return (
    <div className="mt-6">
      <Button type="button" variant="mystic" size="lg" className="w-full" disabled={isPending} onClick={accept}>
        {isPending ? <Loader2 className="animate-spin" /> : <HeartHandshake />}
        {en ? "Join this relationship" : "ურთიერთობასთან დაკავშირება"}
      </Button>
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
    </div>
  );
}
