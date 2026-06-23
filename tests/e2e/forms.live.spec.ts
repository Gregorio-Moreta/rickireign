import { test, expect } from "./fixtures";

/**
 * LIVE form flows — exercise the real Brevo stack end-to-end.
 *
 * Gated behind `RUN_LIVE_FORMS=1` (set by `npm run test:e2e:live`) because the
 * happy paths send real email (a DOI confirmation + a transactional contact
 * message). The server must be booted with Cloudflare's always-pass Turnstile
 * TEST keys (`TURNSTILE_TEST_KEYS=1`) so the widget auto-solves on localhost.
 *
 * The happy-path newsletter uses a unique +tagged address so each run is a fresh
 * contact (and the DOI still lands in the same real inbox for manual checking).
 */
const LIVE = process.env.RUN_LIVE_FORMS === "1";

const BASE_TEST_EMAIL =
  process.env.LIVE_TEST_EMAIL ?? "gregorioe.moreta@gmail.com";

function uniqueEmail(): string {
  const [local, domain] = BASE_TEST_EMAIL.split("@");
  return `${local}+e2e-${Date.now()}@${domain}`;
}

/** Wait for the always-pass Turnstile test widget to issue its token. */
async function waitForTurnstile(page: import("@playwright/test").Page) {
  await expect(async () => {
    const value = await page
      .locator('input[name="cf-turnstile-response"]')
      .first()
      .inputValue();
    expect(value.length).toBeGreaterThan(0);
  }).toPass({ timeout: 15_000 });
}

test.describe("Newsletter (live Brevo DOI)", () => {
  test.skip(!LIVE, "live form test — run with RUN_LIVE_FORMS=1");

  test("happy path → DOI confirmation, shows 'check your inbox'", async ({
    page,
  }) => {
    await page.goto("/#newsletter");
    const form = page.getByRole("form", { name: /newsletter/i });
    await form.getByLabel(/email/i).fill(uniqueEmail());
    await waitForTurnstile(page);
    await form.getByRole("button", { name: /subscribe/i }).click();

    await expect(page.getByRole("status")).toContainText(/check your inbox/i);
  });

  test("invalid email → inline error, no send", async ({ page }) => {
    await page.goto("/#newsletter");
    const form = page.getByRole("form", { name: /newsletter/i });
    // Format-valid for the browser but > 254 chars, so the server's zod rejects
    // it before any Brevo call.
    await form
      .getByLabel(/email/i)
      .fill(`${"a".repeat(250)}@example.com`);
    await waitForTurnstile(page);
    await form.getByRole("button", { name: /subscribe/i }).click();

    // Scope to the form's alert (Next's route announcer is also role="alert").
    await expect(form.getByRole("alert")).toContainText(/valid email/i);
  });
});

test.describe("Contact (live Brevo transactional)", () => {
  test.skip(!LIVE, "live form test — run with RUN_LIVE_FORMS=1");

  test("submit → success message", async ({ page }) => {
    await page.goto("/#connect");
    const form = page.getByRole("form", { name: /contact/i });
    await form.getByLabel("Name").fill("E2E Test");
    await form.getByLabel("Email").fill(uniqueEmail());
    await form
      .getByLabel("Message")
      .fill("Automated E2E smoke test — please ignore.");
    await waitForTurnstile(page);
    await form.getByRole("button", { name: /send message/i }).click();

    await expect(page.getByRole("status")).toContainText(/on its way/i);
  });
});
