"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * "Show my result on my public profile" opt-in, shown on a test's result page.
 * Self-contained: reads the current preference on mount (and hides itself for
 * anonymous visitors, who have no profile), and writes changes optimistically.
 */
export function ProfileVisibilityToggle({ kind }: { kind: "mbti" | "iq" }) {
  const [on, setOn] = useState<boolean | null>(null); // null = loading/hidden
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/test-visibility")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (alive && data) setOn(!!data[kind]);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [kind]);

  if (on === null) return null; // anonymous, or still loading

  async function toggle() {
    const next = !on;
    setOn(next);
    setSaving(true);
    try {
      const r = await fetch("/api/test-visibility", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind, visible: next }),
      });
      if (!r.ok) setOn(!next); // revert on failure
    } catch {
      setOn(!next);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-border bg-card/50 px-4 py-3.5 ring-1 ring-foreground/5 backdrop-blur-xl">
      <span className="flex items-center gap-2.5 text-sm text-foreground/85">
        <Eye className="size-4 shrink-0 text-[var(--vivida-cyan)]" />
        გამოაჩინე შედეგი ჩემ საჯარო პროფილზე
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label="საჯარო პროფილზე ჩვენება"
        disabled={saving}
        onClick={toggle}
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors",
          on ? "bg-[var(--vivida-cyan)]" : "bg-border"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-5 rounded-full bg-white transition-transform",
            on ? "translate-x-[22px]" : "translate-x-0.5"
          )}
        />
      </button>
    </div>
  );
}
