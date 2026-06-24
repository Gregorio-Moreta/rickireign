import { test, expect } from "./fixtures";

/**
 * In-page navigation: SectionLink smooth-scroll on home (clean URL), the
 * Journal route link, cross-route section nav from /privacy, and the mobile menu.
 */

test.describe("Home in-page nav", () => {
  test("a section link scrolls in place and keeps the URL clean", async ({
    page,
  }) => {
    await page.goto("/");
    const sectionLink = page
      .locator('header nav a[href^="/#"]')
      .first();
    const href = await sectionLink.getAttribute("href");
    const id = href!.replace("/#", "");

    await sectionLink.click();

    // URL stays clean (no hash) on the home page.
    await expect(page).toHaveURL(/\/$/);
    // Target section is scrolled into view.
    await expect(page.locator(`#${id}`)).toBeInViewport({ ratio: 0.1 });
  });

  test("the Journal link routes to /journal", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Journal", exact: true }).first().click();
    await expect(page).toHaveURL(/\/journal$/);
    await expect(
      page.getByRole("heading", { level: 1, name: /essays/i }),
    ).toBeVisible();
  });
});

test.describe("Cross-route nav", () => {
  test("a section link from /privacy returns to the home page", async ({
    page,
  }) => {
    await page.goto("/privacy");
    await page.locator('header nav a[href^="/#"]').first().click();
    // Lands back on the single-scroll home (HashScroll strips the hash on arrival).
    await expect(page).toHaveURL(/\/(#.*)?$/);
    // A home-only section confirms we left /privacy for the single-scroll home.
    await expect(page.locator("#practice")).toBeAttached();
  });
});

test.describe("Mobile nav", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("the menu toggle opens and routes to Journal", async ({ page }) => {
    await page.goto("/");
    const toggle = page.getByRole("button", { name: /open menu/i });
    await toggle.click();
    const mobilePanel = page.locator("#mobile-nav");
    await expect(mobilePanel).toBeVisible();
    await mobilePanel.getByRole("link", { name: "Journal", exact: true }).click();
    await expect(page).toHaveURL(/\/journal$/);
  });
});
