import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E config for the public site.
 *
 * Server target is configurable so the same specs run against BOTH deploy
 * targets' local equivalents:
 *   - default  → `next build && next start` (the Vercel production bundle)
 *   - CF       → `npm run preview` (OpenNext/workerd, the Cloudflare target),
 *                via `E2E_WEB_COMMAND` + `E2E_BASE_URL` (see package.json scripts).
 *
 * Responsive breakpoints (375/768/1024/1440) are exercised inside
 * `responsive.spec.ts` rather than as separate projects, so the form specs (and
 * any real Brevo side-effects) run exactly once, not once per viewport.
 */
const BASE_URL = process.env.E2E_BASE_URL ?? "http://localhost:3000";
const WEB_COMMAND =
  process.env.E2E_WEB_COMMAND ?? "npm run build && npm run start";

/**
 * The real Turnstile site key is domain-locked, so on localhost the live widget
 * logs errors and never solves — which would break the form specs AND the
 * no-console-errors assertion. When `TURNSTILE_TEST_KEYS=1`, boot the server
 * with Cloudflare's official always-pass TEST keys instead: the widget renders
 * cleanly on any host and auto-issues a token, while the route handler still
 * calls the real Brevo API (the public site key is inlined at build time, so it
 * must be set for the `next build` the server runs). Real Brevo/Sanity secrets
 * are loaded by the server itself from the local env file.
 */
const useTestKeys = process.env.TURNSTILE_TEST_KEYS === "1";
const serverEnv: Record<string, string> = useTestKeys
  ? {
      NEXT_PUBLIC_TURNSTILE_SITE_KEY: "1x00000000000000000000AA",
      TURNSTILE_SECRET_KEY: "1x0000000000000000000000000000000AA",
    }
  : {};

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [["html", { open: "never" }], ["list"]],
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: WEB_COMMAND,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: serverEnv,
  },
});
