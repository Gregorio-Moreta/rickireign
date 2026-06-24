import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";

/**
 * No console errors (or uncaught exceptions) on the key public pages. GA only
 * loads on production hosts and Calendly assets only load on click, so a clean
 * localhost render should be genuinely error-free.
 */

// Benign noise to ignore: a missing favicon variant must not fail the suite.
const IGNORE = [/favicon/i];

function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error" && !IGNORE.some((re) => re.test(msg.text()))) {
      errors.push(`console.error: ${msg.text()}`);
    }
  });
  page.on("pageerror", (err) => {
    if (!IGNORE.some((re) => re.test(err.message))) {
      errors.push(`pageerror: ${err.message}`);
    }
  });
  return errors;
}

test("home, legal, and journal render without console errors", async ({
  page,
}) => {
  const errors = collectErrors(page);

  for (const path of ["/", "/privacy", "/terms", "/journal"]) {
    await page.goto(path, { waitUntil: "load" });
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
  }

  // Visit a real post detail page too.
  await page.goto("/journal", { waitUntil: "load" });
  const postHref = await page
    .locator('main a[href^="/journal/"]')
    .first()
    .getAttribute("href");
  if (postHref) {
    await page.goto(postHref, { waitUntil: "load" });
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
  }

  expect(errors, errors.join("\n")).toEqual([]);
});
