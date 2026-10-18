import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  update: vi.fn(),
  set: vi.fn(),
  where: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@/auth", () => ({ auth: mocks.auth }));
vi.mock("@/db", () => ({ db: { update: mocks.update } }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));

import { libraryEntries } from "@/db/schema";
import { saveLibraryNote, setLibraryFavorite } from "@/actions/library";

beforeEach(() => {
  mocks.auth.mockResolvedValue({ user: { id: "user-1" } });
  mocks.where.mockResolvedValue(undefined);
  mocks.set.mockReturnValue({ where: mocks.where });
  mocks.update.mockReturnValue({ set: mocks.set });
});

describe("setLibraryFavorite", () => {
  it("rejects anonymous callers without touching the database", async () => {
    mocks.auth.mockResolvedValue(null);

    await expect(setLibraryFavorite("entry-1", true)).rejects.toThrow("Unauthorized");
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it("rejects missing or oversized entry ids", async () => {
    await expect(setLibraryFavorite("", true)).rejects.toThrow("Invalid entry");
    await expect(setLibraryFavorite("x".repeat(101), true)).rejects.toThrow("Invalid entry");
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it("scopes the update to the owner's entry and revalidates library routes", async () => {
    await expect(setLibraryFavorite("entry-1", true)).resolves.toEqual({
      ok: true,
      favorite: true,
    });

    expect(mocks.update).toHaveBeenCalledWith(libraryEntries);
    expect(mocks.set).toHaveBeenCalledWith(
      expect.objectContaining({ favorite: true }),
    );
    expect(mocks.where).toHaveBeenCalledOnce();
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/library");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/library/entry-1");
  });
});

describe("saveLibraryNote", () => {
  it("rejects anonymous callers without touching the database", async () => {
    mocks.auth.mockResolvedValue(null);

    await expect(saveLibraryNote("entry-1", "hello")).rejects.toThrow("Unauthorized");
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it("rejects missing or oversized entry ids", async () => {
    await expect(saveLibraryNote("", "hello")).rejects.toThrow("Invalid entry");
    await expect(saveLibraryNote("x".repeat(101), "hello")).rejects.toThrow("Invalid entry");
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it("trims notes and caps them at 2000 characters", async () => {
    await saveLibraryNote("entry-1", "  hello  ");
    expect(mocks.set).toHaveBeenCalledWith(
      expect.objectContaining({ note: "hello" }),
    );

    await saveLibraryNote("entry-1", "y".repeat(2500));
    const saved = mocks.set.mock.calls.at(-1)?.[0] as { note: string };
    expect(saved.note).toHaveLength(2000);
  });

  it("clears the note when only whitespace remains", async () => {
    await expect(saveLibraryNote("entry-1", "   ")).resolves.toEqual({ ok: true });
    expect(mocks.set).toHaveBeenCalledWith(
      expect.objectContaining({ note: null }),
    );
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/library");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/library/entry-1");
  });
});
