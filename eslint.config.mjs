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
  {
    rules: {
      // db.transaction() type-checks but throws at runtime on the prod
      // neon-http driver (see db/index.ts); ban it so CI cannot green-light
      // a transaction path that fails in production.
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "CallExpression[callee.type='MemberExpression'][callee.object.name='db'][callee.property.name='transaction']",
          message:
            "db.transaction() is unsupported on the neon-http production driver; use sequential idempotent writes instead (see db/index.ts).",
        },
      ],
    },
  },
]);

export default eslintConfig;
