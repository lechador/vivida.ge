"use client";

import { LogOut } from "lucide-react";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { signOutAction } from "@/actions/auth";

export function SignOutButton() {
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={isPending}
      onClick={() => startTransition(() => signOutAction())}
    >
      <LogOut className="size-4" />
      გასვლა
    </Button>
  );
}
