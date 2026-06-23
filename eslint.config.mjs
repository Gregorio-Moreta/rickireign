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
    "next-env.d.ts",
    // OpenNext/Cloudflare build output + generated types (machine-generated).
    ".open-next/**",
    ".wrangler/**",
    "cloudflare-env.d.ts",
    // Standalone Sanity Studio is its own package with its own tooling.
    "studio/**",
    // Local Vercel build output (from `vercel build`), machine-generated.
    ".vercel/**",
    // Test runner artifacts (Playwright reports/traces, coverage).
    "playwright-report/**",
    "test-results/**",
    "coverage/**",
  ]),
  // Playwright fixtures name their setup param `use` (e.g. `await use(context)`),
  // which the React Hooks rule mistakes for React 19's `use` hook. Tests are not
  // React code — disable the rule there.
  {
    files: ["tests/**/*.ts"],
    rules: { "react-hooks/rules-of-hooks": "off" },
  },
]);

export default eslintConfig;
