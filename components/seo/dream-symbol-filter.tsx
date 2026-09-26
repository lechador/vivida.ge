"use client";

import { useState } from "react";

const INDEX_ID = "dream-symbol-index";

function filterSymbols(query: string): number {
  const index = document.getElementById(INDEX_ID);
  if (!index) return 0;
  const term = query.trim().toLocaleLowerCase();
  let visible = 0;
  for (const group of index.querySelectorAll<HTMLElement>(
    "[data-dream-group]",
  )) {
    let groupVisible = 0;
    for (const item of group.querySelectorAll<HTMLElement>(
      "[data-dream-symbol]",
    )) {
      const match = !term || (item.dataset.dreamSymbol ?? "").includes(term);
      item.classList.toggle("hidden", !match);
      if (match) groupVisible++;
    }
    group.classList.toggle("hidden", groupVisible === 0);
    visible += groupVisible;
  }
  return visible;
}

export function DreamSymbolFilter() {
  const [query, setQuery] = useState("");
  const [resultCount, setResultCount] = useState<number | null>(null);

  function update(value: string) {
    setQuery(value);
    setResultCount(filterSymbols(value));
  }

  return (
    <div className="mb-7 rounded-2xl border border-border bg-card/50 p-4 ring-1 ring-foreground/5">
      <label
        htmlFor="dream-symbol-search"
        className="block text-sm font-medium"
      >
        მოძებნე სიზმრის სიმბოლო
      </label>
      <div className="mt-2 flex gap-2">
        <input
          id="dream-symbol-search"
          type="search"
          value={query}
          onChange={(event) => update(event.target.value)}
          placeholder="მაგალითად: გველი ან gveli"
          autoComplete="off"
          className="min-w-0 flex-1 rounded-xl border border-border bg-background/60 px-3 py-2.5 text-sm outline-none focus-visible:border-[var(--vivida-violet)] focus-visible:ring-2 focus-visible:ring-[var(--vivida-violet)]/30"
        />
        {query && (
          <button
            type="button"
            onClick={() => update("")}
            className="rounded-xl border border-border px-3 text-sm hover:bg-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--vivida-violet)]"
          >
            გასუფთავება
          </button>
        )}
      </div>
      <p role="status" className="mt-2 text-sm text-muted-foreground">
        {resultCount === 0 ? "ვერ მოიძებნა — სცადე სხვა სიტყვა" : ""}
      </p>
    </div>
  );
}
