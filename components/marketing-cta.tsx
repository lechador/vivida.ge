"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

/**
 * Keeps public pages statically renderable while upgrading the CTA for signed-in
 * visitors after hydration.
 */
export function MarketingCta() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/auth/session", { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((session) => setIsAuthenticated(Boolean(session?.user)))
      .catch(() => {
        // Keep the public sign-up CTA when the session check is unavailable.
      });

    return () => controller.abort();
  }, []);

  return (
    <Button asChild variant="mystic" size="sm">
      <Link href={isAuthenticated ? "/dashboard" : "/signup"}>
        {isAuthenticated ? "ჩემი სივრცე" : "დაიწყე უფასოდ"}
      </Link>
    </Button>
  );
}
