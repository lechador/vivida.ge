import sharp from "sharp";
import { afterEach, expect, it, vi } from "vitest";

import { generateZodiacAvatar } from "@/lib/avatar-gen";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

it("converts provider JPEG output to PNG for avatar storage", async () => {
  vi.stubEnv("OPENROUTER_API_KEY", "test-key");
  const jpeg = await sharp({
    create: {
      width: 16,
      height: 16,
      channels: 3,
      background: "#a78bfa",
    },
  })
    .jpeg()
    .toBuffer();
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                images: [
                  {
                    image_url: {
                      url: `data:image/jpeg;base64,${jpeg.toString("base64")}`,
                    },
                  },
                ],
              },
            },
          ],
        }),
      ),
    ),
  );

  const result = await generateZodiacAvatar("leo");
  expect(result).not.toBeNull();
  expect((await sharp(result!).metadata()).format).toBe("png");
  expect(result!.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
});
