import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

/**
 * Unit-test runner (server-side lib logic). Node environment — these tests
 * exercise `lib/{validation,brevo,rate-limit,turnstile}` with `fetch` mocked,
 * never a browser. E2E lives in Playwright (`playwright.config.ts`), so we
 * exclude its specs here.
 */
export default defineConfig({
  resolve: {
    alias: {
      // Mirror the `@/*` path alias from tsconfig.json so tests import the same
      // way the app does.
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts"],
    globals: false,
  },
});
