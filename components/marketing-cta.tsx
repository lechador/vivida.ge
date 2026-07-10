"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Auth-aware CTA for the (now-static) public header. Renders "დაიწყე უფასოდ"
 * for everyone at build time — so the pages stay statically prerendered — and
 * upgrades to an "open app" link after hydration if the visitor is signed in.
 * The session check is a tiny non-blocking fetch; failure just keeps the
 * signup CTA. This is what lets every marketing/SEO page be CDN-static.
 */
export function MarketingCta() {
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/auth/session", { headers: { accept: "application/json" } })
      .then((r) => (r.ok ? r.json() : null))
      .then((s) => {
        if (alive && s?.user) setAuthed(true);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  if (authed) {
    return (
      <Button asChild variant="mystic" size="sm">
        <Link href="/feed">
          აპლიკაცია
          <ArrowRight className="size-4" />
        </Link>
      </Button>
    );
  }
  return (
    <Button asChild variant="mystic" size="sm">
      <Link href="/signup">დაიწყე უფასოდ</Link>
    </Button>
  );
}
