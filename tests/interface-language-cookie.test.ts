import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  cookieSet: vi.fn(),
  cookieDelete: vi.fn(),
  host: "www.vividaastro.com",
  dbUpdate: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: async () => ({
    set: mocks.cookieSet,
    delete: mocks.cookieDelete,
  }),
  headers: async () => ({
    get: (name: string) => {
      if (name === "host") return mocks.host;
      return null;
    },
  }),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/auth-helpers", () => ({
  requireUser: async () => ({ id: "user-1" }),
}));

vi.mock("@/db", () => ({
  db: {
    update: (...args: unknown[]) => {
      mocks.dbUpdate(...args);
      return { set: () => ({ where: async () => undefined }) };
    },
  },
}));

const { updateInterfaceLanguage } =
  await import("@/actions/interface-language");

beforeEach(() => {
  vi.clearAllMocks();
  mocks.host = "www.vividaastro.com";
});

describe("updateInterfaceLanguage cookie sync", () => {
  it("clears a stale Polish cookie when switching to Georgian", async () => {
    await expect(updateInterfaceLanguage("ka")).resolves.toEqual({ ok: true });
    expect(mocks.cookieDelete).toHaveBeenCalledWith("vivida_lang");
    expect(mocks.cookieSet).not.toHaveBeenCalled();
  });

  it("keeps syncing the cookie for English and Polish", async () => {
    await updateInterfaceLanguage("pl");
    expect(mocks.cookieSet).toHaveBeenCalledWith(
      "vivida_lang",
      "pl",
      expect.objectContaining({ path: "/" }),
    );

    vi.clearAllMocks();
    await updateInterfaceLanguage("en");
    expect(mocks.cookieSet).toHaveBeenCalledWith(
      "vivida_lang",
      "en",
      expect.objectContaining({ path: "/" }),
    );
    expect(mocks.cookieDelete).not.toHaveBeenCalled();
  });

  it("leaves the cookie alone on the Georgian host", async () => {
    mocks.host = "www.vivida.ge";
    await updateInterfaceLanguage("ka");
    expect(mocks.cookieSet).not.toHaveBeenCalled();
    expect(mocks.cookieDelete).not.toHaveBeenCalled();
  });
});
