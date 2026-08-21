import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    // Generated/runtime copies are not source. Scanning them made a normal
    // lint consume 4+ GB and report third-party bundle errors.
    ".claude/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
