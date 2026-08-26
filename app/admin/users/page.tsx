import { desc, eq, ilike, or, sql } from "drizzle-orm";
import { BadgeCheck, Search } from "lucide-react";

import { AdminUserRow } from "@/components/admin/admin-user-row";
import { db } from "@/db";
import { profiles, users } from "@/db/schema";

export const metadata = { title: "მომხმარებლები · ადმინი" };
export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q: rawQuery } = await searchParams;
  const query = rawQuery?.trim().slice(0, 100) ?? "";
  const pattern = `%${query.replace(/[%_]/g, (value) => `\\${value}`)}%`;
  const search = query
    ? or(
        ilike(users.email, pattern),
        ilike(users.name, pattern),
        ilike(profiles.username, pattern),
        ilike(profiles.displayName, pattern),
      )
    : undefined;

  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      username: profiles.username,
      createdAt: users.createdAt,
      premiumActive: sql<boolean>`coalesce(${users.isPremium} and ${users.premiumUntil} > now(), false)`,
      verifiedBadgeGrantedAt: users.verifiedBadgeGrantedAt,
      verifiedBadgeGrantedBy: users.verifiedBadgeGrantedBy,
      verifiedBadgeEmailSentAt: users.verifiedBadgeEmailSentAt,
    })
    .from(users)
    .leftJoin(profiles, eq(profiles.userId, users.id))
    .where(search)
    .orderBy(
      sql`${users.verifiedBadgeGrantedAt} desc nulls last`,
      desc(users.createdAt),
    )
    .limit(100);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <BadgeCheck className="size-5 text-[var(--vivida-cyan)]" />
          <h1 className="text-2xl font-semibold tracking-tight">მომხმარებლები</h1>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          ხელით აჩუქე Verified Badge. ეს მხოლოდ იდენტობის ნიშანია და Premium ფუნქციებს არ რთავს.
        </p>
      </div>

      <form className="mb-6 flex max-w-xl gap-2" action="/admin/users">
        <label className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <span className="sr-only">მომხმარებლის ძებნა</span>
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="ელფოსტა, სახელი ან username"
            className="h-10 w-full rounded-lg border border-border bg-card/50 pl-9 pr-3 text-sm outline-none focus:border-[var(--vivida-violet)]"
          />
        </label>
        <button
          type="submit"
          className="h-10 rounded-lg bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          ძებნა
        </button>
      </form>

      <div className="mb-3 text-xs text-muted-foreground">
        {query ? `ნაპოვნია ${rows.length}` : `ბოლო ${rows.length} მომხმარებელი`}
      </div>
      {rows.length ? (
        <ul className="space-y-2">
          {rows.map((user) => (
            <AdminUserRow
              key={user.id}
              user={user}
              premiumActive={user.premiumActive}
            />
          ))}
        </ul>
      ) : (
        <div className="rounded-xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
          მომხმარებელი ვერ მოიძებნა.
        </div>
      )}
    </main>
  );
}
