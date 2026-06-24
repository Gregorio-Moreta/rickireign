import { test as base, expect } from "@playwright/test";

/**
 * Shared E2E test base. Pre-seeds the cookie-consent choice so the consent modal
 * (a full-screen scrim that intercepts pointer events) never blocks interaction.
 * "denied" keeps GA off, so pages stay free of analytics console noise. The
 * cookie is domain-scoped (not port-scoped), so it works against both the
 * `next start` server (:3000) and the Cloudflare preview (:8787).
 */
export const test = base.extend({
  context: async ({ context }, use) => {
    await context.addCookies([
      { name: "rr-consent", value: "denied", domain: "localhost", path: "/" },
    ]);
    await use(context);
  },
});

export { expect };
