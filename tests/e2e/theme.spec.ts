import { test, expect } from "./fixtures";

/**
 * Light/dark theme: the nav toggle flips the `dark` class on <html> and the
 * choice persists across reloads. (Playwright's default colorScheme is light,
 * so the page starts light.)
 */
test.describe("Theme toggle", () => {
  test("flips the theme and persists across reload", async ({ page }) => {
    await page.goto("/");
    const html = page.locator("html");
    await expect(html).not.toHaveClass(/dark/);

    await page
      .getByRole("button", { name: /switch to dark theme/i })
      .first()
      .click();
    await expect(html).toHaveClass(/dark/);

    await page.reload();
    await expect(html).toHaveClass(/dark/);

    await page
      .getByRole("button", { name: /switch to light theme/i })
      .first()
      .click();
    await expect(html).not.toHaveClass(/dark/);
  });
});
