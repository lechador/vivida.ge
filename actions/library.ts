"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { db } from "@/db";
import { libraryEntries } from "@/db/schema";

const MAX_NOTE_LENGTH = 2000;

async function currentUserId() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthorized");
  return userId;
}

export async function setLibraryFavorite(id: string, favorite: boolean) {
  const userId = await currentUserId();
  if (!id || id.length > 100) throw new Error("Invalid entry");
  await db
    .update(libraryEntries)
    .set({ favorite, updatedAt: new Date() })
    .where(and(eq(libraryEntries.id, id), eq(libraryEntries.userId, userId)));
  revalidatePath("/library");
  revalidatePath(`/library/${id}`);
  return { ok: true, favorite };
}

export async function saveLibraryNote(id: string, note: string) {
  const userId = await currentUserId();
  if (!id || id.length > 100) throw new Error("Invalid entry");
  const normalized = note.trim().slice(0, MAX_NOTE_LENGTH);
  await db
    .update(libraryEntries)
    .set({ note: normalized || null, updatedAt: new Date() })
    .where(and(eq(libraryEntries.id, id), eq(libraryEntries.userId, userId)));
  revalidatePath("/library");
  revalidatePath(`/library/${id}`);
  return { ok: true };
}
