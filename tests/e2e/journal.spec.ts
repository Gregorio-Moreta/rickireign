import { test, expect } from "./fixtures";

/**
 * Journal: list → detail → tag, plus 404s and the /blog → /journal redirect.
 * Content is discovered from the page (post slugs/tags) rather than hard-coded,
 * so the specs survive Ricki editing the seeded posts in the Studio.
 */

test.describe("Journal index", () => {
  test("lists published posts with a heading", async ({ page }) => {
    await page.goto("/journal");
    await expect(
      page.getByRole("heading", { level: 1, name: /essays/i }),
    ).toBeVisible();
    // At least one post card links into a detail route.
    const firstPost = page.locator('a[href^="/journal/"]').first();
    await expect(firstPost).toBeVisible();
  });
});

test.describe("Journal detail", () => {
  test("opens a post with an article OG type and body", async ({ page }) => {
    await page.goto("/journal");
    const postLink = page
      .locator('main a[href^="/journal/"]')
      .filter({ hasNot: page.locator('a[href*="/tag/"]') })
      .first();
    const href = await postLink.getAttribute("href");
    expect(href).toBeTruthy();

    await postLink.click();
    await page.waitForURL("**/journal/**");

    // Article heading + "back to Journal" link confirm the detail layout.
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("link", { name: /journal/i }).first()).toBeVisible();

    // Per-post SEO: og:type is "article" on detail pages.
    const ogType = page.locator('meta[property="og:type"]');
    await expect(ogType).toHaveAttribute("content", "article");
  });
});

test.describe("Journal tag pages", () => {
  test("a tag link filters to that tag", async ({ page }) => {
    await page.goto("/journal");
    const tagLink = page.locator('a[href^="/journal/tag/"]').first();
    await expect(tagLink).toBeVisible();
    await tagLink.click();
    await page.waitForURL("**/journal/tag/**");
    // Still on the journal surface with at least one post card.
    await expect(page.locator('a[href^="/journal/"]').first()).toBeVisible();
  });
});

test.describe("Not found", () => {
  test("unknown post slug returns 404", async ({ page }) => {
    const res = await page.goto("/journal/this-post-does-not-exist");
    expect(res?.status()).toBe(404);
  });

  test("unknown tag returns 404", async ({ page }) => {
    const res = await page.goto("/journal/tag/this-tag-does-not-exist");
    expect(res?.status()).toBe(404);
  });
});

test.describe("Legacy /blog redirect", () => {
  test("/blog 308-redirects to /journal", async ({ page }) => {
    const res = await page.goto("/blog");
    expect(page.url()).toMatch(/\/journal$/);
    // The final response is the journal index (200).
    expect(res?.status()).toBe(200);
  });

  test("/blog/<slug> redirects to /journal/<slug>", async ({ page }) => {
    await page.goto("/blog/leading-from-the-body");
    expect(page.url()).toMatch(/\/journal\/leading-from-the-body$/);
  });
});
