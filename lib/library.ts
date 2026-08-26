import "server-only";

import {
  and,
  desc,
  eq,
  ilike,
  or,
  sql,
  type SQL,
} from "drizzle-orm";

import { db } from "@/db";
import {
  libraryEntries,
  type LibraryEntry,
  type LibraryEntryContent,
  type LibraryEntryKind,
} from "@/db/schema";

export type LibraryFilter = LibraryEntryKind | "all";

export type LibraryPage = {
  items: LibraryEntry[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  counts: Record<LibraryEntryKind | "all" | "favorites", number>;
};

export async function archiveLibraryEntry(input: {
  userId: string;
  kind: LibraryEntryKind;
  sourceId: string;
  title: string;
  summary?: string | null;
  content: LibraryEntryContent;
  href?: string | null;
  language?: string;
  occurredAt?: Date;
}): Promise<LibraryEntry> {
  const [entry] = await db
    .insert(libraryEntries)
    .values({
      userId: input.userId,
      kind: input.kind,
      sourceId: input.sourceId,
      title: input.title,
      summary: input.summary ?? null,
      content: input.content,
      href: input.href ?? null,
      language: input.language ?? "ka",
      occurredAt: input.occurredAt ?? new Date(),
    })
    .onConflictDoUpdate({
      target: [
        libraryEntries.userId,
        libraryEntries.kind,
        libraryEntries.sourceId,
      ],
      set: {
        title: input.title,
        summary: input.summary ?? null,
        content: input.content,
        href: input.href ?? null,
        language: input.language ?? "ka",
        occurredAt: input.occurredAt ?? new Date(),
        updatedAt: new Date(),
      },
    })
    .returning();

  if (!entry) throw new Error("library entry was not saved");
  return entry;
}

export async function getLibraryEntry(
  userId: string,
  id: string,
): Promise<LibraryEntry | null> {
  const [entry] = await db
    .select()
    .from(libraryEntries)
    .where(and(eq(libraryEntries.id, id), eq(libraryEntries.userId, userId)))
    .limit(1);
  return entry ?? null;
}

export async function listLibraryEntries(
  userId: string,
  options: {
    filter?: LibraryFilter;
    favoritesOnly?: boolean;
    query?: string;
    page?: number;
    pageSize?: number;
  } = {},
): Promise<LibraryPage> {
  const filter = options.filter ?? "all";
  const pageSize = Math.min(Math.max(Math.trunc(options.pageSize ?? 18), 1), 50);
  const requestedPage = Math.max(Math.trunc(options.page ?? 1), 1);
  const conditions: SQL[] = [eq(libraryEntries.userId, userId)];
  if (filter !== "all") conditions.push(eq(libraryEntries.kind, filter));
  if (options.favoritesOnly) conditions.push(eq(libraryEntries.favorite, true));
  const query = options.query?.trim().slice(0, 100);
  if (query) {
    const pattern = `%${query.replaceAll("%", "\\%").replaceAll("_", "\\_")}%`;
    conditions.push(
      or(
        ilike(libraryEntries.title, pattern),
        ilike(libraryEntries.summary, pattern),
        ilike(libraryEntries.note, pattern),
      )!,
    );
  }
  const where = and(...conditions)!;

  const [countRows, groupedRows] = await Promise.all([
    db
      .select({ total: sql<number>`count(*)::int` })
      .from(libraryEntries)
      .where(where),
    db
      .select({
        kind: libraryEntries.kind,
        total: sql<number>`count(*)::int`,
        favorites: sql<number>`count(*) filter (where ${libraryEntries.favorite})::int`,
      })
      .from(libraryEntries)
      .where(eq(libraryEntries.userId, userId))
      .groupBy(libraryEntries.kind),
  ]);
  const total = Number(countRows[0]?.total ?? 0);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(requestedPage, totalPages);
  const items = await db
    .select()
    .from(libraryEntries)
    .where(where)
    .orderBy(desc(libraryEntries.occurredAt), desc(libraryEntries.id))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  const counts: LibraryPage["counts"] = {
    all: 0,
    favorites: 0,
    daily: 0,
    weekly: 0,
    tarot: 0,
    ai: 0,
    report: 0,
  };
  for (const row of groupedRows) {
    const n = Number(row.total);
    counts[row.kind] = n;
    counts.all += n;
    counts.favorites += Number(row.favorites);
  }

  return { items, page, pageSize, total, totalPages, counts };
}
