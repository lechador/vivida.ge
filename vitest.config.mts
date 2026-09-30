import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
      // `server-only` throws by design outside the react-server condition;
      // unit tests import server modules directly, so stub it out.
      "server-only": fileURLToPath(
        new URL("./tests/stubs/server-only.ts", import.meta.url),
      ),
    },
  },
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
    clearMocks: true,
    restoreMocks: true,
  },
});
