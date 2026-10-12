import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { listLibraryEntries } from "@/lib/library";

/**
 * The reader's own recent tarot readings, newest first, shown above the
 * question box so a previous spread can be reopened (reply via follow-up)
 * without digging through the library.
 */
export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const page = await listLibraryEntries(userId, {
    filter: "tarot",
    page: 1,
    pageSize: 10,
  });

  return NextResponse.json({
    items: page.items.map((entry) => ({
      id: entry.id,
      question: entry.summary ?? entry.title,
      headline: entry.title,
      createdAt:
        entry.createdAt instanceof Date
          ? entry.createdAt.toISOString()
          : entry.createdAt,
      ...(entry.content?.type === "tarot" ? { reading: entry.content } : {}),
    })),
  });
}
